// ATMS.API/Controllers/AuthController.cs

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
                return Unauthorized(new { message = "Invalid staff ID/email or password" });
            }
            
            return Ok(result);
        }

        [HttpPost("register")]
        [Authorize(Roles = "EcewsSupervisor,GonSupervisor,Programs")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            var result = await _authService.Register(registerDto);
            if (result == null)
            {
                return BadRequest(new { message = "Registration failed. User may already exist or invalid role." });
            }
            
            return Ok(result);
        }

        [HttpGet("debug-role")]
        [Authorize]
        public IActionResult DebugRole()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            return Ok(new { email, role });
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

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var result = await _authService.ForgotPassword(dto.Email);
            if (!result)
            {
                // Don't reveal that the user doesn't exist for security
                return Ok(new { message = "If an account with that email exists, a password reset link has been sent." });
            }
            return Ok(new { message = "Password reset link sent to your email." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var result = await _authService.ResetPassword(dto.Token, dto.NewPassword);
            if (!result)
            {
                return BadRequest(new { message = "Invalid or expired reset token." });
            }
            return Ok(new { message = "Password reset successfully." });
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