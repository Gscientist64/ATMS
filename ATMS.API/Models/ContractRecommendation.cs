using System;
using System.ComponentModel.DataAnnotations;

namespace ATMS.API.Models
{
    public class ContractRecommendation
    {
        public int Id { get; set; }
        
        public int TimesheetId { get; set; }
        public Timesheet? Timesheet { get; set; }
        
        public int RecommendedById { get; set; }
        public User? RecommendedBy { get; set; }
        
        public int TargetUserId { get; set; }
        public User? TargetUser { get; set; }
        
        [Required]
        public string RecommendationType { get; set; } = string.Empty;
        
        public string? Reason { get; set; }
        
        public string Status { get; set; } = "Pending";
        
        public DateTime RecommendedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }
        public int? ReviewedById { get; set; }
        public User? ReviewedBy { get; set; }
    }
}