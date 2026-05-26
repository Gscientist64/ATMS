using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ATMS.API.Data;
using ATMS.API.DTOs;
using ATMS.API.Models;

namespace ATMS.API.Services
{
    public interface ITimesheetService
    {
        // AdHoc User Methods
        Task<TimesheetDetailDto> CreateTimesheet(int userId, CreateTimesheetDto dto);
        Task<List<TimesheetListDto>> GetUserTimesheets(int userId);
        Task<TimesheetDetailDto> GetTimesheetById(int id, int userId, string userRole);
        Task<TimesheetDetailDto> UpdateTimesheet(int id, int userId, CreateTimesheetDto dto);
        Task<TimesheetDetailDto> SubmitTimesheet(int id, int userId, string comments);
        Task<TimesheetDetailDto> GetTimesheetForReview(int id, int reviewerId, string reviewerRole);
        
        // Supervisor Methods
        Task<List<TimesheetListDto>> GetTimesheetsForReview(int supervisorId, string supervisorRole, string status);
        Task<TimesheetDetailDto> ReviewTimesheet(int id, int reviewerId, string action, string comments);
        Task<TimesheetDetailDto> AddComment(int timesheetId, int userId, string comment);
    }

    public class TimesheetService : ITimesheetService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TimesheetService> _logger;
        private readonly INotificationService _notificationService;

        public TimesheetService(ApplicationDbContext context, ILogger<TimesheetService> logger, INotificationService notificationService)
        {
            _context = context;
            _logger = logger;
            _notificationService = notificationService;
        }

