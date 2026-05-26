using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using ATMS.API.Data;
using ATMS.API.DTOs;
using ATMS.API.Services;

namespace ATMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "AdHoc")]
    public class AdHocController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ITimesheetService _timesheetService;
        private readonly IUserService _userService;
        private readonly IPdfService _pdfService;
        
        public AdHocController(
            ApplicationDbContext context, 
            ITimesheetService timesheetService, 
            IUserService userService, 
            IPdfService pdfService)
        {
            _context = context;  // ADD THIS LINE - was missing
            _timesheetService = timesheetService;
            _userService = userService;
            _pdfService = pdfService;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _userService.GetUserById(userId);
            
            if (user == null)
                return NotFound();
            
            // Fetch contract letters for this user
            var contractLetters = await _context.ContractLetters
                .Where(cl => cl.UserId == userId)
                .OrderByDescending(cl => cl.GeneratedAt)
                .Select(cl => new ContractLetterDto
                {
                    Id = cl.Id,
                    FileName = cl.FileName,
                    FileUrl = cl.FileUrl,
                    FileSize = cl.FileSize,
                    GeneratedAt = cl.GeneratedAt,
                    GeneratedByUserId = cl.GeneratedByUserId
                })
                .ToListAsync();
            
            // Add contract letters to the response
            var userWithLetters = new
            {
                user.Id,
                user.PublicId,
                user.EmployeeCode,
                user.Email,
                user.FullName,
                user.PhoneNumber,
                user.ProfileImageUrl,
                user.Designation,
                user.Department,
                user.Project,
                user.State,
                user.LGA,
                user.HealthFacility,
                user.BankName,
                user.AccountNumber,
                user.AccountName,
                user.NINName,
                user.NINNumber,
                user.TINName,
                user.TINNumber,
                user.EmergencyContactName,
                user.EmergencyContactPhone,
                user.ContractStatus,
                user.ContractStartDate,
                user.ContractEndDate,
                user.DigitalSignatureUrl,
                user.Role,
                user.EcewsSupervisorId,
                user.EcewsSupervisorName,
                user.GonSupervisorId,
                user.GonSupervisorName,
                user.IsActive,
                contractLetters
            };
            
            return Ok(userWithLetters);
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

        [HttpGet("timesheets/{id}/download")]
        public async Task<IActionResult> DownloadTimesheet(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var timesheet = await _timesheetService.GetTimesheetById(id, userId, "AdHoc");
            
            if (timesheet == null)
                return NotFound();

            var pdfBytes = await _pdfService.GenerateTimesheetPdf(timesheet);
            return File(pdfBytes, "application/pdf", $"Timesheet_{timesheet.MonthYear}_{timesheet.UserName}.pdf");
        }

        [HttpPut("timesheets/{id}")]
        public async Task<IActionResult> UpdateTimesheet(int id, CreateTimesheetDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var timesheet = await _timesheetService.UpdateTimesheet(id, userId, dto);
            
            if (timesheet == null)
                return NotFound();
            
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

        // GET: api/AdHoc/documents
        [HttpGet("documents")]
        public async Task<IActionResult> GetUserDocuments()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var documents = await _userService.GetUserDocumentsAsync(userId);
            return Ok(documents);
        }

        // POST: api/AdHoc/documents/upload
        [HttpPost("documents/upload")]
        public async Task<IActionResult> UploadDocument([FromForm] UploadDocumentDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            if (dto.File == null || dto.File.Length == 0)
                return BadRequest(new { message = "No file uploaded" });
            
            var result = await _userService.UploadDocumentAsync(userId, dto.File);
            return Ok(result);
        }

        // DELETE: api/AdHoc/documents/{id}
        [HttpDelete("documents/{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var result = await _userService.DeleteDocumentAsync(userId, id);
            
            if (!result)
                return NotFound(new { message = "Document not found" });
            
            return Ok(new { message = "Document deleted successfully" });
        }
    }

    public class SubmitTimesheetDto
    {
        public string? Comments { get; set; }
    }
}