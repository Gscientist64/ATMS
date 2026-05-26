using System;

namespace ATMS.API.Models
{
    public class SystemUser
    {
        public int Id { get; set; }
        public int UserId { get; set; } // Reference to existing User.Id (int)
        public string Role { get; set; } = string.Empty; // HrAdmin, HrManager, HrDataEntry, Viewer
        public string? Permissions { get; set; } // JSON string of permissions
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}