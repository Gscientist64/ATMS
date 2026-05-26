using System;

namespace ATMS.API.Models
{
    public class PermissionSetting
    {
        public int Id { get; set; }
        public string PermissionKey { get; set; } = string.Empty; // contractLetters, userPermissions, onboarding
        public bool IsEnabled { get; set; } = false;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int? UpdatedBy { get; set; }
    }
}