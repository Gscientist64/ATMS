using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class PermissionUpdateDto
    {
        public string PermissionId { get; set; } = string.Empty;
        public Dictionary<string, bool> Roles { get; set; } = new();
    }
}