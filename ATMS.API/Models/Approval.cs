using System;

namespace ATMS.API.Models
{
    public class Approval
    {
        public int Id { get; set; }
        public int TimesheetId { get; set; }
        public int ApproverId { get; set; }
        public string Action { get; set; } = string.Empty;
        public DateTime ActionDate { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public Timesheet? Timesheet { get; set; }
        public User? Approver { get; set; }
    }
}