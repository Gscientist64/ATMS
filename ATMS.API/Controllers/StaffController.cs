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
    [Authorize]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        // ==================== Profile ====================

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var result = await _staffService.GetProfileAsync(GetUserId());
            return Ok(result);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] StaffProfileDto dto)
        {
            var result = await _staffService.UpdateProfileAsync(GetUserId(), dto);
            return Ok(result);
        }

        // ==================== Timesheets ====================

        [HttpGet("timesheets")]
        public async Task<IActionResult> GetTimesheets()
        {
            var result = await _staffService.GetTimesheetsAsync(GetUserId());
            return Ok(result);
        }

        [HttpGet("timesheets/current")]
        public async Task<IActionResult> GetCurrentTimesheet()
        {
            var result = await _staffService.GetCurrentTimesheetAsync(GetUserId());
            return Ok(result);
        }

        // ==================== Leave ====================

        [HttpGet("leave/balance")]
        public async Task<IActionResult> GetLeaveBalance()
        {
            var result = await _staffService.GetLeaveBalanceAsync(GetUserId());
            return Ok(result);
        }

        [HttpGet("leave/history")]
        public async Task<IActionResult> GetLeaveHistory()
        {
            var result = await _staffService.GetLeaveHistoryAsync(GetUserId());
            return Ok(result);
        }

        [HttpPost("leave/apply")]
        public async Task<IActionResult> ApplyForLeave([FromBody] CreateLeaveDto dto)
        {
            var result = await _staffService.ApplyForLeaveAsync(GetUserId(), dto);
            return Ok(result);
        }

        [HttpPost("leave/{id}/cancel")]
        public async Task<IActionResult> CancelLeave(int id, [FromBody] CancelLeaveDto? dto)
        {
            var result = await _staffService.CancelLeaveAsync(GetUserId(), id, dto);
            if (!result)
                return BadRequest(new { message = "Unable to cancel leave request" });
            return Ok(new { message = "Leave request cancelled successfully" });
        }

        // ==================== Onboarding ====================

        [HttpGet("onboarding/status")]
        public async Task<IActionResult> GetOnboardingStatus()
        {
            var result = await _staffService.GetOnboardingStatusAsync(GetUserId());
            return Ok(result);
        }

        [HttpPost("onboarding/step")]
        public async Task<IActionResult> SaveOnboardingStep([FromBody] SaveOnboardingStepDto dto)
        {
            var result = await _staffService.SaveOnboardingStepAsync(GetUserId(), dto);
            return Ok(result);
        }

        [HttpPost("onboarding/submit")]
        public async Task<IActionResult> SubmitOnboarding([FromBody] SubmitOnboardingDto dto)
        {
            var result = await _staffService.SubmitOnboardingAsync(GetUserId(), dto);
            return Ok(result);
        }
    }
}
