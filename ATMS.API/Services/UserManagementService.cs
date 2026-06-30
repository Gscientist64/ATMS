using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ATMS.API.Data;
using ATMS.API.DTOs;
using ATMS.API.Models;
using ATMS.API.Helpers;

namespace ATMS.API.Services
{
    public class UserManagementService : IUserManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserManagementService> _logger;

        public UserManagementService(ApplicationDbContext context, ILogger<UserManagementService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<SystemUserDto>> GetAllSystemUsersAsync(string? team = null)
        {
            var result = await _context.SystemUsers
                .Join(_context.Users,
                    su => su.UserId,
                    u => u.Id,
                    (su, u) => new SystemUserDto
                    {
                        Id = su.Id,
                        UserId = su.UserId,
                        UserName = u.FullName,
                        UserEmail = u.Email,
                        Role = su.Role,
                        Permissions = string.IsNullOrEmpty(su.Permissions)
                            ? new Dictionary<string, bool>()
                            : JsonSerializer.Deserialize<Dictionary<string, bool>>(su.Permissions) ?? new Dictionary<string, bool>(),
                        IsActive = su.IsActive,
                        LastActive = u.LastLoginAt != null ? u.LastLoginAt.Value.ToString("dd-MM-yyyy") : "Never",
                        CreatedAt = su.CreatedAt
                    })
                .ToListAsync();

            return result;
        }

        public async Task<SystemUserDto?> GetSystemUserByIdAsync(int id)
        {
            var sysUser = await _context.SystemUsers.FindAsync(id);
            if (sysUser == null) return null;
            
            var user = await _context.Users.FindAsync(sysUser.UserId);
            if (user == null) return null;
            
            return new SystemUserDto
            {
                Id = sysUser.Id,
                UserId = sysUser.UserId,
                UserName = user.FullName,
                UserEmail = user.Email,
                Role = sysUser.Role,
                Permissions = string.IsNullOrEmpty(sysUser.Permissions) 
                    ? new Dictionary<string, bool>() 
                    : JsonSerializer.Deserialize<Dictionary<string, bool>>(sysUser.Permissions) ?? new Dictionary<string, bool>(),
                IsActive = sysUser.IsActive,
                LastActive = user.LastLoginAt?.ToString("dd-MM-yyyy") ?? "Never",
                CreatedAt = sysUser.CreatedAt
            };
        }

        public async Task<SystemUserDto> CreateSystemUserAsync(CreateSystemUserDto dto, int createdBy)
        {
            var existing = await _context.SystemUsers.FirstOrDefaultAsync(s => s.UserId == dto.UserId);
            if (existing != null) throw new Exception("User already has a system role assigned");
            
            var sysUser = new SystemUser
            {
                UserId = dto.UserId,
                Role = dto.Role,
                Permissions = dto.Permissions != null ? JsonSerializer.Serialize(dto.Permissions) : null,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = createdBy
            };
            
            _context.SystemUsers.Add(sysUser);
            await _context.SaveChangesAsync();
            
            var result = await GetSystemUserByIdAsync(sysUser.Id);
            return result!;
        }

        public async Task<SystemUserDto> UpdateSystemUserAsync(int id, UpdateSystemUserDto dto, int updatedBy)
        {
            var sysUser = await _context.SystemUsers.FindAsync(id);
            if (sysUser == null) throw new Exception("System user not found");
            
            sysUser.Role = dto.Role;
            if (dto.Permissions != null)
            {
                sysUser.Permissions = JsonSerializer.Serialize(dto.Permissions);
            }
            if (dto.IsActive.HasValue)
            {
                sysUser.IsActive = dto.IsActive.Value;
            }
            sysUser.UpdatedAt = DateTime.UtcNow;
            sysUser.UpdatedBy = updatedBy;
            
            await _context.SaveChangesAsync();
            
            var result = await GetSystemUserByIdAsync(id);
            return result!;
        }

        public async Task<bool> DeleteSystemUserAsync(int id)
        {
            var sysUser = await _context.SystemUsers.FindAsync(id);
            if (sysUser == null) return false;
            
            _context.SystemUsers.Remove(sysUser);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResetUserPasswordAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;
            
            var tempPassword = "Password123@";
            user.PasswordHash = PasswordHasher.HashPassword(tempPassword);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PermissionMatrixDto> GetPermissionMatrixAsync()
        {
            // Try to get from database first
            var dbPermissions = await _context.PermissionMatrix.ToListAsync();
            
            if (dbPermissions.Any())
            {
                // Group permissions by category
                var categories = new List<PermissionCategoryDto>();
                
                var permissionGroups = dbPermissions.GroupBy(p => GetPermissionCategory(p.PermissionId));
                
                foreach (var group in permissionGroups)
                {
                    var permissions = group.Select(p => new PermissionItemDto
                    {
                        Id = p.PermissionId,
                        Label = GetPermissionLabel(p.PermissionId),
                        Category = GetPermissionCategory(p.PermissionId),
                        Roles = new Dictionary<string, bool>
                        {
                            { "HrAdmin", dbPermissions.Any(x => x.PermissionId == p.PermissionId && x.RoleName == "HrAdmin" && x.IsAllowed) },
                            { "HrManager", dbPermissions.Any(x => x.PermissionId == p.PermissionId && x.RoleName == "HrManager" && x.IsAllowed) },
                            { "HrDataEntry", dbPermissions.Any(x => x.PermissionId == p.PermissionId && x.RoleName == "HrDataEntry" && x.IsAllowed) },
                            { "Viewer", dbPermissions.Any(x => x.PermissionId == p.PermissionId && x.RoleName == "Viewer" && x.IsAllowed) }
                        }
                    }).ToList();
                    
                    categories.Add(new PermissionCategoryDto
                    {
                        Name = group.Key,
                        Permissions = permissions
                    });
                }
                
                return new PermissionMatrixDto { Categories = categories };
            }
            
            // Fallback to default permissions
            return new PermissionMatrixDto
            {
                Categories = new List<PermissionCategoryDto>
                {
                    new PermissionCategoryDto
                    {
                        Name = "Staff Management",
                        Permissions = new List<PermissionItemDto>
                        {
                            new PermissionItemDto { Id = "view-staff", Label = "View Staff Profiles", Category = "Staff Management", Roles = new Dictionary<string, bool> { { "HrAdmin", true }, { "HrManager", true }, { "HrDataEntry", true }, { "Viewer", true } } },
                            new PermissionItemDto { Id = "edit-staff", Label = "Edit Staff Profiles", Category = "Staff Management", Roles = new Dictionary<string, bool> { { "HrAdmin", true }, { "HrManager", true }, { "HrDataEntry", false }, { "Viewer", false } } },
                            new PermissionItemDto { Id = "delete-staff", Label = "Delete Staff Profiles", Category = "Staff Management", Roles = new Dictionary<string, bool> { { "HrAdmin", true }, { "HrManager", false }, { "HrDataEntry", false }, { "Viewer", false } } }
                        }
                    },
                    new PermissionCategoryDto
                    {
                        Name = "Time & Attendance",
                        Permissions = new List<PermissionItemDto>
                        {
                            new PermissionItemDto { Id = "approve-timesheets", Label = "Approve Timesheets", Category = "Time & Attendance", Roles = new Dictionary<string, bool> { { "HrAdmin", true }, { "HrManager", true }, { "HrDataEntry", true }, { "Viewer", false } } },
                            new PermissionItemDto { Id = "export-timesheets", Label = "Export Timesheets", Category = "Time & Attendance", Roles = new Dictionary<string, bool> { { "HrAdmin", true }, { "HrManager", false }, { "HrDataEntry", false }, { "Viewer", false } } }
                        }
                    }
                }
            };
        }

        private string GetPermissionLabel(string permissionId)
        {
            return permissionId switch
            {
                "view-staff" => "View Staff Profiles",
                "edit-staff" => "Edit Staff Profiles",
                "delete-staff" => "Delete Staff Profiles",
                "approve-timesheets" => "Approve Timesheets",
                "export-timesheets" => "Export Timesheets",
                "approve-leave" => "Approve Leave Requests",
                "manage-pips" => "Manage PIPs",
                "view-governance" => "View Governance Flags",
                "resolve-governance" => "Resolve Governance Flags",
                "access-settings" => "Access System Settings",
                _ => permissionId
            };
        }

        private string GetPermissionCategory(string permissionId)
        {
            return permissionId switch
            {
                "view-staff" or "edit-staff" or "delete-staff" => "Staff Management",
                "approve-timesheets" or "export-timesheets" => "Time & Attendance",
                "approve-leave" => "Leave Management",
                "manage-pips" => "Performance",
                "view-governance" or "resolve-governance" => "Governance",
                "access-settings" => "System",
                _ => "Other"
            };
        }

        public async Task<bool> TrackUserSessionAsync(int userId, string token, string browser, string ipAddress, string location)
        {
            try
            {
                await InvalidateUserSessionsAsync(userId);
                
                var session = new UserSession
                {
                    UserId = userId,
                    Token = token,
                    Browser = browser,
                    IpAddress = ipAddress,
                    Location = location,
                    LoginTime = DateTime.UtcNow,
                    LastActivityTime = DateTime.UtcNow,
                    IsActive = true
                };
                
                _context.UserSessions.Add(session);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error tracking user session for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> UpdateSessionActivityAsync(int userId)
        {
            try
            {
                var activeSession = await _context.UserSessions
                    .FirstOrDefaultAsync(s => s.UserId == userId && s.IsActive);
                
                if (activeSession != null)
                {
                    activeSession.LastActivityTime = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating session activity for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> InvalidateUserSessionsAsync(int userId)
        {
            try
            {
                var activeSessions = await _context.UserSessions
                    .Where(s => s.UserId == userId && s.IsActive)
                    .ToListAsync();
                
                foreach (var session in activeSessions)
                {
                    session.IsActive = false;
                    session.LogoutTime = DateTime.UtcNow;
                }
                
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating sessions for user {UserId}", userId);
                return false;
            }
        }

        public async Task<List<ActiveSessionDto>> GetActiveSessionsAsync()
        {
            try
            {
                var activeSessions = await _context.UserSessions
                    .Include(s => s.User)
                    .Where(s => s.IsActive)
                    .OrderByDescending(s => s.LastActivityTime)
                    .Select(s => new ActiveSessionDto
                    {
                        Id = s.Id,
                        UserName = s.User != null ? s.User.FullName : "Unknown",
                        Browser = s.Browser,
                        Location = s.Location,
                        Ip = s.IpAddress,
                        LastActive = s.LastActivityTime != null 
                            ? s.LastActivityTime.Value.ToString("dd-MM-yyyy, h:mm tt") 
                            : s.LoginTime.ToString("dd-MM-yyyy, h:mm tt")
                    })
                    .ToListAsync();
                
                return activeSessions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active sessions");
                return new List<ActiveSessionDto>();
            }
        }

        public async Task<bool> EndSessionAsync(int sessionId)
        {
            try
            {
                var session = await _context.UserSessions.FindAsync(sessionId);
                if (session == null) return false;
                
                session.IsActive = false;
                session.LogoutTime = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ending session {SessionId}", sessionId);
                return false;
            }
        }
    }
}