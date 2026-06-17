using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ATMS.API.Data;
using ATMS.API.DTOs;
using ATMS.API.Models;

namespace ATMS.API.Services
{
    public class ConfigurationService : IConfigurationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ConfigurationService> _logger;

        public ConfigurationService(ApplicationDbContext context, ILogger<ConfigurationService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ========== Departments ==========
        public async Task<List<DepartmentDto>> GetAllDepartmentsAsync()
        {
            var departments = await _context.Departments
                .Where(d => d.IsActive)
                .OrderBy(d => d.Name)
                .ToListAsync();

            return departments.Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                IsActive = d.IsActive,
                CreatedAt = d.CreatedAt
            }).ToList();
        }

        public async Task<DepartmentDto> GetDepartmentByIdAsync(int id)
        {
            var dept = await _context.Departments.FindAsync(id);
            if (dept == null) return null;
            return new DepartmentDto
            {
                Id = dept.Id,
                Name = dept.Name,
                IsActive = dept.IsActive,
                CreatedAt = dept.CreatedAt
            };
        }

        public async Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto dto, int userId)
        {
            var dept = new Department
            {
                Name = dto.Name,
                IsActive = true,
                CreatedById = userId,
                CreatedAt = DateTime.UtcNow
            };
            _context.Departments.Add(dept);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Department created: {Name}", dto.Name);
            return new DepartmentDto
            {
                Id = dept.Id,
                Name = dept.Name,
                IsActive = dept.IsActive,
                CreatedAt = dept.CreatedAt
            };
        }

        public async Task<DepartmentDto> UpdateDepartmentAsync(int id, UpdateDepartmentDto dto, int userId)
        {
            var dept = await _context.Departments.FindAsync(id);
            if (dept == null) return null;
            if (dto.Name != null) dept.Name = dto.Name;
            if (dto.IsActive.HasValue) dept.IsActive = dto.IsActive.Value;
            dept.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return new DepartmentDto
            {
                Id = dept.Id,
                Name = dept.Name,
                IsActive = dept.IsActive,
                CreatedAt = dept.CreatedAt
            };
        }

        public async Task<bool> DeleteDepartmentAsync(int id)
        {
            var dept = await _context.Departments.FindAsync(id);
            if (dept == null) return false;
            dept.IsActive = false;
            dept.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        // ========== Projects ==========
        public async Task<List<ProjectDto>> GetAllProjectsAsync()
        {
            var projects = await _context.Projects
                .Where(p => p.IsActive)
                .OrderBy(p => p.Name)
                .ToListAsync();

            return projects.Select(p => new ProjectDto
            {
                Id = p.Id,
                Name = p.Name,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt
            }).ToList();
        }

        public async Task<ProjectDto> GetProjectByIdAsync(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return null;

            return new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                IsActive = project.IsActive,
                CreatedAt = project.CreatedAt
            };
        }

        public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto, int userId)
        {
            var project = new Project
            {
                Name = dto.Name,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return await GetProjectByIdAsync(project.Id);
        }

        public async Task<ProjectDto> UpdateProjectAsync(int id, UpdateProjectDto dto, int userId)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) throw new Exception("Project not found");

            project.Name = dto.Name ?? project.Name;
            if (dto.IsActive.HasValue)
                project.IsActive = dto.IsActive.Value;
            project.UpdatedAt = DateTime.UtcNow;
            project.UpdatedBy = userId;

            await _context.SaveChangesAsync();
            return await GetProjectByIdAsync(id);
        }

        public async Task<bool> DeleteProjectAsync(int id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return false;

            // Soft delete
            project.IsActive = false;
            project.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        // ========== Permission Settings ==========
        public async Task<PermissionSettingsDto> GetPermissionSettingsAsync()
        {
            var settings = await _context.PermissionSettings.ToListAsync();
            
            return new PermissionSettingsDto
            {
                ContractLetters = settings.FirstOrDefault(s => s.PermissionKey == "contractLetters")?.IsEnabled ?? false,
                UserPermissions = settings.FirstOrDefault(s => s.PermissionKey == "userPermissions")?.IsEnabled ?? false,
                Onboarding = settings.FirstOrDefault(s => s.PermissionKey == "onboarding")?.IsEnabled ?? false,
                EditStaffDetails = settings.FirstOrDefault(s => s.PermissionKey == "editStaffDetails")?.IsEnabled ?? false
            };
        }

        public async Task<PermissionSettingsDto> UpdatePermissionSettingsAsync(UpdatePermissionSettingsDto dto, int userId)
        {
            await UpdateOrCreateSetting("contractLetters", dto.ContractLetters, userId);
            await UpdateOrCreateSetting("userPermissions", dto.UserPermissions, userId);
            await UpdateOrCreateSetting("onboarding", dto.Onboarding, userId);
            await UpdateOrCreateSetting("editStaffDetails", dto.EditStaffDetails, userId);

            return await GetPermissionSettingsAsync();
        }

        private async Task UpdateOrCreateSetting(string key, bool? value, int userId)
        {
            if (!value.HasValue) return;

            var setting = await _context.PermissionSettings
                .FirstOrDefaultAsync(s => s.PermissionKey == key);

            if (setting == null)
            {
                setting = new PermissionSetting
                {
                    PermissionKey = key,
                    IsEnabled = value.Value,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = userId
                };
                _context.PermissionSettings.Add(setting);
            }
            else
            {
                setting.IsEnabled = value.Value;
                setting.UpdatedAt = DateTime.UtcNow;
                setting.UpdatedBy = userId;
            }

            await _context.SaveChangesAsync();
        }

        public async Task<bool> HasPermissionAsync(int userId, string permissionKey)
        {
            // First check if the permission setting is enabled
            var setting = await _context.PermissionSettings
                .FirstOrDefaultAsync(s => s.PermissionKey == permissionKey);
            
            if (setting == null || !setting.IsEnabled) return false;
            
            // Then check if the user is assigned to this permission
            var assignment = await _context.PermissionUserAssignments
                .FirstOrDefaultAsync(a => a.PermissionKey == permissionKey && a.UserId == userId);
            
            return assignment != null;
        }

        public async Task<List<UserDto>> GetUsersWithPermissionAsync(string permissionKey)
        {
            var assignments = await _context.PermissionUserAssignments
                .Include(a => a.User)
                .ThenInclude(u => u.Role)
                .Where(a => a.PermissionKey == permissionKey)
                .ToListAsync();
            
            return assignments.Select(a => new UserDto
            {
                Id = a.User.Id,
                PublicId = a.User.PublicId,
                EmployeeCode = a.User.EmployeeCode,
                Email = a.User.Email,
                FullName = a.User.FullName,
                Role = a.User.Role?.Name ?? ""
            }).ToList();
        }

        // ========== Permission User Assignments ==========
        public async Task<List<PermissionUserDto>> GetUsersByPermissionAsync(string permissionKey)
        {
            var assignments = await _context.PermissionUserAssignments
                .Include(a => a.User)
                .Where(a => a.PermissionKey == permissionKey)
                .ToListAsync();

            return assignments.Select(a => new PermissionUserDto
            {
                Id = a.Id,
                UserId = a.UserId,
                UserName = a.User?.FullName ?? "Unknown",
                UserEmail = a.User?.Email ?? "",
                PermissionKey = a.PermissionKey,
                AssignedAt = a.AssignedAt
            }).ToList();
        }

        public async Task<bool> AssignUserToPermissionAsync(string permissionKey, int userId, int assignedBy)
        {
            var existing = await _context.PermissionUserAssignments
                .FirstOrDefaultAsync(a => a.PermissionKey == permissionKey && a.UserId == userId);

            if (existing != null) return true; // Already assigned

            var assignment = new PermissionUserAssignment
            {
                PermissionKey = permissionKey,
                UserId = userId,
                AssignedAt = DateTime.UtcNow,
                AssignedBy = assignedBy
            };

            _context.PermissionUserAssignments.Add(assignment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveUserFromPermissionAsync(string permissionKey, int userId)
        {
            var assignment = await _context.PermissionUserAssignments
                .FirstOrDefaultAsync(a => a.PermissionKey == permissionKey && a.UserId == userId);

            if (assignment == null) return false;

            _context.PermissionUserAssignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}