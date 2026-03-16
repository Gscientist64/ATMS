using System;
using System.Collections.Generic;

namespace ATMS.API.Models
{
    public class Timesheet
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public string Month { get; set; } = string.Empty;
        public int Year { get; set; }
        
        public DateTime WeekStarting { get; set; }
        public DateTime WeekEnding { get; set; }
        
        public string Status { get; set; } = string.Empty;
        public string? Comments { get; set; }
        
        public DateTime SubmittedAt { get; set; }
        public DateTime? GonReviewedAt { get; set; }
        public DateTime? EcewsReviewedAt { get; set; }
        public DateTime? ProgramsTeamReviewedAt { get; set; }
        public DateTime? HRReviewedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        
        public int? GonReviewerId { get; set; }
        public User? GonReviewer { get; set; }
        
        public int? EcewsReviewerId { get; set; }
        public User? EcewsReviewer { get; set; }
        
        public int TotalDaysWorked { get; set; }
        public double TotalHours { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        public ICollection<TimesheetEntry> Entries { get; set; } = new List<TimesheetEntry>();
        public ICollection<Comment> CommentsList { get; set; } = new List<Comment>();
        public ICollection<WorkflowStage> WorkflowStages { get; set; } = new List<WorkflowStage>();
        public ICollection<Approval> Approvals { get; set; } = new List<Approval>(); // Add this line
    }
}