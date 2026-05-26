using System;

namespace ATMS.API.Models
{
    public class PermissionUserAssignment
    {
        public int Id { get; set; }
        public string PermissionKey { get; set; } = string.Empty; // contractLetters, userPermissions, onboarding
        public int UserId { get; set; }
        public User? User { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public int? AssignedBy { get; set; }
    }
}