using System;

namespace ATMS.API.Models
{
    public class TimesheetEntry
    {
        public int Id { get; set; }
        
        public int TimesheetId { get; set; }
        public Timesheet? Timesheet { get; set; }
        
        public DateTime Date { get; set; }
        public string DayOfWeek { get; set; } = string.Empty;
        
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        
        public double TotalHours { get; set; }
        
        public string WorkDone { get; set; } = string.Empty;
        
        public string? LGA { get; set; }
        public string? Ward { get; set; }
        public string? HealthFacility { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}