// GonSupervisorController.cs - Controller for GON Supervisor functionalities like dashboard, timesheet review, and supervisee management

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
    [Authorize(Roles = "GonSupervisor")]
    public class GonSupervisorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly ILogger<GonSupervisorController> _logger;
        private readonly ITimesheetService _timesheetService;
        private readonly IPdfService _pdfService;
        public GonSupervisorController(
            ApplicationDbContext context,
            INotificationService notificationService,
            ILogger<GonSupervisorController> logger,
            ITimesheetService timesheetService,
            IPdfService pdfService)
        {
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
            _pdfService = pdfService;
            _timesheetService = timesheetService;
        }

        // GET: api/GonSupervisor/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                var superviseeIds = await _context.Users
                    .Where(u => u.GonSupervisorId == supervisorId)
                    .Select(u => u.Id)
                    .ToListAsync();

                // Pending timesheets - ONLY GONReview status (approved by ECEWS)
                var pendingTimesheets = await _context.Timesheets
                    .CountAsync(t => superviseeIds.Contains(t.UserId) && t.Status == "GONReview");

                // Approved this month - includes ProgramsReview (approved by Facility Supervisor) and Approved
                var now = DateTime.UtcNow;
                var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var endOfMonth = startOfMonth.AddMonths(1).AddSeconds(-1);
                
                var approvedThisMonth = await _context.Timesheets
                    .CountAsync(t => superviseeIds.Contains(t.UserId) && 
                        (t.Status == "ProgramsReview" || t.Status == "Approved") &&
                        t.UpdatedAt.HasValue &&
                        t.UpdatedAt.Value >= startOfMonth &&
                        t.UpdatedAt.Value <= endOfMonth);

                // Returned for correction
                var returnedForCorrection = await _context.Timesheets
                    .CountAsync(t => superviseeIds.Contains(t.UserId) && t.Status == "Rejected");

                // Supervisees count
                var superviseesCount = superviseeIds.Count;

                // Active timesheets - 
                var activeTimesheets = await _context.Timesheets
                    .Include(t => t.User)
                    .Where(t => superviseeIds.Contains(t.UserId) && t.Status == "GONReview")
                    .OrderByDescending(t => t.SubmittedAt)
                    .Take(10)
                    .Select(t => new GonActiveTimesheetDto
                    {
                        Id = t.Id,
                        StaffName = t.User != null ? t.User.FullName : "Unknown",
                        Department = t.User != null ? t.User.Department ?? "Not specified" : "Unknown",
                        Month = $"{t.Month} {t.Year}",
                        SubmissionDate = t.SubmittedAt.ToString("dd-MM-yyyy"),
                        Status = "Facility Supervisor Review"
                    })
                    .ToListAsync();

                var dashboard = new GonDashboardDto
                {
                    PendingTimesheets = pendingTimesheets,
                    ApprovedThisMonth = approvedThisMonth,
                    ReturnedForCorrection = returnedForCorrection,
                    SuperviseesCount = superviseesCount,
                    ActiveTimesheets = activeTimesheets
                };

                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting GON dashboard");
                return StatusCode(500, new { message = "An error occurred while loading dashboard" });
            }
        }
        // GET: api/GonSupervisor/timesheets/review?tab=pending
        [HttpGet("timesheets/review")]
        public async Task<IActionResult> GetTimesheetsForReview([FromQuery] string tab = "pending")
        {
            try
            {
                var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                var superviseeIds = await _context.Users
                    .Where(u => u.GonSupervisorId == supervisorId)
                    .Select(u => u.Id)
                    .ToListAsync();

                IQueryable<Timesheet> query = _context.Timesheets
                    .Include(t => t.User)
                    .Where(t => superviseeIds.Contains(t.UserId));

                switch (tab.ToLower())
                {
                    case "pending":
                        // ONLY timesheets that have been approved by ECEWS 
                        query = query.Where(t => t.Status == "GONReview");
                        break;
                    case "approved":
                        query = query.Where(t => t.Status == "ProgramsReview");
                        break;
                    case "returned":
                        query = query.Where(t => t.Status == "Rejected");
                        break;
                    default:
                        query = query.Where(t => t.Status == "GONReview");
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
                        t.Month,
                        t.Year,
                        StaffName = t.User != null ? t.User.FullName : "Unknown",
                        Department = t.User != null ? t.User.Department ?? "Not specified" : "Unknown"
                    })
                    .ToListAsync();

                // Map to DTO after fetching
                var result = timesheets.Select(t => new GonTimesheetReviewDto
                {
                    Id = t.Id,
                    StaffName = t.StaffName,
                    Department = t.Department,
                    Month = $"{t.Month} {t.Year}",
                    SubmissionDate = t.SubmittedAt != default ? t.SubmittedAt.ToString("dd-MM-yyyy") : "",
                    Status = GetStatusDisplayStatic(t.Status),
                    StatusType = GetStatusTypeStatic(t.Status, tab)
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting timesheets for review");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // GET: api/GonSupervisor/timesheets/{id}
        [HttpGet("timesheets/{id}")]
        public async Task<IActionResult> GetTimesheetDetail(int id)
        {
            try
            {
                var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                var timesheet = await _context.Timesheets
                    .Include(t => t.User)
                    .Include(t => t.Entries)
                    .Include(t => t.CommentsList)
                        .ThenInclude(c => c.User)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (timesheet == null)
                    return NotFound(new { message = "Timesheet not found" });

                // Verify supervisor has access to this timesheet
                if (timesheet.User == null || timesheet.User.GonSupervisorId != supervisorId)
                    return Forbid();

                var detail = new GonTimesheetDetailDto
                {
                    Id = timesheet.Id,
                    MonthYear = $"{timesheet.Month} {timesheet.Year}",
                    StaffName = timesheet.User.FullName,
                    FullName = timesheet.User.FullName,
                    Department = timesheet.User.Department ?? "Not specified",
                    Location = timesheet.User.State ?? "Not specified",
                    BankName = timesheet.User.BankName ?? "Not specified",
                    AccountNumber = MaskAccountNumber(timesheet.User.AccountNumber),
                    Status = GetStatusDisplayStatic(timesheet.Status),
                    StatusPill = GetStatusPillClass(timesheet.Status),
                    Entries = timesheet.Entries.Select(e => new GonTimesheetEntryDto
                    {
                        Date = e.Date.ToString("dd-MM-yyyy"),
                        StartTime = e.StartTime.ToString(@"hh\:mm"),
                        EndTime = e.EndTime.ToString(@"hh\:mm"),
                        TotalHours = $"{e.TotalHours} hrs",
                        WorkDone = e.WorkDone
                    }).ToList(),
                    TotalHours = timesheet.TotalHours,
                    SummaryInfo = $"{timesheet.TotalDaysWorked} days, {timesheet.TotalHours} hours",
                    Comments = timesheet.CommentsList.Select(c => new GonCommentDto
                    {
                        Id = c.Id,
                        AuthorName = c.User?.FullName ?? "Unknown",
                        AuthorRole = c.UserRole,
                        AuthorAvatar = GetInitials(c.User?.FullName ?? ""),
                        CommentText = c.CommentText,
                        CreatedAt = c.CreatedAt.ToString("dd-MM-yyyy HH:mm")
                    }).ToList()
                };

                return Ok(detail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting timesheet detail {TimesheetId} for supervisor {SupervisorId}", 
                    id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { message = "An error occurred loading timesheet details" });
            }
        }

        // POST: api/GonSupervisor/timesheets/{id}/approve
        [HttpPost("timesheets/{id}/approve")]
        public async Task<IActionResult> ApproveTimesheet(int id, [FromBody] GonApproveTimesheetDto dto)
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
                if (timesheet.User == null || timesheet.User.GonSupervisorId != supervisorId)
                    return Forbid();

                
                timesheet.Status = "ProgramsReview"; 
                timesheet.GonReviewedAt = DateTime.UtcNow;
                timesheet.GonReviewerId = supervisorId;
                timesheet.Comments = dto.Comments ?? timesheet.Comments;
                timesheet.UpdatedAt = DateTime.UtcNow;

                // Create concern if flagged
                if (dto.FlagConcern && !string.IsNullOrWhiteSpace(dto.ConcernDescription))
                {
                    var concern = new Concern
                    {
                        TimesheetId = id,
                        RaisedById = supervisorId,
                        TargetUserId = timesheet.UserId,
                        ConcernType = dto.ConcernType ?? "Performance",
                        Severity = dto.Severity ?? "Medium",
                        Description = dto.ConcernDescription,
                        Status = "Open",
                        RaisedAt = DateTime.UtcNow
                    };
                    _context.Concerns.Add(concern);
                }

                await _context.SaveChangesAsync();

                // Send notification to staff and Programs team
                await _notificationService.CreateTimesheetUnderReviewNotification(id, timesheet.UserId, "Programs");

                return Ok(new { message = "Timesheet approved and sent to Programs team" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving timesheet");
                return StatusCode(500, new { message = "An error occurred while approving timesheet" });
            }
        }

        // POST: api/GonSupervisor/timesheets/{id}/decline
        [HttpPost("timesheets/{id}/decline")]
        public async Task<IActionResult> DeclineTimesheet(int id, [FromBody] GonDeclineTimesheetDto dto)
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
                if (timesheet.User == null || timesheet.User.GonSupervisorId != supervisorId)
                    return Forbid();

                // Update timesheet status
                timesheet.Status = "Rejected";
                timesheet.GonReviewedAt = DateTime.UtcNow;
                timesheet.GonReviewerId = supervisorId;
                timesheet.Comments = dto.Feedback;
                timesheet.UpdatedAt = DateTime.UtcNow;

                // Add comment
                var comment = new Comment
                {
                    TimesheetId = id,
                    UserId = supervisorId,
                    UserRole = "GON Supervisor",
                    UserAvatar = GetInitials(supervisor?.FullName ?? ""),
                    CommentText = dto.Feedback,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Comments.Add(comment);

                await _context.SaveChangesAsync();

                // Send notification to staff
                await _notificationService.CreateTimesheetRejectedNotification(id, timesheet.UserId, supervisor?.FullName ?? "GON Supervisor", "GON Supervisor", dto.Feedback);

                return Ok(new { message = "Timesheet returned with feedback" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error declining timesheet {TimesheetId} for supervisor {SupervisorId}", 
                    id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { message = "An error occurred while declining timesheet" });
            }
        }

        [HttpGet("timesheets/{id}/download")]
        public async Task<IActionResult> DownloadTimesheet(int id)
        {
            var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var timesheet = await _timesheetService.GetTimesheetForReview(id, supervisorId, "GonSupervisor");
            
            if (timesheet == null)
                return NotFound();

            var pdfBytes = await _pdfService.GenerateTimesheetPdf(timesheet);
            return File(pdfBytes, "application/pdf", $"Timesheet_{timesheet.MonthYear}_{timesheet.UserName}.pdf");
        }

        // GET: api/GonSupervisor/supervisees
        [HttpGet("supervisees")]
        public async Task<IActionResult> GetSupervisees()
        {
            try
            {
                var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                var supervisees = await _context.Users
                    .Where(u => u.GonSupervisorId == supervisorId)
                    .Select(u => new GonSuperviseeListDto
                    {
                        Id = u.Id,
                        Name = u.FullName,
                        Designation = u.Designation ?? "Not specified",
                        StaffId = u.EmployeeCode ?? "Not assigned",
                        ContractStatus = u.ContractStatus ?? "Active",
                        ContractStatusClass = GetContractStatusClass(u.ContractStatus)
                    })
                    .ToListAsync();

                return Ok(supervisees);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting supervisees for supervisor {SupervisorId}", 
                    User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { message = "An error occurred loading supervisees" });
            }
        }

        // POST: api/GonSupervisor/supervisees/{id}/concerns
        [HttpPost("supervisees/{id}/concerns")]
        public async Task<IActionResult> RaiseConcern(int id, [FromBody] GonRaiseConcernDto dto)
        {
            try
            {
                var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                // Verify supervisee exists and is under this supervisor
                var supervisee = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == id && u.GonSupervisorId == supervisorId);

                if (supervisee == null)
                    return NotFound(new { message = "Supervisee not found" });

                if (string.IsNullOrWhiteSpace(dto.Description))
                    return BadRequest(new { message = "Description is required" });

                var concern = new Concern
                {
                    // Don't set TimesheetId - it's nullable
                    RaisedById = supervisorId,
                    TargetUserId = id,
                    ConcernType = dto.ConcernType ?? "Performance",
                    Severity = dto.Severity ?? "Medium",
                    Description = dto.Description,
                    Status = "Open",
                    RaisedAt = DateTime.UtcNow
                };

                _context.Concerns.Add(concern);
                await _context.SaveChangesAsync();

                // Notify ECEWS supervisor
                if (supervisee.EcewsSupervisorId.HasValue)
                {
                    await _notificationService.CreateConcernRaisedNotification(concern.Id, id, supervisee.FullName);
                }

                return Ok(new { message = "Concern raised successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error raising concern for supervisee {SuperviseeId} by supervisor {SupervisorId}", 
                    id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { message = "An error occurred while raising concern" });
            }
        }
        // POST: api/GonSupervisor/timesheets/{id}/comments
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
                    UserRole = "GON Supervisor",
                    UserAvatar = GetInitials(user?.FullName ?? ""),
                    CommentText = comment,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Comments.Add(newComment);
                await _context.SaveChangesAsync();

                // Notify staff
                await _notificationService.CreateCommentNotification(id, timesheet.UserId, user?.FullName ?? "GON Supervisor", "GON Supervisor");

                return Ok(new { message = "Comment added successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding comment to timesheet {TimesheetId} by supervisor {SupervisorId}", 
                    id, User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                return StatusCode(500, new { message = "An error occurred while adding comment" });
            }
        }

        #region Helper Methods

        private static string GetStatusDisplayStatic(string status)
        {
            return status switch
            {
                "GONReview" => "Facility Supervisor Review",
                "Approved" => "Approved",
                "Rejected" => "Returned",
                "ProgramsTeam" => "Programs Review",
                "HR" => "HR Review",
                _ => status
            };
        }

        private static string GetStatusTypeStatic(string status, string tab)
        {
            if (tab == "returned") return "returned";
            
            return status switch
            {
                "GONReview" => "gon",
                "Approved" => "approved",
                "ProgramsTeam" => "programs",
                "HR" => "hr",
                _ => "gon"
            };
        }

        private static string GetStatusPillClass(string status)
        {
            return status switch
            {
                "GONReview" => "gon-review",
                "Approved" => "approved",
                "Rejected" => "returned",
                _ => "pending"
            };
        }

        private static string GetContractStatusClass(string? status)
        {
            return status?.ToLower().Replace(" ", "") switch
            {
                "active" => "active",
                "expiringsoon" => "expiringsoon",
                "onpip" => "onpip",
                "terminated" => "terminated",
                "terminationpending" => "terminationpending",
                _ => "active"
            } ?? "active";
        }

        private string GetInitials(string? fullName)
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