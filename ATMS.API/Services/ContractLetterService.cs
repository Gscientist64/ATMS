using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
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

        public ContractLetterService(
            ApplicationDbContext context,
            IWebHostEnvironment environment,
            ILogger<ContractLetterService> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
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
                    GeneratedByUserId = generatedByUserId
                };

                _context.ContractLetters.Add(contractLetter);
                await _context.SaveChangesAsync();

                return new ContractLetterDto
                {
                    Id = contractLetter.Id,
                    FileName = contractLetter.FileName,
                    FileUrl = contractLetter.FileUrl,
                    FileSize = contractLetter.FileSize,
                    GeneratedAt = contractLetter.GeneratedAt,
                    GeneratedByUserId = contractLetter.GeneratedByUserId
                };
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

            return new ContractLetterDto
            {
                Id = letter.Id,
                FileName = letter.FileName,
                FileUrl = letter.FileUrl,
                FileSize = letter.FileSize,
                GeneratedAt = letter.GeneratedAt,
                GeneratedByUserId = letter.GeneratedByUserId
            };
        }

        public async Task<List<ContractLetterDto>> GetContractLettersByUserIdAsync(int userId)
        {
            var letters = await _context.ContractLetters
                .Where(cl => cl.UserId == userId)
                .OrderByDescending(cl => cl.GeneratedAt)
                .ToListAsync();

            return letters.Select(letter => new ContractLetterDto
            {
                Id = letter.Id,
                FileName = letter.FileName,
                FileUrl = letter.FileUrl,
                FileSize = letter.FileSize,
                GeneratedAt = letter.GeneratedAt,
                GeneratedByUserId = letter.GeneratedByUserId
            }).ToList();
        }
    }
}