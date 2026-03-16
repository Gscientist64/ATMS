using System;
using System.ComponentModel.DataAnnotations;

namespace ATMS.API.Models
{
    public class Advisory
    {
        public int Id { get; set; }
        
        public int IssuedById { get; set; }
        public User? IssuedBy { get; set; }
        
        public int TargetUserId { get; set; }
        public User? TargetUser { get; set; }
        
        public int? TimesheetId { get; set; }
        public Timesheet? Timesheet { get; set; }
        
        [Required]
        public string AdvisoryType { get; set; } = string.Empty;
        
        [Required]
        public string Justification { get; set; } = string.Empty;
        
        public string Status { get; set; } = "Pending";
        
        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
        public DateTime? AcknowledgedAt { get; set; }
        public DateTime? ImplementedAt { get; set; }
        
        public string? Response { get; set; }
    }
}