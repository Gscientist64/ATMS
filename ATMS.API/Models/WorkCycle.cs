using System;

namespace ATMS.API.Models
{
    public class WorkCycle
    {
        public int Id { get; set; }
        public string CycleType { get; set; } = string.Empty; // timesheet, leave, appraisal
        public int Month { get; set; }
        public int Year { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? StartDay { get; set; } // Monday, Tuesday, etc.
        public string? EndDay { get; set; }
        public string? Repeat { get; set; } // once, every-month
        public string? Audience { get; set; } // auxilary-staff, all-staff, etc.
        public bool IsActive { get; set; } = true;
        public int? CreatedById { get; set; }
        public User? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool CreateAnnouncement { get; set; } = false;
    }
}