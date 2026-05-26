using System;

namespace ATMS.API.Models
{
    public class PerformanceImprovementPlan
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public int? InitiatedById { get; set; }
        public User? InitiatedBy { get; set; }
        
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        
        public string Objective { get; set; } = string.Empty;
        public string ActionPlan { get; set; } = string.Empty;
        public string? SuccessCriteria { get; set; }
        public string? SupportProvided { get; set; }
        
        public string Status { get; set; } = "Active"; // Active, Completed, Extended, Terminated
        
        public DateTime? CompletedAt { get; set; }
        public string? CompletionOutcome { get; set; } // Success, Extended, Unsuccessful
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation
        public ICollection<PipReview> Reviews { get; set; } = new List<PipReview>();
    }
    
    public class PipReview
    {
        public int Id { get; set; }
        public int PipId { get; set; }
        public PerformanceImprovementPlan? Pip { get; set; }
        
        public int ReviewerId { get; set; }
        public User? Reviewer { get; set; }
        
        public DateTime ReviewDate { get; set; }
        public string Comments { get; set; } = string.Empty;
        public string? Rating { get; set; } // OnTrack, NeedsImprovement, OffTrack
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}