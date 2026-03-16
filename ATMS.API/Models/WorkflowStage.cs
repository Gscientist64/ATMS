using System;

namespace ATMS.API.Models
{
    public class WorkflowStage
    {
        public int Id { get; set; }
        
        public int TimesheetId { get; set; }
        public Timesheet? Timesheet { get; set; }
        
        public string StageName { get; set; } = string.Empty;
        public int StageOrder { get; set; }
        
        public bool IsCompleted { get; set; }
        public bool IsCurrent { get; set; }
        
        public DateTime? CompletedAt { get; set; }
        public int? CompletedByUserId { get; set; }
        public User? CompletedByUser { get; set; }
        
        public string? Comments { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}