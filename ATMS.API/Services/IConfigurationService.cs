using System.Collections.Generic;
using System.Threading.Tasks;
using ATMS.API.DTOs;

namespace ATMS.API.Services
{
    public interface IConfigurationService
    {
        // Departments
        Task<List<DepartmentDto>> GetAllDepartmentsAsync();
        Task<DepartmentDto> GetDepartmentByIdAsync(int id);
        Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto dto, int userId);
        Task<DepartmentDto> UpdateDepartmentAsync(int id, UpdateDepartmentDto dto, int userId);
        Task<bool> DeleteDepartmentAsync(int id);
        
        // Projects
        Task<List<ProjectDto>> GetAllProjectsAsync();
        Task<ProjectDto> GetProjectByIdAsync(int id);
        Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto, int userId);
        Task<ProjectDto> UpdateProjectAsync(int id, UpdateProjectDto dto, int userId);
        Task<bool> DeleteProjectAsync(int id);
        
        Task<bool> HasPermissionAsync(int userId, string permissionKey);
        Task<List<UserDto>> GetUsersWithPermissionAsync(string permissionKey);

        // Permissions
        Task<PermissionSettingsDto> GetPermissionSettingsAsync();
        Task<PermissionSettingsDto> UpdatePermissionSettingsAsync(UpdatePermissionSettingsDto dto, int userId);
        
        // Permission User Assignments
        Task<List<PermissionUserDto>> GetUsersByPermissionAsync(string permissionKey);
        Task<bool> AssignUserToPermissionAsync(string permissionKey, int userId, int assignedBy);
        Task<bool> RemoveUserFromPermissionAsync(string permissionKey, int userId);
    }
}