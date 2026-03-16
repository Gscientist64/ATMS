using System;
using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }
        public string? ActionUrl { get; set; }
        public bool IsRead { get; set; }
        public string Priority { get; set; } = "Medium";
        public string CreatedAt { get; set; } = string.Empty;
        public string TimeAgo { get; set; } = string.Empty;
    }

    public class NotificationListResponse
    {
        public List<NotificationDto> Notifications { get; set; } = new();
        public int UnreadCount { get; set; }
        public int TotalCount { get; set; }
    }

    public class MarkAsReadDto
    {
        public List<int>? NotificationIds { get; set; }
        public bool MarkAll { get; set; }
    }

    public class CreateNotificationDto
    {
        public int UserId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }
        public string? ActionUrl { get; set; }
        public string? Priority { get; set; }
    }
}