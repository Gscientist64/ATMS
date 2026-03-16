using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ATMS.API.DTOs;
using ATMS.API.Services;

namespace ATMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "EcewsSupervisor")]
    public class EcewsSupervisorController : ControllerBase
    {
        private readonly ITimesheetService _timesheetService;
        private readonly IUserService _userService;

        public EcewsSupervisorController(ITimesheetService timesheetService, IUserService userService)
        {
            _timesheetService = timesheetService;
            _userService = userService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var pendingTimesheets = await _timesheetService.GetTimesheetsForReview(supervisorId, "EcewsSupervisor", "Submitted");
            
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
                "pending" => "Submitted",
                "approved" => "GONReview",
                "returned" => "Rejected",
                _ => "Submitted"
            };

            var timesheets = await _timesheetService.GetTimesheetsForReview(supervisorId, "EcewsSupervisor", timesheetStatus);
            return Ok(timesheets);
        }

        [HttpGet("timesheets/{id}")]
        public async Task<IActionResult> GetTimesheet(int id)
        {
            var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var timesheet = await _timesheetService.GetTimesheetById(id, supervisorId, "EcewsSupervisor");
            
            if (timesheet == null)
            {
                return NotFound();
            }
            
            return Ok(timesheet);
        }

        [HttpPost("timesheets/{id}/review")]
        public async Task<IActionResult> ReviewTimesheet(int id, ReviewTimesheetDto dto)
        {
            var supervisorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var timesheet = await _timesheetService.ReviewTimesheet(id, supervisorId, dto.Action, dto.Comments ?? "");
            
            if (timesheet == null)
            {
                return NotFound();
            }
            
            return Ok(timesheet);
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
            
            var supervisees = await _userService.GetSupervisees(supervisorId, "EcewsSupervisor");
            
            return Ok(new
            {
                Total = supervisees.Count,
                Items = supervisees
            });
        }
    }

    public class ReviewTimesheetDto
    {
        public string Action { get; set; } = string.Empty;
        public string? Comments { get; set; }
    }
}