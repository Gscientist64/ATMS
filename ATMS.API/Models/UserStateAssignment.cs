using System;

namespace ATMS.API.Models
{
    public class UserStateAssignment
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public string State { get; set; } = string.Empty;
        public string? Project { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public int? AssignedBy { get; set; }
    }
}