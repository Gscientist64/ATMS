using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ATMS.API.DTOs;
using ATMS.API.Services;

namespace ATMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "AdHoc")]
    public class AdHocController : ControllerBase
    {
        private readonly ITimesheetService _timesheetService;
        private readonly IUserService _userService;

        public AdHocController(ITimesheetService timesheetService, IUserService userService)
        {
            _timesheetService = timesheetService;
            _userService = userService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _userService.GetUserById(userId);
            
            if (user == null)
            {
                return NotFound();
            }
            
            return Ok(user);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDto updateProfileDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _userService.UpdateProfile(userId, updateProfileDto);
            
            if (!result)
            {
                return BadRequest(new { message = "Profile update failed" });
            }
            
            return Ok(new { message = "Profile updated successfully" });
        }

        [HttpPost("signature")]
        public async Task<IActionResult> UploadSignature(UploadSignatureDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var signatureUrl = await _userService.SaveSignature(userId, dto.SignatureImageBase64);
            
            if (string.IsNullOrEmpty(signatureUrl))
            {
                return BadRequest(new { message = "Signature upload failed" });
            }
            
            return Ok(new { signatureUrl });
        }

        [HttpDelete("signature")]
        public async Task<IActionResult> DeleteSignature()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _userService.DeleteSignature(userId);
            
            if (!result)
            {
                return BadRequest(new { message = "Signature deletion failed" });
            }
            
            return Ok(new { message = "Signature deleted successfully" });
        }

        [HttpPost("profile-picture")]
        public async Task<IActionResult> UploadProfilePicture(IFormFile file)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var pictureUrl = await _userService.UploadProfilePicture(userId, file);
                
                return Ok(new { profileImageUrl = pictureUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("profile-picture")]
        public async Task<IActionResult> DeleteProfilePicture()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _userService.DeleteProfilePicture(userId);
            
            if (!result)
                return BadRequest(new { message = "Failed to delete profile picture" });
            
            return Ok(new { message = "Profile picture deleted successfully" });
        }

        [HttpGet("timesheets")]
        public async Task<IActionResult> GetMyTimesheets()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var timesheets = await _timesheetService.GetUserTimesheets(userId);
            return Ok(timesheets);
        }

        [HttpGet("timesheets/{id}")]
        public async Task<IActionResult> GetTimesheet(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var timesheet = await _timesheetService.GetTimesheetById(id, userId, "AdHoc");
            
            if (timesheet == null)
            {
                return NotFound();
            }
            
            return Ok(timesheet);
        }

        [HttpPost("timesheets")]
        public async Task<IActionResult> CreateTimesheet(CreateTimesheetDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var timesheet = await _timesheetService.CreateTimesheet(userId, dto);
            return CreatedAtAction(nameof(GetTimesheet), new { id = timesheet.Id }, timesheet);
        }

        [HttpPost("timesheets/{id}/submit")]
        public async Task<IActionResult> SubmitTimesheet(int id, SubmitTimesheetDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var timesheet = await _timesheetService.SubmitTimesheet(id, userId, dto.Comments ?? "");
            
            if (timesheet == null)
            {
                return NotFound();
            }
            
            return Ok(timesheet);
        }
    }

    public class SubmitTimesheetDto
    {
        public string? Comments { get; set; }
    }
}