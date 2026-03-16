using System;
using System.ComponentModel.DataAnnotations;

namespace ATMS.API.Models
{
    public class Notification
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        public User? User { get; set; }
        
        [Required]
        public string Type { get; set; } = string.Empty; // timesheet_approved, timesheet_rejected, timesheet_review, reminder, comment, contract, concern
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        public string? Data { get; set; } // JSON string containing additional data (timesheetId, actorId, etc.)
        
        public string? ActionUrl { get; set; } // URL to navigate to when clicked
        
        public bool IsRead { get; set; } = false;
        
        public bool IsDeleted { get; set; } = false;
        
        public string? Priority { get; set; } = "Medium"; // High, Medium, Low
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ReadAt { get; set; }
    }
}