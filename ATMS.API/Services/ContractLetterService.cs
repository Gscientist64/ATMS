using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using ATMS.API.Data;
using ATMS.API.DTOs;
using ATMS.API.Models;

namespace ATMS.API.Services
{
    public class ContractLetterService : IContractLetterService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ContractLetterService> _logger;
        private readonly INotificationService _notificationService;

        public ContractLetterService(
            ApplicationDbContext context,
            IWebHostEnvironment environment,
            ILogger<ContractLetterService> logger,
            INotificationService notificationService)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
            _notificationService = notificationService;
        }

        public async Task<ContractLetterDto> SaveContractLetterAsync(SaveContractLetterDto dto, int generatedByUserId)
        {
            try
            {
                if (dto.File == null || dto.File.Length == 0)
                    throw new Exception("No file uploaded");

                // Delete existing contract letter for this user (replace old one)
                var existingLetter = await _context.ContractLetters
                    .FirstOrDefaultAsync(cl => cl.UserId == dto.UserId);

                if (existingLetter != null)
                {
                    var oldFilePath = Path.Combine(_environment.WebRootPath ?? "wwwroot", existingLetter.FileUrl.TrimStart('/'));
                    if (File.Exists(oldFilePath))
                    {
                        File.Delete(oldFilePath);
                    }
                    _context.ContractLetters.Remove(existingLetter);
                }

                // Save new file
                var uploadsFolder = Path.Combine(_environment.WebRootPath ?? "wwwroot", "contract-letters");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var fileName = $"contract_letter_{dto.UserId}_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }

                var contractLetter = new ContractLetter
                {
                    UserId = dto.UserId,
                    FileName = dto.FileName ?? fileName,
                    FileUrl = $"/contract-letters/{fileName}",
                    FileSize = dto.File.Length,
                    GeneratedAt = DateTime.UtcNow,
                    GeneratedByUserId = generatedByUserId,
                    JobRoleLabel = dto.JobRoleLabel,
                    ProjectLabel = dto.ProjectLabel,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    Location = dto.Location,
                    ReportingLine = dto.ReportingLine,
                    Salary = dto.Salary,
                    ContractDate = dto.ContractDate,
                    IsSigned = false
                };

                _context.ContractLetters.Add(contractLetter);
                await _context.SaveChangesAsync();

                return MapToDto(contractLetter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving contract letter for user {UserId}", dto.UserId);
                throw;
            }
        }

        public async Task<ContractLetterDto> GetLatestContractLetterByUserIdAsync(int userId)
        {
            var letter = await _context.ContractLetters
                .Where(cl => cl.UserId == userId)
                .OrderByDescending(cl => cl.GeneratedAt)
                .FirstOrDefaultAsync();

            if (letter == null) return null;

            return MapToDto(letter);
        }

        public async Task<List<ContractLetterDto>> GetContractLettersByUserIdAsync(int userId)
        {
            var letters = await _context.ContractLetters
                .Where(cl => cl.UserId == userId)
                .OrderByDescending(cl => cl.GeneratedAt)
                .ToListAsync();

            return letters.Select(MapToDto).ToList();
        }

        public async Task<ContractLetterDto?> GetContractLetterByIdAsync(int id, int userId)
        {
            var letter = await _context.ContractLetters
                .Include(cl => cl.User)
                .FirstOrDefaultAsync(cl => cl.Id == id && cl.UserId == userId);

            if (letter == null) return null;

            return MapToDto(letter);
        }

        public async Task<ContractLetterDto> MarkContractLetterSignedAsync(int id, int userId, IFormFile signedFile)
        {
            if (signedFile == null || signedFile.Length == 0)
                throw new Exception("No file uploaded");

            var letter = await _context.ContractLetters
                .Include(cl => cl.User)
                .FirstOrDefaultAsync(cl => cl.Id == id && cl.UserId == userId);

            if (letter == null)
                throw new Exception("Contract letter not found");

            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? "wwwroot", "contract-letters");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var oldFilePath = Path.Combine(_environment.WebRootPath ?? "wwwroot", letter.FileUrl.TrimStart('/'));
            if (File.Exists(oldFilePath))
            {
                File.Delete(oldFilePath);
            }

            var fileName = $"contract_letter_{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}_signed.pdf";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await signedFile.CopyToAsync(stream);
            }

            letter.FileName = $"Signed_{letter.FileName}";
            letter.FileUrl = $"/contract-letters/{fileName}";
            letter.FileSize = signedFile.Length;
            letter.IsSigned = true;
            letter.SignedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _notificationService.CreateContractLetterSignedNotification(
                letter.Id, letter.GeneratedByUserId, letter.User?.FullName ?? "A staff member");

            return MapToDto(letter);
        }

        private static ContractLetterDto MapToDto(ContractLetter letter)
        {
            return new ContractLetterDto
            {
                Id = letter.Id,
                FileName = letter.FileName,
                FileUrl = letter.FileUrl,
                FileSize = letter.FileSize,
                GeneratedAt = letter.GeneratedAt,
                GeneratedByUserId = letter.GeneratedByUserId,
                JobRoleLabel = letter.JobRoleLabel,
                ProjectLabel = letter.ProjectLabel,
                StartDate = letter.StartDate,
                EndDate = letter.EndDate,
                Location = letter.Location,
                ReportingLine = letter.ReportingLine,
                Salary = letter.Salary,
                ContractDate = letter.ContractDate,
                IsSigned = letter.IsSigned,
                SignedAt = letter.SignedAt,
                StaffName = letter.User?.FullName,
                StaffSignatureUrl = letter.User?.DigitalSignatureUrl,
            };
        }
    }
}
