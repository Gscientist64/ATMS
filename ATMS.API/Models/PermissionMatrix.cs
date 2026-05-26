using System;

namespace ATMS.API.Models
{
    public class PermissionMatrix
    {
        public int Id { get; set; }
        public string PermissionId { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public bool IsAllowed { get; set; } = false;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int? UpdatedBy { get; set; }
    }
}