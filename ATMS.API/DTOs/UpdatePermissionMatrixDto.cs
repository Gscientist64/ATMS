using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class UpdatePermissionMatrixDto
    {
        public List<PermissionMatrixUpdate> Updates { get; set; } = new();
    }

    public class PermissionMatrixUpdate
    {
        public string PermissionId { get; set; } = string.Empty;
        public Dictionary<string, bool> Roles { get; set; } = new();
    }
}