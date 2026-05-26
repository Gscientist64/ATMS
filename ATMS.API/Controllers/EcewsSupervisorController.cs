// ATMS.API/Controllers/EcewsSupervisorController.cs

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
        private readonly IPdfService _pdfService;
        private readonly ITimesheetService _timesheetService;
        
        public EcewsSupervisorController(
            ApplicationDbContext context,
            INotificationService notificationService,
            ILogger<EcewsSupervisorController> logger,
            IPdfService pdfService,
            ITimesheetService timesheetService)
        {
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
            _pdfService = pdfService;
            _timesheetService = timesheetService;
        }

        // GET: api/EcewsSupervisor/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var superviseeIds = await _context.Users
                .Where(u => u.EcewsSupervisorId == supervisorId)
                .Select(u => u.Id)
                .ToListAsync();
            
            var pendingCount = await _context.Timesheets
                .CountAsync(t => superviseeIds.Contains(t.UserId) && t.Status == "Submitted");
            
            var approvedCount = await _context.Timesheets
                .CountAsync(t => superviseeIds.Contains(t.UserId) && (t.Status == "GONReview" || t.Status == "ProgramsReview" || t.Status == "Approved"));
            
            var returnedCount = await _context.Timesheets
                .CountAsync(t => superviseeIds.Contains(t.UserId) && t.Status == "Rejected");
            
            var activePipsCount = await _context.PerformanceImprovementPlans
                .CountAsync(p => superviseeIds.Contains(p.UserId) && p.Status == "Active");
            
            return Ok(new
            {
                pendingCount,
                approvedCount,
                returnedCount,
                totalStaff = superviseeIds.Count,
                activePips = activePipsCount
            });
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
                    .Where(t => superviseeIds.Contains(t.UserId));
                
                switch (tab.ToLower())
                {
                    case "pending":
                        query = query.Where(t => t.Status == "Submitted");
                        break;
                    case "approved":
                        query = query.Where(t => t.Status == "GONReview" || t.Status == "ProgramsReview" || t.Status == "Approved");
                        break;
                    case "returned":
                        query = query.Where(t => t.Status == "Rejected");
                        break;
                    default:
                        query = query.Where(t => t.Status == "Submitted");
                        break;
                }
                
                var timesheets = await query
                    .OrderByDescending(t => t.SubmittedAt)
                    .Select(t => new TimesheetListDto
                    {
                        Id = t.Id,
                        MonthYear = $"{t.Month} {t.Year}",
                        DaysWorked = $"{t.TotalDaysWorked} Day{(t.TotalDaysWorked != 1 ? "s" : "")}",
                        SubmittedDate = t.SubmittedAt.ToString("dd-MM-yyyy"),
                        Status = t.Status,
                        StatusType = GetStatusTypeForTab(t.Status, tab),
                        StaffName = t.User != null ? t.User.FullName : ""
                    })
                    .ToListAsync();
                
                return Ok(timesheets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting timesheets for review");
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }

        // Static helper method for EF translation
        private static string GetStatusTypeForTab(string status, string tab)
        {
            if (tab == "returned") return "returned";
            if (tab == "approved") return "approved";
            if (tab == "pending") return "pending";
            
            return status?.ToLower() switch
            {
                "submitted" => "pending",
                "programsreview" => "approved",
                "approved" => "approved",
                "rejected" => "returned",
                _ => "pending"
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

                if (timesheet.User == null || timesheet.User.EcewsSupervisorId != supervisorId)
                    return Forbid();

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
                    Status = timesheet.Status,
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
                        AuthorAvatar = GetInitialsStatic(c.User?.FullName ?? ""),
                        CommentText = c.CommentText,
                        CreatedAt = c.CreatedAt.ToString("dd-MM-yyyy HH:mm")
                    }).ToList(),
                    Concerns = concerns.Select(c => new EcewsConcernDto
                    {
                        Id = c.Id,
                        AuthorName = c.RaisedBy?.FullName ?? "Unknown",
                        AuthorRole = "GON Supervisor",
                        AuthorAvatar = GetInitialsStatic(c.RaisedBy?.FullName ?? ""),
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

                if (timesheet.User == null || timesheet.User.EcewsSupervisorId != supervisorId)
                    return Forbid();

                timesheet.Status = "GONReview";
                timesheet.EcewsReviewedAt = DateTime.UtcNow;
                timesheet.EcewsReviewerId = supervisorId;
                timesheet.Comments = dto.Comments ?? timesheet.Comments;
                timesheet.UpdatedAt = DateTime.UtcNow;

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
                await _notificationService.CreateTimesheetUnderReviewNotification(id, timesheet.UserId, "Programs");

                return Ok(new { message = "Timesheet approved and forwarded to Programs" });
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

                if (timesheet.User == null || timesheet.User.EcewsSupervisorId != supervisorId)
                    return Forbid();

                timesheet.Status = "Rejected";
                timesheet.EcewsReviewedAt = DateTime.UtcNow;
                timesheet.EcewsReviewerId = supervisorId;
                timesheet.Comments = dto.Feedback;
                timesheet.UpdatedAt = DateTime.UtcNow;

                var comment = new Comment
                {
                    TimesheetId = id,
                    UserId = supervisorId,
                    UserRole = "ECEWS Supervisor",
                    UserAvatar = GetInitialsStatic(supervisor?.FullName ?? ""),
                    CommentText = dto.Feedback,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Comments.Add(comment);

                await _context.SaveChangesAsync();
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
                var supervisor = await _context.Users.FindAsync(supervisorId);
                var query = _context.Users
                    .Where(u => u.EcewsSupervisorId == supervisorId);
                if (!string.IsNullOrEmpty(supervisor?.State))
                {
                    query = query.Where(u => u.State == supervisor.State);
                }
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
                
                var supervisee = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == id && u.EcewsSupervisorId == supervisorId);
                
                if (supervisee == null)
                    return NotFound(new { message = "Supervisee not found" });
                
                // Get advisories for this supervisee
                var advisories = await _context.Advisories
                    .Include(a => a.IssuedBy)
                    .Where(a => a.TargetUserId == id)
                    .OrderByDescending(a => a.IssuedAt)
                    .Select(a => new
                    {
                        id = a.Id,
                        advisoryText = a.Justification,
                        type = a.AdvisoryType,
                        status = a.Status,
                        createdAt = a.IssuedAt.ToString("dd-MM-yyyy HH:mm"),
                        authorName = a.IssuedBy != null ? a.IssuedBy.FullName : "Unknown",
                        authorRole = a.IssuedBy != null && a.IssuedBy.Role != null ? a.IssuedBy.Role.Name : "ECEWS Supervisor",
                        authorAvatar = GetInitialsStatic(a.IssuedBy != null ? a.IssuedBy.FullName : "")
                    })
                    .ToListAsync();
                
                // Get concerns from GON supervisor (if any)
                var concerns = await _context.Concerns
                    .Include(c => c.RaisedBy)
                    .Where(c => c.TargetUserId == id)
                    .OrderByDescending(c => c.RaisedAt)
                    .Select(c => new
                    {
                        id = c.Id,
                        concernText = c.Description,
                        severity = c.Severity,
                        type = c.ConcernType,
                        createdAt = c.RaisedAt.ToString("dd-MM-yyyy HH:mm"),
                        authorName = c.RaisedBy != null ? c.RaisedBy.FullName : "Unknown",
                        authorRole = "GON Supervisor",
                        authorAvatar = GetInitialsStatic(c.RaisedBy != null ? c.RaisedBy.FullName : "")
                    })
                    .ToListAsync();
                
                // Map to DTO
                var result = new
                {
                    id = supervisee.Id,
                    fullName = supervisee.FullName,
                    department = supervisee.Department,
                    location = supervisee.State,
                    contractStatus = supervisee.ContractStatus,
                    bankName = supervisee.BankName,
                    accountNumber = MaskAccountNumber(supervisee.AccountNumber),
                    email = supervisee.Email,
                    phoneNumber = supervisee.PhoneNumber,
                    designation = supervisee.Designation,
                    employeeCode = supervisee.EmployeeCode,
                    gonConcerns = concerns,
                    advisories = advisories
                };
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting supervisee detail");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }
        // POST: api/EcewsSupervisor/supervisees/{id}/advisories
        [HttpPost("supervisees/{id}/advisories")]
        public async Task<IActionResult> SendAdvisory(int id, [FromBody] EcewsSendAdvisoryDto dto)
        {
            try
            {
                var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

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

                return Ok(new { message = "Advisory sent successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending advisory");
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        [HttpGet("timesheets/{id}/download")]
        public async Task<IActionResult> DownloadTimesheet(int id)
        {
            var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var timesheet = await _timesheetService.GetTimesheetForReview(id, supervisorId, "EcewsSupervisor");
            
            if (timesheet == null)
                return NotFound();

            var pdfBytes = await _pdfService.GenerateTimesheetPdf(timesheet);
            return File(pdfBytes, "application/pdf", $"Timesheet_{timesheet.MonthYear}_{timesheet.UserName}.pdf");
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
                    UserAvatar = GetInitialsStatic(user?.FullName ?? ""),
                    CommentText = comment,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Comments.Add(newComment);
                await _context.SaveChangesAsync();
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

        private static string GetInitialsStatic(string? fullName)
        {
            if (string.IsNullOrEmpty(fullName)) return "U";
            var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2)
                return $"{parts[0][0]}{parts[1][0]}".ToUpper();
            return fullName.Length > 0 ? fullName[0].ToString().ToUpper() : "U";
        }

        private static string MaskAccountNumber(string? accountNumber)
        {
            if (string.IsNullOrEmpty(accountNumber) || accountNumber.Length < 4)
                return accountNumber ?? "Not provided";
            return "****" + accountNumber.Substring(accountNumber.Length - 4);
        }

        #endregion
    }
}