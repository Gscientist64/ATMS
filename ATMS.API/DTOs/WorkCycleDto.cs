using System;

namespace ATMS.API.DTOs
{
    public class WorkCycleDto
    {
        public int Id { get; set; }
        public string CycleType { get; set; } = string.Empty;
        public int Month { get; set; }
        public int Year { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? StartDay { get; set; }
        public string? EndDay { get; set; }
        public string? Repeat { get; set; }
        public string? Audience { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        
        // Helper properties for frontend
        public string MonthYear => $"{new DateTime(Year, Month, 1):MMMM yyyy}";
        public bool IsCurrentMonth => Month == DateTime.UtcNow.Month && Year == DateTime.UtcNow.Year;
        public bool CanSubmitTimesheet => IsActive && DateTime.UtcNow <= EndDate;
    }
}