        public async Task<TimesheetDetailDto> CreateTimesheet(int userId, CreateTimesheetDto dto)
        {
            try
            {
                _logger.LogInformation($"Creating timesheet for user {userId} with {dto.Entries?.Count} entries");
                
                var user = await _context.Users.FindAsync(userId);
                if (user == null) 
                {
                    _logger.LogError($"User {userId} not found");
                    throw new Exception("User not found");
                }

                // Ensure all dates are UTC
                var now = DateTime.UtcNow;
                
                var timesheet = new Timesheet
                {
                    UserId = userId,
                    Month = dto.Month,
                    Year = dto.Year,
                    WeekStarting = DateTime.SpecifyKind(dto.WeekStarting, DateTimeKind.Utc),
                    WeekEnding = DateTime.SpecifyKind(dto.WeekEnding, DateTimeKind.Utc),
                    Status = "Draft",
                    CreatedAt = now,
                    SubmittedAt = now,
                    Entries = new List<TimesheetEntry>()
                };

                double totalHours = 0;
                if (dto.Entries != null)
                {
                    foreach (var entryDto in dto.Entries)
                    {
                        try
                        {
                            var entry = MapToTimesheetEntry(entryDto);
                            entry.Timesheet = timesheet;
                            timesheet.Entries.Add(entry);
                            totalHours += entry.TotalHours;
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, $"Error mapping entry");
                            throw;
                        }
                    }
                }

                timesheet.TotalHours = totalHours;
                timesheet.TotalDaysWorked = timesheet.Entries.Count;

                _context.Timesheets.Add(timesheet);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Timesheet created successfully with ID {timesheet.Id}");

                return await GetTimesheetById(timesheet.Id, userId, "AdHoc");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating timesheet for user {UserId}", userId);
                throw;
            }
        }

        public async Task<TimesheetDetailDto> UpdateTimesheet(int id, int userId, CreateTimesheetDto dto)
        {
            try
            {
                var timesheet = await _context.Timesheets
                    .Include(t => t.Entries)
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

                if (timesheet == null)
                    throw new Exception("Timesheet not found");

                if (timesheet.Status != "Draft")
                    throw new Exception("Only draft timesheets can be updated");

                // Update timesheet properties
                timesheet.Month = dto.Month;
                timesheet.Year = dto.Year;
                timesheet.WeekStarting = dto.WeekStarting;
                timesheet.WeekEnding = dto.WeekEnding;
                timesheet.UpdatedAt = DateTime.UtcNow;

                // Remove old entries
                _context.TimesheetEntries.RemoveRange(timesheet.Entries);

                // Add new entries
                double totalHours = 0;
                foreach (var entryDto in dto.Entries)
                {
                    var entry = MapToTimesheetEntry(entryDto);
                    entry.TimesheetId = timesheet.Id;
                    _context.TimesheetEntries.Add(entry);
                    totalHours += entry.TotalHours;
                }

                timesheet.TotalHours = totalHours;
                timesheet.TotalDaysWorked = dto.Entries.Count;

                await _context.SaveChangesAsync();

                return await GetTimesheetById(id, userId, "AdHoc");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating timesheet {TimesheetId}", id);
                throw;
            }
        }

        public async Task<TimesheetDetailDto> SubmitTimesheet(int id, int userId, string comments)
        {
            try
            {
                var timesheet = await _context.Timesheets
                    .Include(t => t.User)
                    .Include(t => t.Entries)
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

                if (timesheet == null) throw new Exception("Timesheet not found");

                timesheet.Status = "Submitted";
                timesheet.SubmittedAt = DateTime.UtcNow;
                timesheet.Comments = comments;
                timesheet.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Create notification for the user that timesheet was submitted
                await _notificationService.CreateNotification(new CreateNotificationDto
                {
                    UserId = userId,
                    Type = "timesheet_submitted",
                    Title = "Timesheet Submitted",
                    Message = $"Your timesheet for {timesheet.Month} {timesheet.Year} has been submitted successfully",
                    Data = new { timesheetId = id, month = timesheet.Month, year = timesheet.Year },
                    ActionUrl = $"/timesheet/{id}",
                    Priority = "Low"
                });

                // Notify ECEWS supervisor
                if (timesheet.User?.EcewsSupervisorId != null)
                {
                    await _notificationService.CreateTimesheetSubmittedNotification(id, userId);
                }

                return await GetTimesheetById(id, userId, "AdHoc");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting timesheet {TimesheetId}", id);
                throw;
            }
        }

        public async Task<List<TimesheetListDto>> GetUserTimesheets(int userId)
        {
            try
            {
                var timesheets = await _context.Timesheets
                    .Where(t => t.UserId == userId)
                    .OrderByDescending(t => t.Year)
                    .ThenByDescending(t => t.CreatedAt)
                    .ToListAsync();

                return timesheets.Select(t => new TimesheetListDto
                {
                    Id = t.Id,
                    MonthYear = $"{t.Month} {t.Year}",
                    DaysWorked = $"{t.TotalDaysWorked} Day{(t.TotalDaysWorked != 1 ? "s" : "")}",
                    SubmittedDate = t.SubmittedAt.ToString("dd-MM-yyyy"),
                    Status = t.Status,
                    StatusType = GetStatusType(t.Status)
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting timesheets for user {UserId}", userId);
                throw;
            }
        }

        public async Task<TimesheetDetailDto> GetTimesheetById(int id, int userId, string userRole)
        {
            try
            {
                var query = _context.Timesheets
                    .Include(t => t.User)
                    .Include(t => t.Entries)
                    .Include(t => t.CommentsList)
                        .ThenInclude(c => c.User)
                    .AsQueryable();

                if (userRole == "AdHoc")
                {
                    query = query.Where(t => t.UserId == userId);
                }

                var timesheet = await query.FirstOrDefaultAsync(t => t.Id == id);
                if (timesheet == null) return null;

                return new TimesheetDetailDto
                {
                    Id = timesheet.Id,
                    UserId = timesheet.UserId,
                    MonthYear = $"{timesheet.Month} {timesheet.Year}",
                    UserName = timesheet.User?.FullName ?? "",
                    UserEmployeeCode = timesheet.User?.EmployeeCode ?? "",
                    FullName = timesheet.User?.FullName ?? "",
                    Location = timesheet.User?.State ?? "",
                    Department = timesheet.User?.Department ?? "",
                    Status = timesheet.Status,
                    StatusType = GetStatusType(timesheet.Status),
                    Entries = timesheet.Entries.Select(e => new TimesheetEntryDto
                    {
                        Id = e.Id,
                        Date = e.Date.ToString("dd-MM-yyyy"),
                        StartTime = e.StartTime.ToString(@"hh\:mm"),
                        EndTime = e.EndTime.ToString(@"hh\:mm"),
                        TotalHours = $"{e.TotalHours} hr{(e.TotalHours != 1 ? "s" : "")}",
                        WorkDone = e.WorkDone ?? "",
                        LGA = e.LGA,
                        Ward = e.Ward,
                        HealthFacility = e.HealthFacility
                    }).ToList(),
                    TotalHours = timesheet.TotalHours,
                    Comments = timesheet.CommentsList?
                        .OrderByDescending(c => c.CreatedAt)
                        .Select(c => new CommentDto
                        {
                            Id = c.Id,
                            UserName = c.User?.FullName ?? "",
                            UserRole = c.UserRole ?? "",
                            UserAvatar = GetUserAvatar(c.User),
                            CommentText = c.CommentText ?? "",
                            CreatedAt = c.CreatedAt.ToString("dd-MM-yyyy HH:mm")
                        }).ToList() ?? new List<CommentDto>()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting timesheet {TimesheetId}", id);
                throw;
            }
        }

        public async Task<TimesheetDetailDto> GetTimesheetForReview(int id, int reviewerId, string reviewerRole)
        {
            try
            {
                var query = _context.Timesheets
                    .Include(t => t.User)
                    .Include(t => t.Entries)
                    .Include(t => t.CommentsList)
                        .ThenInclude(c => c.User)
                    .Include(t => t.WorkflowStages)
                    .AsQueryable();

                var timesheet = await query.FirstOrDefaultAsync(t => t.Id == id);
                if (timesheet == null) return null;

                // Verify reviewer has access to this timesheet
                if (reviewerRole == "EcewsSupervisor")
                {
                    if (timesheet.User?.EcewsSupervisorId != reviewerId)
                        return null;
                }
                else if (reviewerRole == "GonSupervisor")
                {
                    if (timesheet.User?.GonSupervisorId != reviewerId)
                        return null;
                }

                return new TimesheetDetailDto
                {
                    Id = timesheet.Id,
                    UserId = timesheet.UserId,
                    MonthYear = $"{timesheet.Month} {timesheet.Year}",
                    UserName = timesheet.User?.FullName ?? "",
                    UserEmployeeCode = timesheet.User?.EmployeeCode ?? "",
                    FullName = timesheet.User?.FullName ?? "",
                    Location = timesheet.User?.State ?? "",
                    Department = timesheet.User?.Department ?? "",
                    Status = timesheet.Status,
                    StatusType = GetStatusType(timesheet.Status),
                    WorkflowStages = timesheet.WorkflowStages?
                        .OrderBy(w => w.StageOrder)
                        .Select(w => new WorkflowStageDto
                        {
                            Name = w.StageName,
                            Completed = w.IsCompleted,
                            Current = w.IsCurrent,
                            Order = w.StageOrder
                        }).ToList() ?? GetDefaultWorkflowStages(timesheet.Status),
                    Entries = timesheet.Entries.Select(e => new TimesheetEntryDto
                    {
                        Id = e.Id,
                        Date = e.Date.ToString("dd-MM-yyyy"),
                        StartTime = e.StartTime.ToString(@"hh\:mm"),
                        EndTime = e.EndTime.ToString(@"hh\:mm"),
                        TotalHours = $"{e.TotalHours} hr{(e.TotalHours != 1 ? "s" : "")}",
                        WorkDone = e.WorkDone ?? "",
                        LGA = e.LGA ?? "",
                        Ward = e.Ward ?? "",
                        HealthFacility = e.HealthFacility ?? ""
                    }).ToList(),
                    TotalHours = timesheet.TotalHours,
                    Comments = timesheet.CommentsList?
                        .OrderByDescending(c => c.CreatedAt)
                        .Select(c => new CommentDto
                        {
                            Id = c.Id,
                            UserName = c.User?.FullName ?? "",
                            UserRole = c.UserRole ?? "",
                            UserAvatar = GetUserAvatar(c.User),
                            CommentText = c.CommentText ?? "",
                            CreatedAt = c.CreatedAt.ToString("dd-MM-yyyy HH:mm")
                        }).ToList() ?? new List<CommentDto>()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting timesheet {TimesheetId} for review", id);
                throw;
            }
        }

        public async Task<List<TimesheetListDto>> GetTimesheetsForReview(int supervisorId, string supervisorRole, string status)
        {
            try
            {
                var superviseeIds = await _context.Users
                    .Where(u => (supervisorRole == "EcewsSupervisor" && u.EcewsSupervisorId == supervisorId) ||
                                (supervisorRole == "GonSupervisor" && u.GonSupervisorId == supervisorId))
                    .Select(u => u.Id)
                    .ToListAsync();

                var statusList = status.Split(',');
                
                var timesheets = await _context.Timesheets
                    .Include(t => t.User)
                    .Where(t => superviseeIds.Contains(t.UserId) && statusList.Contains(t.Status))
                    .OrderByDescending(t => t.SubmittedAt)
                    .ToListAsync();

                return timesheets.Select(t => new TimesheetListDto
                {
                    Id = t.Id,
                    MonthYear = $"{t.Month} {t.Year}",
                    DaysWorked = $"{t.TotalDaysWorked} Day{(t.TotalDaysWorked != 1 ? "s" : "")}",
                    SubmittedDate = t.SubmittedAt.ToString("dd-MM-yyyy"),
                    Status = t.Status,
                    StatusType = GetStatusType(t.Status)
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting timesheets for review for supervisor {SupervisorId}", supervisorId);
                throw;
            }
        }

        public async Task<TimesheetDetailDto> ReviewTimesheet(int id, int reviewerId, string action, string comments)
        {
            try
            {
                var timesheet = await _context.Timesheets
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (timesheet == null) throw new Exception("Timesheet not found");

                var reviewer = await _context.Users
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == reviewerId);

                if (reviewer == null) throw new Exception("Reviewer not found");

                string oldStatus = timesheet.Status;

                if (reviewer.Role?.Name == "EcewsSupervisor")
                {
                    if (action == "Approve")
                    {   
                        _logger.LogInformation($"ECEWS APPROVING - Setting status to ProgramsReview for timesheet {id}");
                        timesheet.Status = "ProgramsReview";
                        timesheet.EcewsReviewedAt = DateTime.UtcNow;
                        timesheet.EcewsReviewerId = reviewerId;
                        
                        
                        // Notify user that timesheet is under ECEWS review
                        await _notificationService.CreateTimesheetUnderReviewNotification(id, timesheet.UserId, "ECEWS");
                    }
                    else if (action == "Reject")
                    {
                        timesheet.Status = "Rejected";
                        timesheet.EcewsReviewedAt = DateTime.UtcNow;
                        timesheet.EcewsReviewerId = reviewerId;
                        
                        // Notify user that timesheet was rejected
                        await _notificationService.CreateTimesheetRejectedNotification(
                            id, 
                            timesheet.UserId, 
                            reviewer.FullName, 
                            "ECEWS Supervisor", 
                            comments);
                    }
                }
                else if (reviewer.Role?.Name == "GonSupervisor")
                {
                    if (action == "Approve")
                    {
                        timesheet.Status = "ProgramsReview";
                        timesheet.GonReviewedAt = DateTime.UtcNow;
                        timesheet.GonReviewerId = reviewerId;
                        
                        // Notify user that timesheet was approved
                        await _notificationService.CreateTimesheetUnderReviewNotification(
                            id, 
                            timesheet.UserId,  
                            "Programs");
                    }
                    else if (action == "Reject")
                    {
                        timesheet.Status = "Rejected";
                        timesheet.GonReviewedAt = DateTime.UtcNow;
                        timesheet.GonReviewerId = reviewerId;
                        
                        // Notify user that timesheet was rejected
                        await _notificationService.CreateTimesheetRejectedNotification(
                            id, 
                            timesheet.UserId, 
                            reviewer.FullName, 
                            "GON Supervisor", 
                            comments);
                    }
                }

                timesheet.Comments = comments;
                timesheet.UpdatedAt = DateTime.UtcNow;

                var comment = new Comment
                {
                    TimesheetId = id,
                    UserId = reviewerId,
                    UserRole = reviewer.Role?.Name == "EcewsSupervisor" ? "ECEWS Supervisor" : "GON Supervisor",
                    UserAvatar = GetInitials(reviewer.FullName),
                    CommentText = comments,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Comments.Add(comment);

                await _context.SaveChangesAsync();

                // If status changed, create notification
                if (oldStatus != timesheet.Status)
                {
                    // Additional notifictions can be added here
                }

                return await GetTimesheetById(id, reviewerId, reviewer.Role?.Name ?? "");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reviewing timesheet {TimesheetId}", id);
                throw;
            }
        }
        public async Task<TimesheetDetailDto> AddComment(int timesheetId, int userId, string commentText)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) throw new Exception("User not found");

                var timesheet = await _context.Timesheets
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.Id == timesheetId);

                if (timesheet == null) throw new Exception("Timesheet not found");

                var comment = new Comment
                {
                    TimesheetId = timesheetId,
                    UserId = userId,
                    UserRole = user.Role?.Name ?? "User",
                    UserAvatar = GetInitials(user.FullName),
                    CommentText = commentText,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Comments.Add(comment);
                await _context.SaveChangesAsync();

                // Notify the timesheet owner if the commenter is not the owner
                if (timesheet.UserId != userId)
                {
                    await _notificationService.CreateCommentNotification(
                        timesheetId, 
                        timesheet.UserId, 
                        user.FullName, 
                        user.Role?.Name ?? "User");
                }

                return await GetTimesheetById(timesheetId, userId, user.Role?.Name ?? "");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding comment to timesheet {TimesheetId}", timesheetId);
                throw;
            }
        }

        #region Private Methods

        private TimesheetEntry MapToTimesheetEntry(CreateTimesheetEntryDto dto)
        {
            try
            {
                // Parse date - handle different formats
                DateTime date;
                if (!DateTime.TryParse(dto.Date, out date))
                {
                    // Try parsing as yyyy-MM-dd
                    if (!DateTime.TryParseExact(dto.Date, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out date))
                    {
                        throw new Exception($"Invalid date format: {dto.Date}");
                    }
                }
                
                // Ensure date is UTC
                date = DateTime.SpecifyKind(date, DateTimeKind.Utc);

                // Parse times
                TimeSpan startTime;
                TimeSpan endTime;
                
                if (!TimeSpan.TryParse(dto.StartTime, out startTime))
                {
                    throw new Exception($"Invalid start time format: {dto.StartTime}");
                }
                
                if (!TimeSpan.TryParse(dto.EndTime, out endTime))
                {
                    throw new Exception($"Invalid end time format: {dto.EndTime}");
                }
                
                var totalHours = (endTime - startTime).TotalHours;

                return new TimesheetEntry
                {
                    Date = date,
                    DayOfWeek = date.DayOfWeek.ToString(),
                    StartTime = startTime,
                    EndTime = endTime,
                    TotalHours = totalHours,
                    WorkDone = dto.WorkDone ?? "",
                    LGA = dto.LGA,
                    Ward = dto.Ward,
                    HealthFacility = dto.HealthFacility,
                    CreatedAt = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error mapping timesheet entry");
                throw;
            }
        }

        private List<WorkflowStageDto> GetDefaultWorkflowStages(string currentStatus)
        {
            var stageNames = new[] 
            { 
                "Draft", "Submitted", "GON Review", "ECEWS Review", 
                "Programs Team", "HR", "Processed" 
            };

            var stages = new List<WorkflowStageDto>();
            bool foundCurrent = false;

            for (int i = 0; i < stageNames.Length; i++)
            {
                bool isCompleted = false;
                bool isCurrent = false;

                if (!foundCurrent)
                {
                    if (stageNames[i] == currentStatus || 
                        (currentStatus == "GONReview" && stageNames[i] == "GON Review") ||
                        (currentStatus == "ECEWSReview" && stageNames[i] == "ECEWS Review"))
                    {
                        isCurrent = true;
                        foundCurrent = true;
                    }
                    else
                    {
                        isCompleted = true;
                    }
                }

                stages.Add(new WorkflowStageDto
                {
                    Name = stageNames[i],
                    Completed = isCompleted,
                    Current = isCurrent,
                    Order = i + 1
                });
            }

            return stages;
        }

        private string GetStatusType(string status)
        {
            return status?.ToLower() switch
            {
                "approved" => "approved",
                "rejected" => "rejected",
                "gonreview" => "review",
                "submitted" => "pending",
                "draft" => "draft",
                _ => "pending"
            } ?? "pending";
        }

        private string GetUserAvatar(User? user)
        {
            if (user != null && !string.IsNullOrEmpty(user.ProfileImageUrl))
                return user.ProfileImageUrl;

            return GetInitials(user?.FullName ?? "");
        }

        private string GetInitials(string fullName)
        {
            if (string.IsNullOrEmpty(fullName)) return "U";
            
            var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2)
                return $"{parts[0][0]}{parts[1][0]}".ToUpper();
            
            return fullName.Length > 0 ? fullName[0].ToString().ToUpper() : "U";
        }

        #endregion
    }
}