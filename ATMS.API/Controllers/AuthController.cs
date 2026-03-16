using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ATMS.API.DTOs;
using ATMS.API.Services;

namespace ATMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var result = await _authService.Authenticate(loginDto);
            if (result == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
            
            return Ok(result);
        }

        [HttpPost("register")]
        [Authorize(Roles = "EcewsSupervisor,GonSupervisor")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            var result = await _authService.Register(registerDto);
            if (result == null)
            {
                return BadRequest(new { message = "Registration failed. User may already exist or invalid role." });
            }
            
            return Ok(result);
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _authService.ChangePassword(userId, changePasswordDto.CurrentPassword, changePasswordDto.NewPassword);
            
            if (!result)
            {
                return BadRequest(new { message = "Password change failed. Please check your current password." });
            }
            
            return Ok(new { message = "Password changed successfully" });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _authService.GetUserById(userId);
            
            if (user == null)
            {
                return NotFound();
            }
            
            return Ok(user);
        }
    }
}