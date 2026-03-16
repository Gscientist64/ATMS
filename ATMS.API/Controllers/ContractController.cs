using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using ATMS.API.Data;
using ATMS.API.DTOs;
using ATMS.API.Models;
using ATMS.API.Services;

namespace ATMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ContractController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ContractController> _logger;

        public ContractController(
            ApplicationDbContext context,
            IWebHostEnvironment environment,
            ILogger<ContractController> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        // GET: api/contract/my-contracts
        [HttpGet("my-contracts")]
        public async Task<IActionResult> GetMyContracts()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                var contracts = await _context.Contracts
                    .Where(c => c.UserId == userId)
                    .OrderByDescending(c => c.EndDate)
                    .ToListAsync();

                var contractDtos = contracts.Select(c => new ContractDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Period = c.Period,
                    Status = c.Status,
                    StatusClass = c.Status.ToLower(),
                    FileUrl = c.FileUrl,
                    StartDate = c.StartDate,
                    EndDate = c.EndDate,
                    SignedAt = c.SignedAt
                }).ToList();

                return Ok(contractDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching contracts for user");
                return StatusCode(500, new { message = "An error occurred while fetching contracts" });
            }
        }

        // GET: api/contract/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetContract(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                var contract = await _context.Contracts
                    .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

                if (contract == null)
                    return NotFound(new { message = "Contract not found" });

                var contractDto = new ContractDto
                {
                    Id = contract.Id,
                    Title = contract.Title,
                    Period = contract.Period,
                    Status = contract.Status,
                    StatusClass = contract.Status.ToLower(),
                    FileUrl = contract.FileUrl,
                    StartDate = contract.StartDate,
                    EndDate = contract.EndDate,
                    SignedAt = contract.SignedAt
                };

                return Ok(contractDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching contract {ContractId}", id);
                return StatusCode(500, new { message = "An error occurred while fetching the contract" });
            }
        }

        // POST: api/contract/{id}/sign
        [HttpPost("{id}/sign")]
        public async Task<IActionResult> SignContract(int id, [FromBody] SignContractDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                var contract = await _context.Contracts
                    .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

                if (contract == null)
                    return NotFound(new { message = "Contract not found" });

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                // Update contract
                contract.Status = "Signed";
                contract.SignedAt = DateTime.UtcNow;
                contract.DigitalSignatureUrl = user.DigitalSignatureUrl;
                contract.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation($"Contract {id} signed successfully. New status: {contract.Status}");

                return Ok(new { 
                    message = "Contract signed successfully",
                    contract = new {
                        contract.Id,
                        contract.Status,
                        contract.SignedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error signing contract {ContractId}", id);
                return StatusCode(500, new { message = "An error occurred while signing the contract" });
            }
        }

        // GET: api/contract/{id}/download
        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadContract(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                var contract = await _context.Contracts
                    .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

                if (contract == null || string.IsNullOrEmpty(contract.FileUrl))
                    return NotFound(new { message = "Contract not found" });

                var webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var filePath = Path.Combine(webRootPath, contract.FileUrl.TrimStart('/'));
                
                if (!System.IO.File.Exists(filePath))
                    return NotFound(new { message = "Contract file not found" });

                var memory = new MemoryStream();
                using (var stream = new FileStream(filePath, FileMode.Open))
                {
                    await stream.CopyToAsync(memory);
                }
                memory.Position = 0;

                return File(memory, "application/pdf", contract.FileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading contract {ContractId}", id);
                return StatusCode(500, new { message = "An error occurred while downloading the contract" });
            }
        }
    }
}