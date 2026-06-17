using System;

namespace ATMS.API.Models
{
    public class LeaveBalance
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public int Year { get; set; }
        public string LeaveType { get; set; } = string.Empty; // Annual, Sick, etc.
        public int TotalDays { get; set; }
        public int TakenDays { get; set; }
        public int RemainingDays => TotalDays - TakenDays;
        public int CarryoverDays { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
