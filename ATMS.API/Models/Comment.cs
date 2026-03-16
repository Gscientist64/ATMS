using System;

namespace ATMS.API.Models
{
    public class Comment
    {
        public int Id { get; set; }
        
        public int TimesheetId { get; set; }
        public Timesheet? Timesheet { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public string UserRole { get; set; } = string.Empty;  // Add this
        public string UserAvatar { get; set; } = string.Empty; // Add this
        public string CommentText { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}