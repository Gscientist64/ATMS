using System;
using System.ComponentModel.DataAnnotations;

namespace ATMS.API.Models
{
    public class Concern
    {
        public int Id { get; set; }
        
        public int? TimesheetId { get; set; } // Make this nullable
        public Timesheet? Timesheet { get; set; }
        
        public int RaisedById { get; set; }
        public User? RaisedBy { get; set; }
        
        public int TargetUserId { get; set; }
        public User? TargetUser { get; set; }
        
        [Required]
        public string ConcernType { get; set; } = string.Empty;
        
        [Required]
        public string Severity { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        public string Status { get; set; } = "Open";
        
        public DateTime RaisedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedAt { get; set; }
        public int? ResolvedById { get; set; }
        public User? ResolvedBy { get; set; }
        
        public string? ResolutionNotes { get; set; }
    }
}