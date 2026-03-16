using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ATMS.API.DTOs;
using ATMS.API.Services;

namespace ATMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "GonSupervisor")]
    public class GonSupervisorController : ControllerBase
    {
        private readonly ITimesheetService _timesheetService;
        private readonly IUserService _userService;

        public GonSupervisorController(ITimesheetService timesheetService, IUserService userService)
        {
            _timesheetService = timesheetService;
            _userService = userService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var pendingTimesheets = await _timesheetService.GetTimesheetsForReview(supervisorId, "GonSupervisor", "GONReview");
            
            return Ok(new
            {
                PendingTimesheets = pendingTimesheets.Count,
                ActiveTimesheets = pendingTimesheets
            });
        }

        [HttpGet("timesheets/review")]
        public async Task<IActionResult> GetTimesheetsForReview([FromQuery] string status = "pending")
        {
            var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            string timesheetStatus = status.ToLower() switch
            {
                "pending" => "GONReview",
                "approved" => "Approved,ProgramsTeam,HR",
                "returned" => "Rejected",
                _ => "GONReview"
            };

            var timesheets = await _timesheetService.GetTimesheetsForReview(supervisorId, "GonSupervisor", timesheetStatus);
            return Ok(timesheets);
        }

        [HttpGet("timesheets/{id}")]
        public async Task<IActionResult> GetTimesheet(int id)
        {
            var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var timesheet = await _timesheetService.GetTimesheetById(id, supervisorId, "GonSupervisor");
            
            if (timesheet == null)
            {
                return NotFound();
            }
            
            return Ok(timesheet);
        }

        [HttpPost("timesheets/{id}/approve")]
        public async Task<IActionResult> ApproveTimesheet(int id, ApproveTimesheetDto dto)
        {
            var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var timesheet = await _timesheetService.ReviewTimesheet(id, supervisorId, "Approve", dto.Comments ?? "");
            
            if (timesheet == null)
            {
                return NotFound();
            }
            
            return Ok(new { message = "Timesheet approved successfully", timesheet });
        }

        [HttpPost("timesheets/{id}/decline")]
        public async Task<IActionResult> DeclineTimesheet(int id, DeclineTimesheetDto dto)
        {
            var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            if (string.IsNullOrWhiteSpace(dto.Feedback))
            {
                return BadRequest(new { message = "Feedback is required when declining a timesheet" });
            }

            var timesheet = await _timesheetService.ReviewTimesheet(id, supervisorId, "Reject", dto.Feedback);
            
            if (timesheet == null)
            {
                return NotFound();
            }
            
            return Ok(new { message = "Timesheet returned with feedback", timesheet });
        }

        [HttpPost("timesheets/{id}/comments")]
        public async Task<IActionResult> AddComment(int id, AddCommentDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var timesheet = await _timesheetService.AddComment(id, userId, dto.Comment);
            
            return Ok(timesheet);
        }

        [HttpGet("supervisees")]
        public async Task<IActionResult> GetSupervisees()
        {
            var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var supervisees = await _userService.GetSupervisees(supervisorId, "GonSupervisor");
            
            return Ok(new
            {
                Total = supervisees.Count,
                Items = supervisees
            });
        }
    }
}