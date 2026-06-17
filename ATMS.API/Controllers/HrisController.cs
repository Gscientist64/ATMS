// ATMS.API/Controllers/HrisController.cs

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using ATMS.API.DTOs;
using ATMS.API.Services;
using ATMS.API.Data;

namespace ATMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HrisController : ControllerBase
    {
        private readonly IPipService _pipService;
        private readonly ITerminationService _terminationService;
        private readonly IAnnouncementService _announcementService;
        private readonly IWorkCycleService _workCycleService;
        private readonly IAnalyticsService _analyticsService;
        private readonly IGovernanceService _governanceService;
        private readonly IUserService _userService;
        private readonly IEmailService _emailService;
        private readonly ILogger<HrisController> _logger;
        private readonly IContractLetterService _contractLetterService;
        private readonly IConfigurationService _configurationService;
        private readonly ApplicationDbContext _context;
        public HrisController(
            IPipService pipService,
            ITerminationService terminationService,
            IAnnouncementService announcementService,
            IWorkCycleService workCycleService,
            IAnalyticsService analyticsService,
            IGovernanceService governanceService,
            IUserService userService,
            IEmailService emailService,
            ILogger<HrisController> logger,
            IContractLetterService contractLetterService,
            IConfigurationService configurationService,
            ApplicationDbContext context)
        {
            _pipService = pipService;
            _terminationService = terminationService;
            _announcementService = announcementService;
            _workCycleService = workCycleService;
            _analyticsService = analyticsService;
            _governanceService = governanceService;
            _userService = userService;
            _emailService = emailService;
            _contractLetterService = contractLetterService;
            _configurationService = configurationService;
            _logger = logger;
            _context = context;
        }

        // ========== PIP Endpoints ==========
        [HttpPost("pip")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> InitiatePip([FromBody] CreatePipDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _pipService.InitiatePipAsync(userId, dto);
            return Ok(result);
        }

        [HttpGet("pip/{id}")]
        public async Task<IActionResult> GetPip(int id)
        {
            var result = await _pipService.GetPipByIdAsync(id);
            if (result == null) return NotFound(new { message = "PIP not found" });
            return Ok(result);
        }

        [HttpGet("pip/user/{userId}")]
        public async Task<IActionResult> GetUserPips(int userId)
        {
            var result = await _pipService.GetPipsForUserAsync(userId);
            return Ok(result);
        }

        [HttpGet("pip/active/all")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> GetAllActivePips()
        {
            var result = await _pipService.GetAllActivePipsAsync();
            return Ok(result);
        }

        [HttpPut("pip/{id}")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> UpdatePip(int id, [FromBody] UpdatePipDto dto)
        {
            var result = await _pipService.UpdatePipAsync(id, dto);
            return Ok(result);
        }

        [HttpPost("pip/{id}/review")]
        public async Task<IActionResult> AddPipReview(int id, [FromBody] AddPipReviewDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _pipService.AddReviewAsync(id, userId, dto);
            return Ok(result);
        }

        [HttpPost("pip/{id}/end")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> EndPip(int id, [FromBody] EndPipDto dto)
        {
            var result = await _pipService.EndPipAsync(id, dto);
            return Ok(result);
        }

    

        // ========== Termination Endpoints ==========
        [HttpPost("termination")]
        [Authorize(Roles = "HrAdmin")]
        public async Task<IActionResult> TerminateEmployee([FromBody] CreateTerminationDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _terminationService.TerminateEmployeeAsync(userId, dto);
            return Ok(result);
        }

        [HttpGet("termination/user/{userId}")]
        [Authorize(Roles = "HrAdmin")]
        public async Task<IActionResult> GetTerminationByUser(int userId)
        {
            var result = await _terminationService.GetTerminationByUserIdAsync(userId);
            if (result == null) return NotFound(new { message = "No termination record found for this user" });
            return Ok(result);
        }

        [HttpGet("termination/all")]
        [Authorize(Roles = "HrAdmin")]
        public async Task<IActionResult> GetAllTerminations()
        {
            var result = await _terminationService.GetAllTerminationsAsync();
            return Ok(result);
        }

        // ========== Announcement Endpoints ==========
        [HttpPost("announcement")]
        [Authorize(Roles = "HrAdmin")]
        public async Task<IActionResult> CreateAnnouncement([FromBody] CreateAnnouncementDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _announcementService.CreateAnnouncementAsync(userId, dto);
            return Ok(result);
        }

        [HttpGet("announcement/active")]
        public async Task<IActionResult> GetActiveAnnouncements()
        {
            var result = await _announcementService.GetActiveAnnouncementsAsync();
            return Ok(result);
        }

        [HttpGet("announcement/all")]
        [Authorize(Roles = "HrAdmin")]
        public async Task<IActionResult> GetAllAnnouncements()
        {
            var result = await _announcementService.GetAllAnnouncementsAsync();
            return Ok(result);
        }

        [HttpPut("announcement/{id}")]
        [Authorize(Roles = "HrAdmin")]
        public async Task<IActionResult> UpdateAnnouncement(int id, [FromBody] CreateAnnouncementDto dto)
        {
            var result = await _announcementService.UpdateAnnouncementAsync(id, dto);
            return Ok(result);
        }

        [HttpDelete("announcement/{id}")]
        [Authorize(Roles = "HrAdmin")]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            var result = await _announcementService.DeleteAnnouncementAsync(id);
            if (!result) return NotFound(new { message = "Announcement not found" });
            return Ok(new { message = "Announcement deleted successfully" });
        }

        // ========== Work Cycle Endpoints ==========
        [HttpPost("workcycle")]
        [Authorize(Roles = "HrAdmin")]
        public async Task<IActionResult> CreateWorkCycle([FromBody] CreateWorkCycleDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _workCycleService.CreateWorkCycleAsync(userId, dto);
            return Ok(result);
        }

        [HttpGet("workcycle/active")]
        public async Task<IActionResult> GetActiveWorkCycles()
        {
            var result = await _workCycleService.GetActiveWorkCyclesAsync();
            return Ok(result);
        }

        [HttpPut("workcycle/{id}")]
        [Authorize(Roles = "HrAdmin")]
        public async Task<IActionResult> UpdateWorkCycle(int id, [FromBody] CreateWorkCycleDto dto)
        {
            var result = await _workCycleService.UpdateWorkCycleAsync(id, dto);
            return Ok(result);
        }

        [HttpDelete("workcycle/{id}")]
        [Authorize(Roles = "HrAdmin")]
        public async Task<IActionResult> DeactivateWorkCycle(int id)
        {
            var result = await _workCycleService.DeactivateWorkCycleAsync(id);
            if (!result) return NotFound(new { message = "Work cycle not found" });
            return Ok(new { message = "Work cycle deactivated successfully" });
        }

        [HttpPost("workcycle/send-reminders")]
        [Authorize(Roles = "HrAdmin")]
        public async Task<IActionResult> SendWorkCycleReminders()
        {
            await _workCycleService.SendRemindersForActiveCyclesAsync();
            return Ok(new { message = "Reminders sent for active work cycles" });
        }

        // ========== Analytics Endpoint ==========
        [HttpGet("dashboard")]
        [Authorize(Roles = "HrAdmin,Programs")] // allow Programs as well
        public async Task<IActionResult> GetHrisDashboard([FromQuery] string? type = null)
        {
            var result = await _analyticsService.GetHrisDashboardAsync(type);
            return Ok(result);
        }

    

        // ========== Employee Management Endpoints ==========
        [HttpGet("employees")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> GetAllEmployees([FromQuery] string? role, [FromQuery] bool? active)
        {
            var result = await _userService.GetAllEmployeesAsync(role, active);
            return Ok(result);
        }

        [HttpGet("employees/role/{roleName}")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> GetEmployeesByRole(string roleName)
        {
            var result = await _userService.GetEmployeesByRoleAsync(roleName);
            return Ok(result);
        }

        [HttpGet("employees/ancillary")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> GetAncillaryEmployees(
            [FromQuery] string? search = null,
            [FromQuery] string? location = null,
            [FromQuery] string? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _userService.GetAncillaryEmployeesAsync(search, location, status, page, pageSize);
            return Ok(result);
        }

        [HttpPut("employees/{id}/details")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> UpdateStaffDetails(int id, [FromBody] UpdateStaffDetailsDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                
                // Check if user has permission to edit
                if (userRole == "Programs")
                {
                    var hasPermission = await _configurationService.HasPermissionAsync(userId, "editStaffDetails");
                    if (!hasPermission)
                    {
                        return StatusCode(403, new { message = "You don't have permission to edit staff details" });
                    }
                }
                
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }
                
                // Update fields
                user.PhoneNumber = dto.PhoneNumber ?? user.PhoneNumber;
                user.EmergencyContactName = dto.EmergencyContactName ?? user.EmergencyContactName;
                user.EmergencyContactPhone = dto.EmergencyContactPhone ?? user.EmergencyContactPhone;
                user.BankName = dto.BankName ?? user.BankName;
                user.AccountNumber = dto.AccountNumber ?? user.AccountNumber;
                user.AccountName = dto.AccountName ?? user.AccountName;
                user.NINName = dto.NINName ?? user.NINName;
                user.NINNumber = dto.NINNumber ?? user.NINNumber;
                user.TINName = dto.TINName ?? user.TINName;
                user.TINNumber = dto.TINNumber ?? user.TINNumber;
                user.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Staff details updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating staff details for user {UserId}", id);
                return StatusCode(500, new { message = "An error occurred" });
            }
        }

        // Add to HrisController.cs - Governance Actions Endpoints
        [HttpGet("governance/actions")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> GetGovernanceActions([FromQuery] string? type, [FromQuery] string? status)
        {
            var result = await _governanceService.GetAllGovernanceActionsAsync(type, status);
            return Ok(result);
        }

        [HttpGet("governance/actions/{id}")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> GetGovernanceActionById(int id)
        {
            var result = await _governanceService.GetGovernanceActionByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { message = "Governance action not found" });
            }
            return Ok(result);
        }

        [HttpPost("contract/renew")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> RenewContract([FromBody] RenewContractDto dto)
        {
            try
            {
                // Find user by PublicId
                var user = await _context.Users.FirstOrDefaultAsync(u => u.PublicId == dto.UserPublicId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Calculate end date based on duration
                DateTime endDate = dto.StartDate;
                switch (dto.Duration)
                {
                    case "1m":
                        endDate = dto.StartDate.AddMonths(1);
                        break;
                    case "3m":
                        endDate = dto.StartDate.AddMonths(3);
                        break;
                    case "6m":
                        endDate = dto.StartDate.AddMonths(6);
                        break;
                    default:
                        endDate = dto.StartDate.AddMonths(3); // Default to 3 months
                        break;
                }

                // Update user's contract
                user.ContractStartDate = dto.StartDate;
                user.ContractEndDate = endDate;
                user.ContractStatus = "Active";
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Contract renewed for user {user.Email} from {dto.StartDate} to {endDate}");

                return Ok(new { 
                    message = "Contract renewed successfully", 
                    startDate = dto.StartDate, 
                    endDate = endDate 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error renewing contract for user {PublicId}", dto.UserPublicId);
                return StatusCode(500, new { message = "An error occurred while renewing the contract" });
            }
        }

        [HttpGet("employees/ecews")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> GetEcewsEmployees()
        {
            var result = await _userService.GetEmployeesByRoleAsync("EcewsSupervisor");
            return Ok(result);
        }

        [HttpGet("employees/programs")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> GetProgramsEmployees()
        {
            var result = await _userService.GetEmployeesByRoleAsync("Programs");
            return Ok(result);
        }

        [HttpPut("employees/{id}/contract")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> UpdateContractStatus(int id, [FromBody] UpdateContractDto dto)
        {
            var result = await _userService.UpdateContractStatusAsync(id, dto);
            if (!result) return NotFound(new { message = "User not found" });
            return Ok(new { message = "Contract status updated successfully" });
        }

        [HttpGet("employees/by-code/{employeeCode}")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> GetEmployeeByCode(string employeeCode)
        {
            var user = await _userService.GetUserByEmployeeCode(employeeCode);
            if (user == null) return NotFound(new { message = "User not found" });
            return Ok(user);
        }

        [HttpGet("employees/{id}")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> GetEmployeeById(int id)
        {
            var user = await _userService.GetUserById(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpGet("employees/by-id-or-code/{identifier}")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> GetEmployeeByIdOrCode(string identifier)
        {
            // Try to parse as integer (numeric ID)
            if (int.TryParse(identifier, out int id))
            {
                var result = await _userService.GetUserById(id);
                if (result != null) return Ok(result);
            }
            
            // If not an integer or not found, try employee code
            var user = await _userService.GetUserByEmployeeCode(identifier);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpGet("employees/by-public-id/{publicId}")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> GetEmployeeByPublicId(string publicId)
        {
            var user = await _userService.GetUserByPublicId(publicId);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost("contract-letters/save")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> SaveContractLetter([FromForm] SaveContractLetterDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _contractLetterService.SaveContractLetterAsync(dto, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving contract letter");
                return StatusCode(500, new { message = "Failed to save contract letter" });
            }
        }


        [HttpPost("contract/send")]
        [Authorize(Roles = "HrAdmin,Programs")]
        public async Task<IActionResult> SendContractLetter([FromBody] SendContractLetterDto dto)
        {
            try
            {
                await _emailService.SendContractLetterAsync(dto.ToEmail, dto.StaffName, dto.Subject, dto.HtmlContent);
                return Ok(new { message = "Contract letter sent successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send contract letter to {Email}", dto.ToEmail);
                return StatusCode(500, new { message = "Failed to send email" });
            }
        }
    }
}