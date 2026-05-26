using System;

namespace ATMS.API.DTOs
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateProjectDto
    {
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateProjectDto
    {
        public string Name { get; set; } = string.Empty;
        public bool? IsActive { get; set; }
    }
}