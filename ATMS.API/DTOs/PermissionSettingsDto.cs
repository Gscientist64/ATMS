using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class PermissionSettingsDto
    {
        public bool ContractLetters { get; set; }
        public bool UserPermissions { get; set; }
        public bool Onboarding { get; set; }
    }

    public class UpdatePermissionSettingsDto
    {
        public bool? ContractLetters { get; set; }
        public bool? UserPermissions { get; set; }
        public bool? Onboarding { get; set; }
    }

    public class AssignUserToPermissionDto
    {
        public int UserId { get; set; }
        public string PermissionKey { get; set; } = string.Empty;
    }

    public class PermissionUserDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string PermissionKey { get; set; } = string.Empty;
        public DateTime AssignedAt { get; set; }
    }
}