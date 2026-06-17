using System;

namespace ATMS.API.DTOs
{
    public class DepartmentDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateDepartmentDto
    {
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateDepartmentDto
    {
        public string? Name { get; set; }
        public bool? IsActive { get; set; }
    }
}
