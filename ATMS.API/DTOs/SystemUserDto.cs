using System;
using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class SystemUserDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public Dictionary<string, bool> Permissions { get; set; } = new();
        public bool IsActive { get; set; }
        public string LastActive { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateSystemUserDto
    {
        public int UserId { get; set; }
        public string Role { get; set; } = string.Empty;
        public Dictionary<string, bool>? Permissions { get; set; }
    }

    public class UpdateSystemUserDto
    {
        public string Role { get; set; } = string.Empty;
        public Dictionary<string, bool>? Permissions { get; set; }
        public bool? IsActive { get; set; }
    }

    public class PermissionMatrixDto
    {
        public List<PermissionCategoryDto> Categories { get; set; } = new();
    }

    public class PermissionCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public List<PermissionItemDto> Permissions { get; set; } = new();
    }

    public class PermissionItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public Dictionary<string, bool> Roles { get; set; } = new();
    }

    public class ActiveSessionDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Browser { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Ip { get; set; } = string.Empty;
        public string LastActive { get; set; } = string.Empty;
    }
}