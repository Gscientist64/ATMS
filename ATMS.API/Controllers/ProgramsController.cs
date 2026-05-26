using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using ATMS.API.Data;
using ATMS.API.DTOs;
using ATMS.API.Models;
using ATMS.API.Services;
using System.Text;
using Microsoft.Extensions.Hosting;

namespace ATMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Programs")]
    public class ProgramsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly ILogger<ProgramsController> _logger;
        private readonly IWebHostEnvironment _environment;
        private readonly IUserService _userService;
        private readonly IConfigurationService _configurationService;

        public ProgramsController(
            ApplicationDbContext context,
            INotificationService notificationService,
            ILogger<ProgramsController> logger,
            IWebHostEnvironment environment,
            IUserService userService,
            IConfigurationService configurationService)
        {
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
            _environment = environment;
            _userService = userService;
            _configurationService = configurationService;
        }

        // GET: api/Programs/dashboard
        [HttpGet("dashboard")]
        [Authorize(Roles = "Programs")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var assignedStates = await GetUserAssignedStates();
                
                // Get staff IDs from assigned states
                var staffIds = await _context.Users
                    .Where(u => u.Role.Name == "AdHoc" && (assignedStates.Count == 0 || assignedStates.Contains(u.State ?? "")))
                    .Select(u => u.Id)
                    .ToListAsync();
                
                // Get all timesheets that have been approved by Facility Supervisor (status = "ProgramsReview")
                var pendingTimesheets = await _context.Timesheets
                    .Include(t => t.User)
                    .Where(t => staffIds.Contains(t.UserId) && t.Status == "ProgramsReview")
                    .OrderByDescending(t => t.SubmittedAt)
                    .Select(t => new
                    {
                        id = t.Id,
                        staffName = t.User != null ? t.User.FullName : "",
                        staffState = t.User != null ? t.User.State : "",
                        monthYear = $"{t.Month} {t.Year}",
                        submissionDate = t.SubmittedAt.ToString("dd-MM-yyyy"),
                        status = t.Status,
                        contractStatus = t.User != null ? t.User.ContractStatus : "Active"
                    })
                    .ToListAsync();

                // Count approved timesheets for current month
                var now = DateTime.UtcNow;
                var approvedThisMonth = await _context.Timesheets
                    .CountAsync(t => staffIds.Contains(t.UserId) && 
                        t.Status == "Approved" && 
                        t.SubmittedAt.Month == now.Month && 
                        t.SubmittedAt.Year == now.Year);

                // Count PIP recommendations
                var pipRecommended = await _context.Advisories
                    .CountAsync(a => staffIds.Contains(a.TargetUserId) && 
                        a.AdvisoryType == "PIP" && a.Status == "Pending");

                // Count contract reviews required (expiring within 30 days)
                var thirtyDaysFromNow = DateTime.UtcNow.AddDays(30);
                var contractReviewRequired = await _context.Users
                    .CountAsync(u => staffIds.Contains(u.Id) && 
                        u.ContractEndDate.HasValue && 
                        u.ContractEndDate.Value <= thirtyDaysFromNow && 
                        u.ContractEndDate.Value >= DateTime.UtcNow);

                // Count supervisees
                var superviseesCount = staffIds.Count;

                return Ok(new
                {
                    pendingTimesheets = pendingTimesheets.Count,
                    approvedThisMonth = approvedThisMonth,
                    pipRecommended = pipRecommended,
                    contractReviewRequired = contractReviewRequired,
                    superviseesCount = superviseesCount,
                    activeTimesheets = pendingTimesheets
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Programs dashboard");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/Programs/personnel
        [HttpGet("personnel")]
        public async Task<IActionResult> GetPersonnel([FromQuery] string? search = null, [FromQuery] string? state = null, [FromQuery] string? status = null)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                
                var query = _context.Users
                    .Include(u => u.Role)
                    .Where(u => u.Role.Name == "AdHoc");
                
                // If user is Programs, filter by their assigned states
                if (userRole == "Programs")
                {
                    var assignedStates = await _userService.GetUserAssignedStatesAsync(userId);
                    if (assignedStates.Any())
                    {
                        query = query.Where(u => assignedStates.Contains(u.State ?? ""));
                    }
                    else
                    {
                        // If no states assigned, also check the user's own State field
                        var user = await _context.Users.FindAsync(userId);
                        if (!string.IsNullOrEmpty(user?.State))
                        {
                            query = query.Where(u => u.State == user.State);
                        }
                    }
                }

                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    var searchLower = search.ToLower();
                    query = query.Where(u => 
                        u.FullName.ToLower().Contains(searchLower) ||
                        u.EmployeeCode.ToLower().Contains(searchLower) ||
                        (u.Designation != null && u.Designation.ToLower().Contains(searchLower)));
                }

                if (!string.IsNullOrEmpty(state))
                {
                    query = query.Where(u => u.State == state);
                }

                if (!string.IsNullOrEmpty(status))
                {
                    if (status == "onpip")
                    {
                        var pipUserIds = await _context.Advisories
                            .Where(a => a.AdvisoryType == "PIP" && a.Status == "Pending")
                            .Select(a => a.TargetUserId)
                            .ToListAsync();
                        query = query.Where(u => pipUserIds.Contains(u.Id));
                    }
                    else if (status == "expiringsoon")
                    {
                        var thirtyDaysFromNow = DateTime.UtcNow.AddDays(30);
                        query = query.Where(u => u.ContractEndDate.HasValue && u.ContractEndDate.Value <= thirtyDaysFromNow);
                    }
                    else if (status == "active")
                    {
                        query = query.Where(u => u.ContractStatus == "Active");
                    }
                }

                var personnel = await query
                    .Select(u => new ProgramsPersonnelListDto
                    {
                        Id = u.Id,
                        Name = u.FullName,
                        Designation = u.Designation ?? "Not specified",
                        StaffId = u.EmployeeCode ?? "Not assigned",
                        ContractStatus = u.ContractStatus ?? "Active",
                        State = u.State ?? "Not specified",
                        FlagsCount = _context.Concerns.Count(c => c.TargetUserId == u.Id && c.Status == "Open"),
                        FlagsDisplay = _context.Concerns.Count(c => c.TargetUserId == u.Id && c.Status == "Open") > 0 
                            ? $"{_context.Concerns.Count(c => c.TargetUserId == u.Id && c.Status == "Open")} Flags" 
                            : "None"
                    })
                    .OrderBy(u => u.Name)
                    .ToListAsync();

                return Ok(personnel);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting personnel list");
                return StatusCode(500, new { message = "An error occurred while loading personnel" });
            }
        }

        [HttpGet("timesheets/export")]
        public async Task<IActionResult> ExportAllTimesheets(
            [FromQuery] string tab = "approved",
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                
                // Get assigned states for Programs user
                var assignedStates = await GetUserAssignedStates();
                
                // Get staff IDs from assigned states
                var staffIds = await _context.Users
                    .Where(u => u.Role.Name == "AdHoc" && (assignedStates.Count == 0 || assignedStates.Contains(u.State ?? "")))
                    .Select(u => u.Id)
                    .ToListAsync();

                string statusFilter = tab switch
                {
                    "pending" => "ProgramsReview",
                    "approved" => "Approved",
                    "returned" => "Rejected",
                    "all" => null,
                    _ => "Approved"
                };

                var query = _context.Timesheets
                    .Include(t => t.User)
                    .Where(t => staffIds.Contains(t.UserId));
                
                // Apply status filter
                if (!string.IsNullOrEmpty(statusFilter))
                {
                    query = query.Where(t => t.Status == statusFilter);
                }
                
                // Apply date range filter
                if (startDate.HasValue)
                {
                    var start = startDate.Value.Date;
                    query = query.Where(t => t.SubmittedAt >= start);
                }
                
                if (endDate.HasValue)
                {
                    var end = endDate.Value.Date.AddDays(1);
                    query = query.Where(t => t.SubmittedAt < end);
                }

                var timesheets = await query
                    .OrderByDescending(t => t.SubmittedAt)
                    .ToListAsync();

                // Generate CSV export
                var csvBuilder = new StringBuilder();
                csvBuilder.AppendLine("ID,Staff Name,Staff Email,Staff State,Month,Year,Status,Submitted Date,Total Hours,Total Days");

                foreach (var t in timesheets)
                {
                    csvBuilder.AppendLine($"{t.Id},{t.User?.FullName},{t.User?.Email},{t.User?.State},{t.Month},{t.Year},{t.Status},{t.SubmittedAt:dd-MM-yyyy},{t.TotalHours},{t.TotalDaysWorked}");
                }

                var csvBytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
                var fileName = $"Timesheets_{statusFilter ?? "all"}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";

                return File(csvBytes, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting timesheets");
                return StatusCode(500, new { message = "An error occurred while exporting timesheets" });
            }
        }
        
        // GET: api/Programs/staff/{id}
        [HttpGet("staff/{id}")]
        public async Task<IActionResult> GetStaffDetail(int id)
        {
            try
            {
                var assignedStates = await GetUserAssignedStates();
                _logger.LogInformation($"Fetching staff detail for ID: {id}");
                
                var staff = await _context.Users
                    .Include(u => u.GonSupervisor)
                    .Include(u => u.EcewsSupervisor)
                    .FirstOrDefaultAsync(u => u.Id == id && u.Role.Name == "AdHoc");

                if (staff == null)
                {
                    _logger.LogWarning($"Staff with ID {id} not found or not AdHoc");
                    return NotFound(new { message = "Staff not found" });
                }

                // Verify state access
                if (assignedStates.Any() && !assignedStates.Contains(staff.State ?? ""))
                {
                    return Forbid();
                }

                _logger.LogInformation($"Found staff: {staff.FullName}");

                // Get timesheets - fetch data first, then map
                var timesheetsRaw = await _context.Timesheets
                    .Where(t => t.UserId == id)
                    .OrderByDescending(t => t.Year)
                    .ThenByDescending(t => t.CreatedAt)
                    .Select(t => new
                    {
                        t.Id,
                        t.Month,
                        t.Year,
                        t.TotalDaysWorked,
                        t.SubmittedAt,
                        t.Status
                    })
                    .ToListAsync();

                _logger.LogInformation($"Found {timesheetsRaw.Count} timesheets");

                var timesheets = timesheetsRaw.Select(t => new TimesheetListDto
                {
                    Id = t.Id,
                    MonthYear = $"{t.Month} {t.Year}",
                    DaysWorked = $"{t.TotalDaysWorked} Day{(t.TotalDaysWorked != 1 ? "s" : "")}",
                    SubmittedDate = t.SubmittedAt.ToString("dd-MM-yyyy"),
                    Status = t.Status,
                    StatusType = GetStatusTypeStatic(t.Status)
                }).ToList();

                // Get concerns - fetch data first then map
                var concernsRaw = await _context.Concerns
                    .Include(c => c.RaisedBy)
                    .Where(c => c.TargetUserId == id)
                    .OrderByDescending(c => c.RaisedAt)
                    .ToListAsync();

                _logger.LogInformation($"Found {concernsRaw.Count} concerns");

                var concerns = concernsRaw.Select(c => new ProgramsConcernDto
                {
                    Id = c.Id,
                    AuthorName = c.RaisedBy?.FullName ?? "Unknown",
                    AuthorRole = GetRoleDisplayName(c.RaisedBy?.Role?.Name),
                    AuthorAvatar = GetInitials(c.RaisedBy?.FullName ?? ""),
                    ConcernText = c.Description,
                    Severity = c.Severity,
                    Type = c.ConcernType,
                    CreatedAt = c.RaisedAt.ToString("dd-MM-yyyy HH:mm")
                }).ToList();

                var detail = new ProgramsStaffDetailDto
                {
                    Id = staff.Id,
                    FullName = staff.FullName,
                    AvatarInitials = GetInitials(staff.FullName),
                    ProfileImageUrl = staff.ProfileImageUrl,
                    ContractStatus = staff.ContractStatus ?? "Active",
                    Department = staff.Department ?? "Not specified",
                    Location = staff.State ?? "Not specified",
                    Designation = staff.Designation ?? "Not specified",
                    GonSupervisorName = staff.GonSupervisor?.FullName ?? "Not assigned",
                    EcewsSupervisorName = staff.EcewsSupervisor?.FullName ?? "Not assigned",
                    PhoneNumber = staff.PhoneNumber ?? "Not provided",
                    Email = staff.Email,
                    EmergencyContactName = staff.EmergencyContactName ?? "Not provided",
                    EmergencyContactPhone = staff.EmergencyContactPhone ?? "Not provided",
                    BankName = staff.BankName ?? "Not provided",
                    AccountNumber = MaskAccountNumber(staff.AccountNumber),
                    AccountName = staff.AccountName ?? "Not provided",
                    Facility = staff.HealthFacility ?? "Not specified",
                    LGA = staff.LGA ?? "Not specified",
                    EmployeeCode = staff.EmployeeCode ?? "Not assigned",
                    Project = staff.Project ?? "Not specified",
                    Timesheets = timesheets,
                    Concerns = concerns
                };

                _logger.LogInformation($"Successfully returning staff detail for ID: {id}");
                return Ok(detail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting staff detail for ID: {id}. Error: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while loading staff details", error = ex.Message });
            }
        }

        // POST: api/Programs/staff/{id}/location
        [HttpPost("staff/{id}/location")]
        public async Task<IActionResult> ChangeLocation(int id, [FromBody] ProgramsChangeLocationDto dto)
        {
            try
            {
                var staff = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == id && u.Role.Name == "AdHoc");

                if (staff == null)
                    return NotFound(new { message = "Staff not found" });

                staff.State = dto.State ?? staff.State;
                staff.HealthFacility = dto.FacilityName ?? staff.HealthFacility;
                staff.LGA = dto.LGA ?? staff.LGA;
                staff.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Location updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing location for staff {StaffId}", id);
                return StatusCode(500, new { message = "An error occurred while updating location" });
            }
        }

        // POST: api/Programs/staff/{id}/supervisors
        [HttpPost("staff/{id}/supervisors")]
        public async Task<IActionResult> ManageSupervisors(int id, [FromBody] ProgramsManageSupervisorsDto dto)
        {
            try
            {
                var staff = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == id && u.Role.Name == "AdHoc");

                if (staff == null)
                    return NotFound(new { message = "Staff not found" });

                if (dto.GonSupervisorId.HasValue)
                {
                    var gonSupervisor = await _context.Users
                        .FirstOrDefaultAsync(u => u.Id == dto.GonSupervisorId.Value && u.Role.Name == "GonSupervisor");
                    if (gonSupervisor == null)
                        return BadRequest(new { message = "Invalid GON supervisor" });
                    staff.GonSupervisorId = dto.GonSupervisorId;
                }

                if (dto.EcewsSupervisorId.HasValue)
                {
                    var ecewsSupervisor = await _context.Users
                        .FirstOrDefaultAsync(u => u.Id == dto.EcewsSupervisorId.Value && u.Role.Name == "EcewsSupervisor");
                    if (ecewsSupervisor == null)
                        return BadRequest(new { message = "Invalid ECEWS supervisor" });
                    staff.EcewsSupervisorId = dto.EcewsSupervisorId;
                }

                staff.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Supervisors updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error managing supervisors for staff {StaffId}", id);
                return StatusCode(500, new { message = "An error occurred while updating supervisors" });
            }
        }

        // GET: api/Programs/timesheets/review?tab=pending
        [HttpGet("timesheets/review")]
        public async Task<IActionResult> GetTimesheetsForReview([FromQuery] string tab = "pending")
        {
            try
            {
                _logger.LogInformation($"Getting timesheets for review with tab: {tab}");
                
                // Get the states assigned to this Programs user
                var assignedStates = await GetUserAssignedStates();
                
                // Get staff IDs that belong to the assigned states
                var allStaffIds = await _context.Users
                    .Where(u => u.Role.Name == "AdHoc" && (assignedStates.Count == 0 || assignedStates.Contains(u.State ?? "")))
                    .Select(u => u.Id)
                    .ToListAsync();

                _logger.LogInformation($"Found {allStaffIds.Count} AdHoc staff in assigned states: {string.Join(", ", assignedStates)}");

                IQueryable<Timesheet> query = _context.Timesheets
                    .Include(t => t.User)
                    .Where(t => allStaffIds.Contains(t.UserId));

                string statusFilter;
                switch (tab.ToLower())
                {
                    case "pending":
                        statusFilter = "ProgramsReview";
                        break;
                    case "approved":
                        statusFilter = "Approved";
                        break;
                    case "returned":
                        statusFilter = "Rejected";
                        break;
                    default:
                        statusFilter = "ProgramsReview";
                        break;
                }

                query = query.Where(t => t.Status == statusFilter);

                var timesheets = await query
                    .OrderByDescending(t => t.SubmittedAt)
                    .Select(t => new
                    {
                        t.Id,
                        t.Status,
                        t.SubmittedAt,
                        StaffName = t.User != null ? t.User.FullName : "Unknown",
                        StaffState = t.User != null ? t.User.State : "Unknown",
                        ContractStatus = t.User != null ? t.User.ContractStatus ?? "Active" : "Active"
                    })
                    .ToListAsync();

                string GetStatusDisplay(string status)
                {
                    return status switch
                    {
                        "ProgramsReview" => "Programs Review",
                        "Approved" => "Approved",
                        "Rejected" => "Returned",
                        _ => status
                    };
                }

                var result = timesheets.Select(t => new ProgramsTimesheetReviewDto
                {
                    Id = t.Id,
                    StaffName = t.StaffName,
                    StaffState = t.StaffState,
                    SubmissionDate = t.SubmittedAt != default ? t.SubmittedAt.ToString("dd-MM-yyyy") : "",
                    TimesheetStatus = GetStatusDisplay(t.Status),
                    ContractStatus = t.ContractStatus,
                    Tab = tab
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting timesheets for review. Tab: {tab}. Error: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred loading timesheets", error = ex.Message });
            }
        }

        [HttpGet("can-generate-contract-letter")]
        public async Task<IActionResult> CanGenerateContractLetter()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var canGenerate = await _configurationService.HasPermissionAsync(userId, "contractLetters");
            return Ok(new { canGenerate });
        }

        [HttpGet("can-onboard-staff")]
        public async Task<IActionResult> CanOnboardStaff()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var canOnboard = await _configurationService.HasPermissionAsync(userId, "onboarding");
            return Ok(new { canOnboard });
        }

        // GET: api/Programs/timesheets/{id}
        [HttpGet("timesheets/{id}")]
        public async Task<IActionResult> GetTimesheetDetail(int id)
        {
            try
            {
                var timesheet = await _context.Timesheets
                    .Include(t => t.User)
                        .ThenInclude(u => u.GonSupervisor)
                    .Include(t => t.User)
                        .ThenInclude(u => u.EcewsSupervisor)
                    .Include(t => t.Entries)
                    .Include(t => t.CommentsList)
                        .ThenInclude(c => c.User)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (timesheet == null)
                    return NotFound(new { message = "Timesheet not found" });

                // Get concerns - fetch data first then map
                var concernsRaw = await _context.Concerns
                    .Include(c => c.RaisedBy)
                    .Where(c => c.TargetUserId == timesheet.UserId)
                    .OrderByDescending(c => c.RaisedAt)
                    .ToListAsync();

                var concerns = concernsRaw.Select(c => new ProgramsConcernDto
                {
                    Id = c.Id,
                    AuthorName = c.RaisedBy?.FullName ?? "Unknown",
                    AuthorRole = GetRoleDisplayName(c.RaisedBy?.Role?.Name),
                    AuthorAvatar = GetInitials(c.RaisedBy?.FullName ?? ""),
                    ConcernText = c.Description,
                    Severity = c.Severity,
                    Type = c.ConcernType,
                    CreatedAt = c.RaisedAt.ToString("dd-MM-yyyy HH:mm")
                }).ToList();

                // Check if GON approved (status ProgramsReview means GON approved)
                bool gonApproved = timesheet.Status == "ProgramsReview" || timesheet.Status == "Approved";
                bool gonFlagged = await _context.Concerns.AnyAsync(c => c.TargetUserId == timesheet.UserId && c.Status == "Open");

                var detail = new ProgramsTimesheetDetailDto
                {
                    Id = timesheet.Id,
                    MonthYear = $"{timesheet.Month} {timesheet.Year}",
                    StaffName = timesheet.User.FullName,
                    FullName = timesheet.User.FullName,
                    Department = timesheet.User.Department ?? "Not specified",
                    Location = timesheet.User.State ?? "Not specified",
                    BankName = timesheet.User.BankName ?? "Not specified",
                    AccountNumber = MaskAccountNumber(timesheet.User.AccountNumber),
                    GonSupervisorName = timesheet.User.GonSupervisor?.FullName ?? "Not assigned",
                    EcewsSupervisorName = timesheet.User.EcewsSupervisor?.FullName ?? "Not assigned",
                    GonApproved = gonApproved,
                    GonFlagged = gonFlagged,
                    EcewsApproved = gonApproved,
                    Status = GetTimesheetStatusDisplay(timesheet.Status),
                    Entries = timesheet.Entries.Select(e => new ProgramsTimesheetEntryDto
                    {
                        Date = e.Date.ToString("dd-MM-yyyy"),
                        StartTime = e.StartTime.ToString(@"hh\:mm"),
                        EndTime = e.EndTime.ToString(@"hh\:mm"),
                        TotalHours = $"{e.TotalHours} hrs",
                        WorkDone = e.WorkDone
                    }).ToList(),
                    TotalHours = timesheet.TotalHours,
                    SummaryInfo = $"{timesheet.TotalDaysWorked} days, {timesheet.TotalHours} hours",
                    Comments = timesheet.CommentsList.Select(c => new ProgramsCommentDto
                    {
                        Id = c.Id,
                        AuthorName = c.User?.FullName ?? "Unknown",
                        AuthorRole = c.UserRole,
                        AuthorAvatar = GetInitials(c.User?.FullName ?? ""),
                        CommentText = c.CommentText,
                        CreatedAt = c.CreatedAt.ToString("dd-MM-yyyy HH:mm")
                    }).ToList(),
                    Concerns = concerns
                };

                return Ok(detail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting timesheet detail for ID: {TimesheetId}", id);
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // POST: api/Programs/timesheets/{id}/approve
        [HttpPost("timesheets/{id}/approve")]
        public async Task<IActionResult> ApproveTimesheet(int id, [FromBody] ProgramsApproveTimesheetDto dto)
        {
            try
            {
                var programsUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var programsUser = await _context.Users.FindAsync(programsUserId);

                var timesheet = await _context.Timesheets
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (timesheet == null)
                    return NotFound(new { message = "Timesheet not found" });

                // Update timesheet status
                timesheet.Status = "Approved";
                timesheet.ProgramsTeamReviewedAt = DateTime.UtcNow;
                timesheet.Comments = dto.Comments ?? timesheet.Comments;
                timesheet.UpdatedAt = DateTime.UtcNow;

                // Create contract recommendation if provided
                if (!string.IsNullOrEmpty(dto.ContractRecommendation))
                {
                    var recommendation = new ContractRecommendation
                    {
                        TimesheetId = id,
                        RecommendedById = programsUserId,
                        TargetUserId = timesheet.UserId,
                        RecommendationType = dto.ContractRecommendation,
                        Reason = dto.Reason,
                        Status = "Pending",
                        RecommendedAt = DateTime.UtcNow
                    };
                    _context.ContractRecommendations.Add(recommendation);
                }

                await _context.SaveChangesAsync();

                // Send notification to staff
                await _notificationService.CreateTimesheetApprovedNotification(id, timesheet.UserId, programsUser?.FullName ?? "Programs Team", "Programs Team");

                return Ok(new { message = "Timesheet approved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving timesheet {TimesheetId}", id);
                return StatusCode(500, new { message = "An error occurred while approving timesheet" });
            }
        }

        // POST: api/Programs/timesheets/{id}/decline
        [HttpPost("timesheets/{id}/decline")]
        public async Task<IActionResult> DeclineTimesheet(int id, [FromBody] ProgramsDeclineTimesheetDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Feedback))
                    return BadRequest(new { message = "Feedback is required" });

                var programsUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var programsUser = await _context.Users.FindAsync(programsUserId);

                var timesheet = await _context.Timesheets
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (timesheet == null)
                    return NotFound(new { message = "Timesheet not found" });

                // Update timesheet status
                timesheet.Status = "Rejected";
                timesheet.ProgramsTeamReviewedAt = DateTime.UtcNow;
                timesheet.Comments = dto.Feedback;
                timesheet.UpdatedAt = DateTime.UtcNow;

                // Add comment
                var comment = new Comment
                {
                    TimesheetId = id,
                    UserId = programsUserId,
                    UserRole = "Programs Team",
                    UserAvatar = GetInitials(programsUser?.FullName ?? ""),
                    CommentText = dto.Feedback,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Comments.Add(comment);

                await _context.SaveChangesAsync();

                // Send notification to staff
                await _notificationService.CreateTimesheetRejectedNotification(id, timesheet.UserId, programsUser?.FullName ?? "Programs Team", "Programs Team", dto.Feedback);

                return Ok(new { message = "Timesheet returned with feedback" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error declining timesheet {TimesheetId}", id);
                return StatusCode(500, new { message = "An error occurred while declining timesheet" });
            }
        }

        // GET: api/Programs/governance
        [HttpGet("governance")]
        [Authorize(Roles = "Programs,HrAdmin")]
        public async Task<IActionResult> GetGovernanceDashboard()
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                List<int> staffIds;
                
                if (userRole == "HrAdmin")
                {
                    // HR sees ALL AdHoc staff
                    staffIds = await _context.Users
                        .Where(u => u.Role.Name == "AdHoc")
                        .Select(u => u.Id)
                        .ToListAsync();
                }
                else
                {
                    // Programs sees only staff in their assigned states
                    var assignedStates = await GetUserAssignedStates();
                    staffIds = await _context.Users
                        .Where(u => u.Role.Name == "AdHoc" && (assignedStates.Count == 0 || assignedStates.Contains(u.State ?? "")))
                        .Select(u => u.Id)
                        .ToListAsync();
                }
                
                // Get all contract recommendations that are pending for staff
                var recommendations = await _context.ContractRecommendations
                    .Include(r => r.TargetUser)
                    .Include(r => r.RecommendedBy)
                    .Where(r => r.Status == "Pending" && staffIds.Contains(r.TargetUserId))
                    .OrderByDescending(r => r.RecommendedAt)
                    .ToListAsync();

                var renewalCount = recommendations.Count(r => r.RecommendationType == "Renewal");
                var pipCount = recommendations.Count(r => r.RecommendationType == "PIP");
                var terminationCount = recommendations.Count(r => r.RecommendationType == "Termination");

                var advisories = recommendations.Select(r => new GovernanceAdvisoryDto
                {
                    Id = r.Id,
                    StaffName = r.TargetUser?.FullName ?? "Unknown",
                    Type = GetAdvisoryTypeDisplay(r.RecommendationType),
                    RaisedBy = r.RecommendedBy?.FullName ?? "Unknown",
                    ContractStatus = r.TargetUser?.ContractStatus ?? "Active",
                    Justification = r.Reason ?? "",
                    StaffRole = r.TargetUser?.Designation ?? "Not specified",
                    SubmittedBy = r.RecommendedBy?.FullName ?? "Unknown",
                    DateSubmitted = r.RecommendedAt.ToString("dd MMM, yyyy")
                }).ToList();

                var dashboard = new ProgramsGovernanceDashboardDto
                {
                    RenewalAdvisoryCount = renewalCount,
                    PipAdvisoryCount = pipCount,
                    TerminationAdvisoryCount = terminationCount,
                    Advisories = advisories
                };

                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting governance dashboard");
                return StatusCode(500, new { message = "An error occurred while loading governance dashboard" });
            }
        }

        // GET: api/Programs/staff/{id}/documents
        [HttpGet("staff/{id}/documents")]
        public async Task<IActionResult> GetStaffDocuments(int id)
        {
            try
            {
                var documents = await _context.UserDocuments
                    .Where(d => d.UserId == id && d.IsActive)
                    .OrderByDescending(d => d.UploadedAt)
                    .Select(d => new UserDocumentDto
                    {
                        Id = d.Id,
                        FileName = d.FileName,
                        FileUrl = d.FileUrl,
                        FileType = d.FileType,
                        FileSize = d.FileSize,
                        UploadedAt = d.UploadedAt
                    })
                    .ToListAsync();
                
                return Ok(documents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting documents for staff {StaffId}", id);
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // DELETE: api/Programs/staff/{id}/documents/{documentId}
        [HttpDelete("staff/{id}/documents/{documentId}")]
        public async Task<IActionResult> DeleteStaffDocument(int id, int documentId)
        {
            try
            {
                var document = await _context.UserDocuments
                    .FirstOrDefaultAsync(d => d.Id == documentId && d.UserId == id);
                
                if (document == null)
                    return NotFound(new { message = "Document not found" });
                
                // Delete physical file
                var webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var filePath = Path.Combine(webRootPath, document.FileUrl.TrimStart('/'));
                
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
                
                _context.UserDocuments.Remove(document);
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Document deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting document {DocumentId} for staff {StaffId}", documentId, id);
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/Programs/governance/advisory/{id}
        [HttpGet("governance/advisory/{id}")]
        [Authorize(Roles = "Programs,HrAdmin")]
        public async Task<IActionResult> GetGovernanceAdvisoryDetail(int id)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                // First try to find in Advisories
                var advisory = await _context.Advisories
                    .Include(a => a.TargetUser)
                    .Include(a => a.IssuedBy)
                    .FirstOrDefaultAsync(a => a.Id == id);
                
                if (advisory != null)
                {
                    // For HR, allow access to all. For Programs, check state access
                    if (userRole != "HrAdmin")
                    {
                        var assignedStates = await GetUserAssignedStates();
                        if (!assignedStates.Contains(advisory.TargetUser?.State ?? ""))
                        {
                            return Forbid();
                        }
                    }
                    
                    var result = new
                    {
                        id = advisory.Id,
                        staffName = advisory.TargetUser?.FullName ?? "",
                        staffRole = advisory.TargetUser?.Designation ?? "",
                        staffId = advisory.TargetUserId,
                        employeeCode = advisory.TargetUser?.EmployeeCode ?? "",
                        staffPublicId = advisory.TargetUser?.PublicId ?? "",
                        staffEmail = advisory.TargetUser?.Email ?? "",
                        advisoryTitle = GetAdvisoryTitle(advisory.AdvisoryType),
                        submittedBy = advisory.IssuedBy?.FullName ?? "",
                        dateSubmitted = advisory.IssuedAt.ToString("dd-MM-yyyy"),
                        justification = advisory.Justification,
                        type = advisory.AdvisoryType,
                        status = advisory.Status
                    };
                    return Ok(result);
                }
                
                // If not found, try ContractRecommendations
                var recommendation = await _context.ContractRecommendations
                    .Include(r => r.TargetUser)
                    .Include(r => r.RecommendedBy)
                    .FirstOrDefaultAsync(r => r.Id == id);
                
                if (recommendation == null)
                    return NotFound(new { message = "Advisory not found" });
                
                // For HR, allow access to all. For Programs, check state access
                if (userRole != "HrAdmin")
                {
                    var assignedStates = await GetUserAssignedStates();
                    if (!assignedStates.Contains(recommendation.TargetUser?.State ?? ""))
                    {
                        return Forbid();
                    }
                }
                
                var recResult = new
                {
                    id = recommendation.Id,
                    staffName = recommendation.TargetUser?.FullName ?? "",
                    staffRole = recommendation.TargetUser?.Designation ?? "",
                    staffId = recommendation.TargetUserId,
                    employeeCode = recommendation.TargetUser?.EmployeeCode ?? "",
                    staffPublicId = recommendation.TargetUser?.PublicId ?? "",
                    staffEmail = recommendation.TargetUser?.Email ?? "",
                    advisoryTitle = GetAdvisoryTypeDisplay(recommendation.RecommendationType),
                    submittedBy = recommendation.RecommendedBy?.FullName ?? "",
                    dateSubmitted = recommendation.RecommendedAt.ToString("dd-MM-yyyy"),
                    justification = recommendation.Reason ?? "",
                    type = recommendation.RecommendationType,
                    status = recommendation.Status
                };
                
                return Ok(recResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting advisory detail");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // POST: api/Programs/governance/advisory/{id}/action
        [HttpPost("governance/advisory/{id}/action")]
        [Authorize(Roles = "Programs,HrAdmin")]
        public async Task<IActionResult> ProcessGovernanceAdvisory(int id, [FromBody] ProcessAdvisoryDto dto)
        {
            try
            {
                var advisory = await _context.Advisories.FindAsync(id);
                if (advisory == null)
                    return NotFound(new { message = "Advisory not found" });
                
                if (dto.Action == "Approve")
                {
                    advisory.Status = "Approved";
                    advisory.ImplementedAt = DateTime.UtcNow;
                    advisory.Response = dto.Comments;
                    
                    // If this is a PIP advisory, create a PIP record automatically
                    if (advisory.AdvisoryType == "PIP")
                    {
                        // Create a PIP record
                        var pip = new PerformanceImprovementPlan
                        {
                            UserId = advisory.TargetUserId,
                            InitiatedById = advisory.IssuedById,
                            StartDate = DateTime.UtcNow,
                            EndDate = DateTime.UtcNow.AddDays(90),
                            Objective = "Performance Improvement Plan based on advisory",
                            ActionPlan = advisory.Justification,
                            Status = "Active",
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.PerformanceImprovementPlans.Add(pip);
                    }
                }
                else if (dto.Action == "Decline")
                {
                    advisory.Status = "Declined";
                    advisory.Response = dto.Feedback;
                }
                
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Advisory processed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing advisory");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // DTO for processing advisory
        public class ProcessAdvisoryDto
        {
            public string Action { get; set; } = string.Empty;
            public string? Comments { get; set; }
            public string? Feedback { get; set; }
        }

        private async Task<List<string>> GetUserAssignedStates()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            
            if (userRole != "Programs") return new List<string>();
            
            var assignedStates = await _userService.GetUserAssignedStatesAsync(userId);
            if (assignedStates.Any()) return assignedStates;
            
            // Fallback to user's own State field
            var user = await _context.Users.FindAsync(userId);
            if (!string.IsNullOrEmpty(user?.State))
            {
                return new List<string> { user.State };
            }
            
            return new List<string>();
        }

        #region Helper Methods

        private string GetTimesheetStatusDisplay(string status)
        {
            return status switch
            {
                "ProgramsReview" => "Programs Review",
                "Approved" => "Approved",
                "Rejected" => "Returned",
                _ => status
            };
        }

        private string GetStatusType(string status)
        {
            return status?.ToLower() switch
            {
                "approved" => "approved",
                "rejected" => "rejected",
                "programsreview" => "programs",
                "gonreview" => "review",
                "submitted" => "pending",
                _ => "pending"
            } ?? "pending";
        }

        private static string GetStatusTypeStatic(string status)
        {
            return status?.ToLower() switch
            {
                "approved" => "approved",
                "rejected" => "rejected",
                "programsreview" => "programs",
                "gonreview" => "review",
                "submitted" => "pending",
                _ => "pending"
            } ?? "pending";
        }

        private string GetInitials(string fullName)
        {
            if (string.IsNullOrEmpty(fullName)) return "U";
            var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2)
                return $"{parts[0][0]}{parts[1][0]}".ToUpper();
            return fullName.Length > 0 ? fullName[0].ToString().ToUpper() : "U";
        }

        private string GetRoleDisplayName(string? roleName)
        {
            return roleName switch
            {
                "GonSupervisor" => "GON Supervisor",
                "EcewsSupervisor" => "ECEWS Supervisor",
                "AdHoc" => "Staff",
                _ => roleName ?? "Unknown"
            };
        }

        private string MaskAccountNumber(string? accountNumber)
        {
            if (string.IsNullOrEmpty(accountNumber) || accountNumber.Length < 4)
                return accountNumber ?? "Not provided";
            return "****" + accountNumber.Substring(accountNumber.Length - 4);
        }

        private string GetAdvisoryTitle(string advisoryType)
        {
            return advisoryType switch
            {
                "PIP" => "Performance Improvement Plan Advisory",
                "Renewal" => "Contract Renewal Advisory",
                "Termination" => "Termination Advisory",
                _ => "Advisory Recommendation"
            };
        }

        private string GetAdvisoryTypeDisplay(string type)
        {
            return type switch
            {
                "Renewal" => "Contract Renewal",
                "PIP" => "PIP Advisory",
                "Termination" => "Termination Advisory",
                _ => type
            };
        }

        #endregion
    }
}