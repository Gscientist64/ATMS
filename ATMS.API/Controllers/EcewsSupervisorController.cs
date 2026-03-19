using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using ATMS.API.Data;
using ATMS.API.DTOs;
using ATMS.API.Models;
using ATMS.API.Services;

namespace ATMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "EcewsSupervisor")]
    public class EcewsSupervisorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly ILogger<EcewsSupervisorController> _logger;

        public EcewsSupervisorController(
            ApplicationDbContext context,
            INotificationService notificationService,
            ILogger<EcewsSupervisorController> logger)
        {
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
        }

        // GET: api/EcewsSupervisor/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                // Get supervisee IDs
                var superviseeIds = await _context.Users
                    .Where(u => u.EcewsSupervisorId == supervisorId)
                    .Select(u => u.Id)
                    .ToListAsync();

                // Pending timesheets (Submitted status)
                var pendingTimesheets = await _context.Timesheets
                    .CountAsync(t => superviseeIds.Contains(t.UserId) && t.Status == "Submitted");

                // Approved this month - Check for both "Approved" and "GONReview" status (since ECEWS approves to GONReview)
                var now = DateTime.UtcNow;
                var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var endOfMonth = startOfMonth.AddMonths(1).AddSeconds(-1);

                var approvedThisMonth = await _context.Timesheets
                    .CountAsync(t => superviseeIds.Contains(t.UserId) && 
                        (t.Status == "GONReview" || t.Status == "Approved") && // ECEWS approval moves to GONReview
                        t.EcewsReviewedAt.HasValue &&
                        t.EcewsReviewedAt.Value >= startOfMonth &&
                        t.EcewsReviewedAt.Value <= endOfMonth);

                _logger.LogInformation($"Approved this month count: {approvedThisMonth} for supervisor {supervisorId}");

                // PIP Advised
                var pipAdvised = await _context.Advisories
                    .CountAsync(a => superviseeIds.Contains(a.TargetUserId) && 
                        a.AdvisoryType == "PIP" && 
                        a.Status == "Pending");

                // Contract Review Required (contracts ending in 30 days)
                var thirtyDaysFromNow = DateTime.UtcNow.AddDays(30);
                var contractReviewRequired = await _context.Users
                    .CountAsync(u => superviseeIds.Contains(u.Id) && 
                        u.ContractEndDate.HasValue && 
                        u.ContractEndDate.Value <= thirtyDaysFromNow);

                // Supervisees count
                var superviseesCount = superviseeIds.Count;

                // Active timesheets (Submitted status)
                var activeTimesheets = await _context.Timesheets
                    .Include(t => t.User)
                        .ThenInclude(u => u.GonSupervisor)
                    .Where(t => superviseeIds.Contains(t.UserId) && t.Status == "Submitted")
                    .OrderByDescending(t => t.SubmittedAt)
                    .Take(10)
                    .Select(t => new EcewsActiveTimesheetDto
                    {
                        Id = t.Id,
                        StaffName = t.User != null ? t.User.FullName : "Unknown",
                        SubmissionDate = t.SubmittedAt.ToString("dd-MM-yyyy"),
                        GonSupervisor = t.User != null && t.User.GonSupervisor != null ? t.User.GonSupervisor.FullName : "Not Assigned",
                        Status = "ECEWS Review"
                    })
                    .ToListAsync();

                var dashboard = new EcewsDashboardDto
                {
                    PendingTimesheets = pendingTimesheets,
                    ApprovedThisMonth = approvedThisMonth,
                    PipAdvised = pipAdvised,
                    ContractReviewRequired = contractReviewRequired,
                    SuperviseesCount = superviseesCount,
                    ActiveTimesheets = activeTimesheets
                };

                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ECEWS dashboard");
                return StatusCode(500, new { message = "An error occurred while loading dashboard" });
            }
        }

        // GET: api/EcewsSupervisor/timesheets/review?tab=pending
        [HttpGet("timesheets/review")]
        public async Task<IActionResult> GetTimesheetsForReview([FromQuery] string tab = "pending")
        {
            try
            {
                var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                var superviseeIds = await _context.Users
                    .Where(u => u.EcewsSupervisorId == supervisorId)
                    .Select(u => u.Id)
                    .ToListAsync();

                IQueryable<Timesheet> query = _context.Timesheets
                    .Include(t => t.User)
                        .ThenInclude(u => u.GonSupervisor)
                    .Where(t => superviseeIds.Contains(t.UserId));

                // Filter based on tab
                switch (tab.ToLower())
                {
                    case "pending":
                        query = query.Where(t => t.Status == "Submitted");
                        break;
                    case "approved":
                        query = query.Where(t => t.Status == "GONReview" || t.Status == "ProgramsTeam" || t.Status == "HR" || t.Status == "Approved");
                        break;
                    case "returned":
                        query = query.Where(t => t.Status == "Rejected");
                        break;
                    default:
                        query = query.Where(t => t.Status == "Submitted");
                        break;
                }

                // Fetch data first
                var timesheets = await query
                    .OrderByDescending(t => t.SubmittedAt)
                    .Select(t => new
                    {
                        t.Id,
                        t.Status,
                        t.SubmittedAt,
                        StaffName = t.User != null ? t.User.FullName : "Unknown",
                        GonSupervisorName = t.User != null && t.User.GonSupervisor != null ? t.User.GonSupervisor.FullName : "Not Assigned"
                    })
                    .ToListAsync();

                // Map to DTO after fetching (now using static methods or local functions)
                var result = timesheets.Select(t => new EcewsTimesheetReviewDto
                {
                    Id = t.Id,
                    StaffName = t.StaffName,
                    SubmissionDate = t.SubmittedAt != default ? t.SubmittedAt.ToString("dd-MM-yyyy") : "",
                    GonSupervisor = t.GonSupervisorName,
                    Status = GetStatusDisplayStatic(t.Status),
                    StatusType = GetStatusTypeStatic(t.Status, tab)
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting timesheets for review. SupervisorId: {SupervisorId}, Tab: {Tab}", 
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value, tab);
                return StatusCode(500, new { message = "An error occurred loading timesheets", error = ex.Message });
            }
        }

        // Make these methods static
        private static string GetStatusDisplayStatic(string status)
        {
            return status switch
            {
                "Submitted" => "ECEWS Review",
                "GONReview" => "Programs Review",
                "ProgramsTeam" => "Programs Review",
                "HR" => "HR Review",
                "Approved" => "Approved",
                "Rejected" => "Returned",
                _ => status
            };
        }

        private static string GetStatusTypeStatic(string status, string tab)
        {
            if (tab == "returned") return "returned";
            
            return status switch
            {
                "Submitted" => "ecews",
                "GONReview" => "programs",
                "ProgramsTeam" => "programs",
                "HR" => "hr",
                "Approved" => "approved",
                _ => "ecews"
            };
        }
        // GET: api/EcewsSupervisor/timesheets/{id}
        [HttpGet("timesheets/{id}")]
        public async Task<IActionResult> GetTimesheetDetail(int id)
        {
            try
            {
                var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                var timesheet = await _context.Timesheets
                    .Include(t => t.User)
                        .ThenInclude(u => u.GonSupervisor)
                    .Include(t => t.Entries)
                    .Include(t => t.CommentsList)
                        .ThenInclude(c => c.User)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (timesheet == null)
                    return NotFound(new { message = "Timesheet not found" });

                // Verify supervisor has access to this timesheet
                if (timesheet.User == null || timesheet.User.EcewsSupervisorId != supervisorId)
                    return Forbid();

                // Get concerns for this user
                var concerns = await _context.Concerns
                    .Include(c => c.RaisedBy)
                    .Where(c => c.TargetUserId == timesheet.UserId)
                    .OrderByDescending(c => c.RaisedAt)
                    .ToListAsync();

                var detail = new EcewsTimesheetDetailDto
                {
                    Id = timesheet.Id,
                    MonthYear = $"{timesheet.Month} {timesheet.Year}",
                    StaffName = timesheet.User.FullName,
                    FullName = timesheet.User.FullName,
                    Department = timesheet.User.Department ?? "Not specified",
                    Location = timesheet.User.State ?? "Not specified",
                    BankName = timesheet.User.BankName ?? "Not specified",
                    AccountNumber = MaskAccountNumber(timesheet.User.AccountNumber),
                    GonApproved = timesheet.Status == "GONReview" || timesheet.Status == "Approved",
                    GonFlagged = await _context.Concerns.AnyAsync(c => c.TargetUserId == timesheet.UserId && c.Status == "Open"),
                    GonSupervisorName = timesheet.User.GonSupervisor?.FullName ?? "Not assigned",
                    Entries = timesheet.Entries.Select(e => new EcewsTimesheetEntryDto
                    {
                        Date = e.Date.ToString("dd-MM-yyyy"),
                        StartTime = e.StartTime.ToString(@"hh\:mm"),
                        EndTime = e.EndTime.ToString(@"hh\:mm"),
                        TotalHours = $"{e.TotalHours} hrs",
                        WorkDone = e.WorkDone
                    }).ToList(),
                    TotalHours = timesheet.TotalHours,
                    SummaryInfo = $"{timesheet.TotalDaysWorked} days, {timesheet.TotalHours} hours",
                    Comments = timesheet.CommentsList.Select(c => new EcewsCommentDto
                    {
                        Id = c.Id,
                        AuthorName = c.User?.FullName ?? "Unknown",
                        AuthorRole = c.UserRole,
                        AuthorAvatar = GetInitials(c.User?.FullName ?? ""),
                        CommentText = c.CommentText,
                        CreatedAt = c.CreatedAt.ToString("dd-MM-yyyy HH:mm")
                    }).ToList(),
                    Concerns = concerns.Select(c => new EcewsConcernDto
                    {
                        Id = c.Id,
                        AuthorName = c.RaisedBy?.FullName ?? "Unknown",
                        AuthorRole = "GON Supervisor",
                        AuthorAvatar = GetInitials(c.RaisedBy?.FullName ?? ""),
                        ConcernText = c.Description,
                        Severity = c.Severity,
                        Type = c.ConcernType,
                        CreatedAt = c.RaisedAt.ToString("dd-MM-yyyy HH:mm")
                    }).ToList()
                };

                return Ok(detail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting timesheet detail");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // POST: api/EcewsSupervisor/timesheets/{id}/approve
        [HttpPost("timesheets/{id}/approve")]
        public async Task<IActionResult> ApproveTimesheet(int id, [FromBody] EcewsApproveTimesheetDto dto)
        {
            try
            {
                var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var supervisor = await _context.Users.FindAsync(supervisorId);

                var timesheet = await _context.Timesheets
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (timesheet == null)
                    return NotFound(new { message = "Timesheet not found" });

                // Verify supervisor has access
                if (timesheet.User == null || timesheet.User.EcewsSupervisorId != supervisorId)
                    return Forbid();

                // Update timesheet status
                timesheet.Status = "GONReview";
                timesheet.EcewsReviewedAt = DateTime.UtcNow;
                timesheet.EcewsReviewerId = supervisorId;
                timesheet.Comments = dto.Comments ?? timesheet.Comments;
                timesheet.UpdatedAt = DateTime.UtcNow;

                // Create contract recommendation if provided
                if (!string.IsNullOrEmpty(dto.ContractRecommendation))
                {
                    var recommendation = new ContractRecommendation
                    {
                        TimesheetId = id,
                        RecommendedById = supervisorId,
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
                await _notificationService.CreateTimesheetUnderReviewNotification(id, timesheet.UserId, "GON");

                return Ok(new { message = "Timesheet approved and forwarded to GON supervisor" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving timesheet");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // POST: api/EcewsSupervisor/timesheets/{id}/decline
        [HttpPost("timesheets/{id}/decline")]
        public async Task<IActionResult> DeclineTimesheet(int id, [FromBody] EcewsDeclineTimesheetDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Feedback))
                    return BadRequest(new { message = "Feedback is required" });

                var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var supervisor = await _context.Users.FindAsync(supervisorId);

                var timesheet = await _context.Timesheets
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (timesheet == null)
                    return NotFound(new { message = "Timesheet not found" });

                // Verify supervisor has access
                if (timesheet.User == null || timesheet.User.EcewsSupervisorId != supervisorId)
                    return Forbid();

                // Update timesheet status
                timesheet.Status = "Rejected";
                timesheet.EcewsReviewedAt = DateTime.UtcNow;
                timesheet.EcewsReviewerId = supervisorId;
                timesheet.Comments = dto.Feedback;
                timesheet.UpdatedAt = DateTime.UtcNow;

                // Add comment
                var comment = new Comment
                {
                    TimesheetId = id,
                    UserId = supervisorId,
                    UserRole = "ECEWS Supervisor",
                    UserAvatar = GetInitials(supervisor?.FullName ?? ""),
                    CommentText = dto.Feedback,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Comments.Add(comment);

                await _context.SaveChangesAsync();

                // Send notification to staff
                await _notificationService.CreateTimesheetRejectedNotification(id, timesheet.UserId, supervisor?.FullName ?? "ECEWS Supervisor", "ECEWS Supervisor", dto.Feedback);

                return Ok(new { message = "Timesheet returned with feedback" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error declining timesheet");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/EcewsSupervisor/supervisees
        [HttpGet("supervisees")]
        public async Task<IActionResult> GetSupervisees([FromQuery] string filter = "all")
        {
            try
            {
                var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                var query = _context.Users
                    .Where(u => u.EcewsSupervisorId == supervisorId);

                // Apply filter
                if (!string.IsNullOrEmpty(filter) && filter != "all")
                {
                    switch (filter.ToLower())
                    {
                        case "active":
                            query = query.Where(u => u.ContractStatus == "Active");
                            break;
                        case "onpip":
                            var usersWithPip = await _context.Advisories
                                .Where(a => a.AdvisoryType == "PIP" && a.Status == "Pending")
                                .Select(a => a.TargetUserId)
                                .ToListAsync();
                            query = query.Where(u => usersWithPip.Contains(u.Id));
                            break;
                        case "expiringsoon":
                            var thirtyDaysFromNow = DateTime.UtcNow.AddDays(30);
                            query = query.Where(u => u.ContractEndDate.HasValue && u.ContractEndDate.Value <= thirtyDaysFromNow);
                            break;
                    }
                }

                var supervisees = await query
                    .Select(u => new EcewsSuperviseeListDto
                    {
                        Id = u.Id,
                        Name = u.FullName,
                        Designation = u.Designation ?? "Not specified",
                        StaffId = u.EmployeeCode ?? "Not assigned",
                        ContractStatus = u.ContractStatus ?? "Active",
                        FlagCount = _context.Concerns.Count(c => c.TargetUserId == u.Id && c.Status == "Open"),
                        Flags = _context.Concerns.Count(c => c.TargetUserId == u.Id && c.Status == "Open") > 0 
                            ? $"{_context.Concerns.Count(c => c.TargetUserId == u.Id && c.Status == "Open")} Flags" 
                            : "No Flags"
                    })
                    .ToListAsync();

                return Ok(supervisees);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting supervisees");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/EcewsSupervisor/supervisees/{id}
        [HttpGet("supervisees/{id}")]
        public async Task<IActionResult> GetSuperviseeDetail(int id)
        {
            try
            {
                var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                _logger.LogInformation($"Fetching supervisee detail for ID: {id} by supervisor: {supervisorId}");

                // First fetch the supervisee
                var supervisee = await _context.Users
                    .Include(u => u.GonSupervisor)
                    .FirstOrDefaultAsync(u => u.Id == id);

                if (supervisee == null)
                {
                    _logger.LogWarning($"Supervisee with ID {id} not found");
                    return NotFound(new { message = "Supervisee not found" });
                }

                // Verify this supervisee belongs to the supervisor
                if (supervisee.EcewsSupervisorId != supervisorId)
                {
                    _logger.LogWarning($"Supervisee {id} does not belong to supervisor {supervisorId}");
                    return Forbid();
                }

                // Fetch concerns separately
                var concerns = await _context.Concerns
                    .Include(c => c.RaisedBy)
                    .Where(c => c.TargetUserId == id)
                    .OrderByDescending(c => c.RaisedAt)
                    .ToListAsync();

                // Fetch advisories separately
                var advisories = await _context.Advisories
                    .Include(a => a.IssuedBy)
                    .Where(a => a.TargetUserId == id)
                    .OrderByDescending(a => a.IssuedAt)
                    .ToListAsync();

                // Map to DTOs after fetching (using static helper methods)
                var gonConcerns = concerns.Select(c => new EcewsGonConcernDto
                {
                    Id = c.Id,
                    AuthorName = c.RaisedBy?.FullName ?? "Unknown",
                    AuthorRole = "GON Supervisor",
                    AuthorAvatar = GetInitialsStatic(c.RaisedBy?.FullName ?? ""),
                    ConcernText = c.Description,
                    Severity = c.Severity,
                    Type = c.ConcernType,
                    CreatedAt = c.RaisedAt.ToString("dd-MM-yyyy HH:mm")
                }).ToList();

                var advisoryDtos = advisories.Select(a => new EcewsAdvisoryDto
                {
                    Id = a.Id,
                    AuthorName = a.IssuedBy?.FullName ?? "Unknown",
                    AuthorRole = "ECEWS Supervisor",
                    AuthorAvatar = GetInitialsStatic(a.IssuedBy?.FullName ?? ""),
                    AdvisoryText = a.Justification,
                    Severity = "High",
                    Type = a.AdvisoryType,
                    CreatedAt = a.IssuedAt.ToString("dd-MM-yyyy HH:mm")
                }).ToList();

                var detail = new EcewsSuperviseeDetailDto
                {
                    Id = supervisee.Id,
                    FullName = supervisee.FullName,
                    Department = supervisee.Department ?? "Not specified",
                    Location = supervisee.State ?? "Not specified",
                    ContractStatus = supervisee.ContractStatus ?? "Active",
                    BankName = supervisee.BankName ?? "Not specified",
                    AccountNumber = MaskAccountNumber(supervisee.AccountNumber),
                    GonConcerns = gonConcerns,
                    Advisories = advisoryDtos
                };

                _logger.LogInformation($"Successfully fetched supervisee detail for ID: {id}");
                return Ok(detail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting supervisee detail for ID: {SuperviseeId}", id);
                return StatusCode(500, new { message = "An error occurred loading supervisee details" });
            }
        }

       
        private static string GetInitialsStatic(string fullName)
        {
            if (string.IsNullOrEmpty(fullName)) return "U";
            var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2)
                return $"{parts[0][0]}{parts[1][0]}".ToUpper();
            return fullName.Length > 0 ? fullName[0].ToString().ToUpper() : "U";
        }

        // POST: api/EcewsSupervisor/supervisees/{id}/advisories
        [HttpPost("supervisees/{id}/advisories")]
        public async Task<IActionResult> SendAdvisory(int id, [FromBody] EcewsSendAdvisoryDto dto)
        {
            try
            {
                var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                // Verify supervisee exists and is under this supervisor
                var supervisee = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == id && u.EcewsSupervisorId == supervisorId);

                if (supervisee == null)
                    return NotFound(new { message = "Supervisee not found" });

                if (string.IsNullOrWhiteSpace(dto.Justification))
                    return BadRequest(new { message = "Justification is required" });

                var advisory = new Advisory
                {
                    IssuedById = supervisorId,
                    TargetUserId = id,
                    AdvisoryType = dto.AdvisoryType,
                    Justification = dto.Justification,
                    Status = "Pending",
                    IssuedAt = DateTime.UtcNow
                };

                _context.Advisories.Add(advisory);
                await _context.SaveChangesAsync();

                // TODO: Send notification to Programs Team

                return Ok(new { message = "Advisory sent successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending advisory");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // POST: api/EcewsSupervisor/timesheets/{id}/comments
        [HttpPost("timesheets/{id}/comments")]
        public async Task<IActionResult> AddComment(int id, [FromBody] string comment)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var user = await _context.Users.FindAsync(userId);

                var timesheet = await _context.Timesheets
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (timesheet == null)
                    return NotFound(new { message = "Timesheet not found" });

                var newComment = new Comment
                {
                    TimesheetId = id,
                    UserId = userId,
                    UserRole = "ECEWS Supervisor",
                    UserAvatar = GetInitials(user?.FullName ?? ""),
                    CommentText = comment,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Comments.Add(newComment);
                await _context.SaveChangesAsync();

                // Notify staff
                await _notificationService.CreateCommentNotification(id, timesheet.UserId, user?.FullName ?? "ECEWS Supervisor", "ECEWS Supervisor");

                return Ok(new { message = "Comment added successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding comment");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        #region Helper Methods

        private string GetStatusDisplay(string status)
        {
            return status switch
            {
                "Submitted" => "ECEWS Review",
                "GONReview" => "Programs Review",
                "ProgramsTeam" => "Programs Review",
                "HR" => "HR Review",
                "Approved" => "Approved",
                "Rejected" => "Returned",
                _ => status
            };
        }

        private string GetStatusType(string status, string tab)
        {
            if (tab == "returned") return "returned";
            
            return status switch
            {
                "Submitted" => "ecews",
                "GONReview" => "programs",
                "ProgramsTeam" => "programs",
                "HR" => "hr",
                "Approved" => "approved",
                "Rejected" => "returned",
                _ => "ecews"
            };
        }

        private string GetInitials(string fullName)
        {
            if (string.IsNullOrEmpty(fullName)) return "U";
            var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2)
                return $"{parts[0][0]}{parts[1][0]}".ToUpper();
            return fullName.Length > 0 ? fullName[0].ToString().ToUpper() : "U";
        }

        private string MaskAccountNumber(string? accountNumber)
        {
            if (string.IsNullOrEmpty(accountNumber) || accountNumber.Length < 4)
                return accountNumber ?? "Not provided";
            return "****" + accountNumber.Substring(accountNumber.Length - 4);
        }

        #endregion
    }
}