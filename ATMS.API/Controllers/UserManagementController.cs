using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using ATMS.API.Data;
using ATMS.API.DTOs;
using ATMS.API.Services;
using ATMS.API.Models;

namespace ATMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "HrAdmin")]
    public class UserManagementController : ControllerBase
    {
        private readonly IUserManagementService _userManagementService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserManagementController> _logger;

        public UserManagementController(
            IUserManagementService userManagementService,
            ApplicationDbContext context,
            ILogger<UserManagementController> logger)
        {
            _userManagementService = userManagementService;
            _context = context;
            _logger = logger;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers([FromQuery] string? team = null)
        {
            var result = await _userManagementService.GetAllSystemUsersAsync(team);
            return Ok(result);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var result = await _userManagementService.GetSystemUserByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateSystemUserDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _userManagementService.CreateSystemUserAsync(dto, userId);
            return Ok(result);
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateSystemUserDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _userManagementService.UpdateSystemUserAsync(id, dto, userId);
            return Ok(result);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await _userManagementService.DeleteSystemUserAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "User deleted successfully" });
        }

        [HttpPost("users/{userId}/reset-password")]
        public async Task<IActionResult> ResetPassword(int userId)
        {
            var result = await _userManagementService.ResetUserPasswordAsync(userId);
            if (!result) return NotFound();
            return Ok(new { message = "Password reset successfully" });
        }

        [HttpGet("permissions/matrix")]
        public async Task<IActionResult> GetPermissionMatrix()
        {
            var result = await _userManagementService.GetPermissionMatrixAsync();
            return Ok(result);
        }

        [HttpPut("permissions/matrix")]
        public async Task<IActionResult> UpdatePermissionMatrix([FromBody] UpdatePermissionMatrixDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                foreach (var update in dto.Updates)
                {
                    foreach (var role in update.Roles)
                    {
                        // Check if record exists
                        var existing = await _context.PermissionMatrix
                            .FirstOrDefaultAsync(p => p.PermissionId == update.PermissionId && p.RoleName == role.Key);
                        
                        if (existing != null)
                        {
                            // Update existing record
                            existing.IsAllowed = role.Value;
                            existing.UpdatedAt = DateTime.UtcNow;
                            existing.UpdatedBy = userId;
                        }
                        else
                        {
                            // Create new record
                            var newPermission = new PermissionMatrix
                            {
                                PermissionId = update.PermissionId,
                                RoleName = role.Key,
                                IsAllowed = role.Value,
                                UpdatedAt = DateTime.UtcNow,
                                UpdatedBy = userId
                            };
                            _context.PermissionMatrix.Add(newPermission);
                        }
                    }
                }
                
                await _context.SaveChangesAsync();
                _logger.LogInformation("Permission matrix updated by user {UserId}", userId);
                
                return Ok(new { message = "Permissions updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating permission matrix");
                return StatusCode(500, new { message = "An error occurred while updating permissions" });
            }
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetActiveSessions()
        {
            var result = await _userManagementService.GetActiveSessionsAsync();
            return Ok(result);
        }

        [HttpDelete("sessions/{sessionId}")]
        public async Task<IActionResult> EndSession(int sessionId)
        {
            var result = await _userManagementService.EndSessionAsync(sessionId);
            return Ok(new { message = "Session ended successfully" });
        }
    }
}