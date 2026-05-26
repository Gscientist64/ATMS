// ATMS.API/Models/Announcement.cs

using System;

namespace ATMS.API.Models
{
    public class Announcement
    {
        public int Id { get; set; }
        
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        
        public string Priority { get; set; } = "Normal"; // Low, Normal, High
        public string Audience { get; set; } = "Everyone"; // Everyone, Staff, AdHoc, Supervisors, etc.
        
        public int? CreatedById { get; set; }
        public User? CreatedBy { get; set; }
        
        public DateTime? ExpiresAt { get; set; }
        
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}