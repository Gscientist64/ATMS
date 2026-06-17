using System;

namespace ATMS.API.Models
{
    public class LeaveRequest
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public string LeaveType { get; set; } = string.Empty; // Annual, Sick, Paternity, etc.
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int TotalDays { get; set; }
        public string? Reason { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Cancelled
        public string? SupervisorStatus { get; set; }
        public string? HrStatus { get; set; }
        public int? ApprovedById { get; set; }
        public User? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public bool CanCancel { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
