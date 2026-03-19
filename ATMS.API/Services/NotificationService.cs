using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ATMS.API.Data;
using ATMS.API.DTOs;
using ATMS.API.Models;

namespace ATMS.API.Services
{
    public interface INotificationService
    {
        Task<NotificationDto> CreateNotification(CreateNotificationDto dto);
        Task<NotificationListResponse> GetUserNotifications(int userId, int page = 1, int pageSize = 20);
        Task<NotificationListResponse> GetUnreadNotifications(int userId);
        Task<bool> MarkAsRead(int userId, MarkAsReadDto dto);
        Task<int> GetUnreadCount(int userId);
        Task<bool> DeleteNotification(int userId, int notificationId);
        Task<bool> DeleteAllRead(int userId);
        
        // Helper methods for specific notification types
        Task CreateTimesheetSubmittedNotification(int timesheetId, int userId);
        Task CreateTimesheetApprovedNotification(int timesheetId, int userId, string approverName, string approverRole);
        Task CreateTimesheetRejectedNotification(int timesheetId, int userId, string reviewerName, string reviewerRole, string reason);
        Task CreateTimesheetUnderReviewNotification(int timesheetId, int userId, string reviewerRole);
        Task CreateCommentNotification(int timesheetId, int userId, string commenterName, string commenterRole);
        Task CreateConcernRaisedNotification(int concernId, int targetUserId, string raiserName);
        Task CreateContractReadyNotification(int contractId, int userId);
        Task CreateContractSignedNotification(int contractId, int userId);
        Task CreateReminderNotification(int userId, string month, DateTime deadline);
    }

    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(ApplicationDbContext context, ILogger<NotificationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<NotificationDto> CreateNotification(CreateNotificationDto dto)
        {
            try
            {
                var notification = new Notification
                {
                    UserId = dto.UserId,
                    Type = dto.Type,
                    Title = dto.Title,
                    Message = dto.Message,
                    Data = dto.Data != null ? JsonSerializer.Serialize(dto.Data) : null,
                    ActionUrl = dto.ActionUrl,
                    Priority = dto.Priority ?? "Medium",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                return MapToDto(notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification for user {UserId}", dto.UserId);
                throw;
            }
        }

        public async Task<NotificationListResponse> GetUserNotifications(int userId, int page = 1, int pageSize = 20)
        {
            try
            {
                var query = _context.Notifications
                    .Where(n => n.UserId == userId && !n.IsDeleted)
                    .OrderByDescending(n => n.CreatedAt);

                var totalCount = await query.CountAsync();
                var unreadCount = await query.Where(n => !n.IsRead).CountAsync();

                var notifications = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new NotificationListResponse
                {
                    Notifications = notifications.Select(MapToDto).ToList(),
                    UnreadCount = unreadCount,
                    TotalCount = totalCount
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications for user {UserId}", userId);
                throw;
            }
        }

        public async Task<NotificationListResponse> GetUnreadNotifications(int userId)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Where(n => n.UserId == userId && !n.IsRead && !n.IsDeleted)
                    .OrderByDescending(n => n.CreatedAt)
                    .Take(50)
                    .ToListAsync();

                return new NotificationListResponse
                {
                    Notifications = notifications.Select(MapToDto).ToList(),
                    UnreadCount = notifications.Count,
                    TotalCount = await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsDeleted)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread notifications for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> MarkAsRead(int userId, MarkAsReadDto dto)
        {
            try
            {
                if (dto.MarkAll)
                {
                    var unread = await _context.Notifications
                        .Where(n => n.UserId == userId && !n.IsRead && !n.IsDeleted)
                        .ToListAsync();

                    foreach (var notification in unread)
                    {
                        notification.IsRead = true;
                        notification.ReadAt = DateTime.UtcNow;
                    }
                }
                else if (dto.NotificationIds != null && dto.NotificationIds.Any())
                {
                    var notifications = await _context.Notifications
                        .Where(n => n.UserId == userId && dto.NotificationIds.Contains(n.Id) && !n.IsDeleted)
                        .ToListAsync();

                    foreach (var notification in notifications)
                    {
                        notification.IsRead = true;
                        notification.ReadAt = DateTime.UtcNow;
                    }
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notifications as read for user {UserId}", userId);
                return false;
            }
        }

        public async Task<int> GetUnreadCount(int userId)
        {
            try
            {
                return await _context.Notifications
                    .CountAsync(n => n.UserId == userId && !n.IsRead && !n.IsDeleted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread count for user {UserId}", userId);
                return 0;
            }
        }

        public async Task<bool> DeleteNotification(int userId, int notificationId)
        {
            try
            {
                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

                if (notification == null) return false;

                notification.IsDeleted = true;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification {NotificationId} for user {UserId}", notificationId, userId);
                return false;
            }
        }

        public async Task<bool> DeleteAllRead(int userId)
        {
            try
            {
                var read = await _context.Notifications
                    .Where(n => n.UserId == userId && n.IsRead && !n.IsDeleted)
                    .ToListAsync();

                foreach (var notification in read)
                {
                    notification.IsDeleted = true;
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting read notifications for user {UserId}", userId);
                return false;
            }
        }

        // Helper methods for specific notification types
        public async Task CreateTimesheetSubmittedNotification(int timesheetId, int userId)
        {
            var timesheet = await _context.Timesheets
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == timesheetId);

            if (timesheet == null) return;

            // Notify ECEWS supervisor
            if (timesheet.User?.EcewsSupervisorId != null)
            {
                await CreateNotification(new CreateNotificationDto
                {
                    UserId = timesheet.User.EcewsSupervisorId.Value,
                    Type = "timesheet_review",
                    Title = "New Timesheet Submitted",
                    Message = $"{timesheet.User.FullName} has submitted a timesheet for {timesheet.Month} {timesheet.Year}",
                    Data = new { timesheetId, userId, month = timesheet.Month, year = timesheet.Year },
                    ActionUrl = $"/ecews-supervisor/timesheet/{timesheetId}",
                    Priority = "High"
                });
            }
        }

        public async Task CreateTimesheetApprovedNotification(int timesheetId, int userId, string approverName, string approverRole)
        {
            var timesheet = await _context.Timesheets.FindAsync(timesheetId);
            if (timesheet == null) return;

            await CreateNotification(new CreateNotificationDto
            {
                UserId = timesheet.UserId,
                Type = "timesheet_approved",
                Title = "Timesheet Approved",
                Message = $"Your timesheet for {timesheet.Month} {timesheet.Year} has been approved by {approverName} ({approverRole})",
                Data = new { timesheetId, approverName, approverRole, month = timesheet.Month, year = timesheet.Year },
                ActionUrl = $"/timesheet/{timesheetId}",
                Priority = "Low"
            });
        }

        public async Task CreateTimesheetRejectedNotification(int timesheetId, int userId, string reviewerName, string reviewerRole, string reason)
        {
            var timesheet = await _context.Timesheets.FindAsync(timesheetId);
            if (timesheet == null) return;

            await CreateNotification(new CreateNotificationDto
            {
                UserId = timesheet.UserId,
                Type = "timesheet_rejected",
                Title = "Timesheet Returned",
                Message = $"Your timesheet for {timesheet.Month} {timesheet.Year} has been returned by {reviewerName} ({reviewerRole})",
                Data = new { timesheetId, reviewerName, reviewerRole, reason, month = timesheet.Month, year = timesheet.Year },
                ActionUrl = $"/timesheet/{timesheetId}",
                Priority = "High"
            });
        }

        public async Task CreateTimesheetUnderReviewNotification(int timesheetId, int userId, string reviewerRole)
        {
            var timesheet = await _context.Timesheets.FindAsync(timesheetId);
            if (timesheet == null) return;

            await CreateNotification(new CreateNotificationDto
            {
                UserId = timesheet.UserId,
                Type = "timesheet_review",
                Title = "Timesheet Under Review",
                Message = $"Your timesheet for {timesheet.Month} {timesheet.Year} is now under {reviewerRole} review",
                Data = new { timesheetId, reviewerRole, month = timesheet.Month, year = timesheet.Year },
                ActionUrl = $"/timesheet/{timesheetId}",
                Priority = "Medium"
            });
        }

        public async Task CreateCommentNotification(int timesheetId, int userId, string commenterName, string commenterRole)
        {
            var timesheet = await _context.Timesheets.FindAsync(timesheetId);
            if (timesheet == null) return;

            await CreateNotification(new CreateNotificationDto
            {
                UserId = timesheet.UserId,
                Type = "comment",
                Title = "New Comment",
                Message = $"{commenterName} ({commenterRole}) commented on your timesheet",
                Data = new { timesheetId, commenterName, commenterRole },
                ActionUrl = $"/timesheet/{timesheetId}?tab=comments",
                Priority = "Low"
            });
        }

        public async Task CreateConcernRaisedNotification(int concernId, int targetUserId, string raiserName)
        {
            var concern = await _context.Concerns
                .Include(c => c.Timesheet)
                .FirstOrDefaultAsync(c => c.Id == concernId);

            if (concern == null) return;

            // Notify ECEWS supervisor
            var targetUser = await _context.Users.FindAsync(targetUserId);
            if (targetUser != null && targetUser.EcewsSupervisorId.HasValue)
            {
                string message = concern.TimesheetId.HasValue 
                    ? $"{raiserName} raised a concern about {targetUser.FullName} regarding their timesheet"
                    : $"{raiserName} raised a concern about {targetUser.FullName}";

                await CreateNotification(new CreateNotificationDto
                {
                    UserId = targetUser.EcewsSupervisorId.Value,
                    Type = "concern",
                    Title = "Concern Raised",
                    Message = message,
                    Data = new { concernId, timesheetId = concern.TimesheetId, raiserName },
                    ActionUrl = concern.TimesheetId.HasValue 
                        ? $"/ecews-supervisor/timesheet/{concern.TimesheetId}" 
                        : $"/ecews-supervisor/supervisees/{targetUserId}",
                    Priority = "High"
                });
            }
        }

        public async Task CreateContractReadyNotification(int contractId, int userId)
        {
            var contract = await _context.Contracts.FindAsync(contractId);
            if (contract == null) return;

            await CreateNotification(new CreateNotificationDto
            {
                UserId = userId,
                Type = "contract",
                Title = "Contract Ready for Signing",
                Message = $"Your contract {contract.Title} is ready for signing",
                Data = new { contractId, title = contract.Title },
                ActionUrl = $"/profile?tab=contract&contract={contractId}",
                Priority = "High"
            });
        }

        public async Task CreateContractSignedNotification(int contractId, int userId)
        {
            var contract = await _context.Contracts.FindAsync(contractId);
            if (contract == null) return;

            await CreateNotification(new CreateNotificationDto
            {
                UserId = userId,
                Type = "contract",
                Title = "Contract Signed",
                Message = $"Your contract {contract.Title} has been signed successfully",
                Data = new { contractId, title = contract.Title },
                ActionUrl = $"/profile?tab=contract",
                Priority = "Low"
            });
        }

        public async Task CreateReminderNotification(int userId, string month, DateTime deadline)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            await CreateNotification(new CreateNotificationDto
            {
                UserId = userId,
                Type = "reminder",
                Title = "Timesheet Submission Reminder",
                Message = $"Reminder: Submit your timesheet for {month} by {deadline:MMMM d, yyyy}",
                Data = new { month, deadline },
                ActionUrl = "/timesheet/create",
                Priority = "Medium"
            });
        }

        private NotificationDto MapToDto(Notification notification)
        {
            return new NotificationDto
            {
                Id = notification.Id,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                Data = !string.IsNullOrEmpty(notification.Data) ? JsonSerializer.Deserialize<object>(notification.Data) : null,
                ActionUrl = notification.ActionUrl,
                IsRead = notification.IsRead,
                Priority = notification.Priority ?? "Medium",
                CreatedAt = notification.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                TimeAgo = GetTimeAgo(notification.CreatedAt)
            };
        }

        private string GetTimeAgo(DateTime dateTime)
        {
            var timeSpan = DateTime.UtcNow - dateTime;

            if (timeSpan.TotalSeconds < 60)
                return "just now";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} minute{(timeSpan.TotalMinutes >= 2 ? "s" : "")} ago";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} hour{(timeSpan.TotalHours >= 2 ? "s" : "")} ago";
            if (timeSpan.TotalDays < 30)
                return $"{(int)timeSpan.TotalDays} day{(timeSpan.TotalDays >= 2 ? "s" : "")} ago";
            if (timeSpan.TotalDays < 365)
                return $"{(int)(timeSpan.TotalDays / 30)} month{(timeSpan.TotalDays / 30 >= 2 ? "s" : "")} ago";
            
            return $"{(int)(timeSpan.TotalDays / 365)} year{(timeSpan.TotalDays / 365 >= 2 ? "s" : "")} ago";
        }
    }
}