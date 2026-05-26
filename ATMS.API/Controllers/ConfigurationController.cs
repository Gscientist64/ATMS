using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using ATMS.API.DTOs;
using ATMS.API.Services;

namespace ATMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "HrAdmin,Programs")]  // CHANGE THIS - Add Programs
    public class ConfigurationController : ControllerBase
    {
        private readonly IConfigurationService _configurationService;
        private readonly ILogger<ConfigurationController> _logger;

        public ConfigurationController(IConfigurationService configurationService, ILogger<ConfigurationController> logger)
        {
            _configurationService = configurationService;
            _logger = logger;
        }

        // ========== Projects Endpoints ==========
        [HttpGet("projects")]
        public async Task<IActionResult> GetAllProjects()
        {
            var result = await _configurationService.GetAllProjectsAsync();
            return Ok(result);
        }

        [HttpGet("projects/{id}")]
        public async Task<IActionResult> GetProjectById(int id)
        {
            var result = await _configurationService.GetProjectByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("projects")]
        [Authorize(Roles = "HrAdmin")]  // Only HR can create/update/delete
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _configurationService.CreateProjectAsync(dto, userId);
            return Ok(result);
        }

        [HttpPut("projects/{id}")]
        [Authorize(Roles = "HrAdmin")]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _configurationService.UpdateProjectAsync(id, dto, userId);
            return Ok(result);
        }

        [HttpDelete("projects/{id}")]
        [Authorize(Roles = "HrAdmin")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var result = await _configurationService.DeleteProjectAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Project deleted successfully" });
        }

        // ========== Permission Settings Endpoints ==========
        [HttpGet("permissions/settings")]
        public async Task<IActionResult> GetPermissionSettings()
        {
            var result = await _configurationService.GetPermissionSettingsAsync();
            return Ok(result);
        }

        [HttpPut("permissions/settings")]
        [Authorize(Roles = "HrAdmin")]  // Only HR can update settings
        public async Task<IActionResult> UpdatePermissionSettings([FromBody] UpdatePermissionSettingsDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _configurationService.UpdatePermissionSettingsAsync(dto, userId);
            return Ok(result);
        }

        // ========== Permission User Assignment Endpoints ==========
        [HttpGet("permissions/{permissionKey}/users")]
        public async Task<IActionResult> GetUsersByPermission(string permissionKey)
        {
            var result = await _configurationService.GetUsersByPermissionAsync(permissionKey);
            return Ok(result);
        }

        [HttpPost("permissions/users")]
        [Authorize(Roles = "HrAdmin")]  // Only HR can assign users
        public async Task<IActionResult> AssignUserToPermission([FromBody] AssignUserToPermissionDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _configurationService.AssignUserToPermissionAsync(dto.PermissionKey, dto.UserId, userId);
            return Ok(new { message = "User assigned successfully" });
        }

        [HttpDelete("permissions/{permissionKey}/users/{userId}")]
        [Authorize(Roles = "HrAdmin")]  // Only HR can remove users
        public async Task<IActionResult> RemoveUserFromPermission(string permissionKey, int userId)
        {
            var result = await _configurationService.RemoveUserFromPermissionAsync(permissionKey, userId);
            if (!result) return NotFound();
            return Ok(new { message = "User removed successfully" });
        }

        // ========== Permission Check Endpoint ==========
        [HttpGet("permissions/has-access")]
        public async Task<IActionResult> HasPermission([FromQuery] string permissionKey)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var hasPermission = await _configurationService.HasPermissionAsync(userId, permissionKey);
            return Ok(new { hasPermission });
        }
    }
}