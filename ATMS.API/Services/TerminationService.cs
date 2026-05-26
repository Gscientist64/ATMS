using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ATMS.API.Data;
using ATMS.API.DTOs;
using ATMS.API.Models;

namespace ATMS.API.Services
{
    public class TerminationService : ITerminationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TerminationService> _logger;
        private readonly INotificationService _notificationService;

        public TerminationService(ApplicationDbContext context, ILogger<TerminationService> logger, INotificationService notificationService)
        {
            _context = context;
            _logger = logger;
            _notificationService = notificationService;
        }

        public async Task<TerminationDto> TerminateEmployeeAsync(int terminatedById, CreateTerminationDto dto)
        {
            try
            {
                // Find user by PublicId instead of UserId
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.PublicId == dto.StaffPublicId);
                    
                if (user == null) 
                {
                    _logger.LogError($"User not found with PublicId: {dto.StaffPublicId}");
                    throw new Exception("User not found");
                }

                var termination = new TerminationRecord
                {
                    UserId = user.Id,
                    TerminatedById = terminatedById,
                    EffectiveDate = dto.EffectiveDate,
                    Reason = dto.Reason,
                    AdditionalNotes = dto.AdditionalNotes,
                    EquipmentReturned = dto.EquipmentReturned,
                    HandoverDocumentsSubmitted = dto.HandoverDocumentsSubmitted,
                    ExitInterviewCompleted = dto.ExitInterviewCompleted,
                    SystemAccessRevoked = dto.SystemAccessRevoked,
                    SeveranceProcessed = dto.SeveranceProcessed,
                    ChecklistNotApplicable = dto.ChecklistNotApplicable,
                    CreatedAt = DateTime.UtcNow
                };

                _context.TerminationRecords.Add(termination);

                user.IsActive = false;
                user.ContractStatus = "Terminated";
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                await _notificationService.CreateNotification(new CreateNotificationDto
                {
                    UserId = user.Id,
                    Type = "termination",
                    Title = "Employment Termination",
                    Message = $"Your employment has been terminated effective {dto.EffectiveDate:dd-MM-yyyy}. Reason: {dto.Reason}",
                    Priority = "High"
                });

                return MapToDto(termination, user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error terminating employee with PublicId {StaffPublicId}", dto.StaffPublicId);
                throw;
            }
        }

        public async Task<TerminationDto> GetTerminationByUserIdAsync(int userId)
        {
            var termination = await _context.TerminationRecords
                .Include(t => t.User)
                .Include(t => t.TerminatedBy)
                .FirstOrDefaultAsync(t => t.UserId == userId);

            if (termination == null) return null;
            return MapToDto(termination, termination.User);
        }

        public async Task<List<TerminationDto>> GetAllTerminationsAsync()
        {
            var terminations = await _context.TerminationRecords
                .Include(t => t.User)
                .Include(t => t.TerminatedBy)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return terminations.Select(t => MapToDto(t, t.User)).ToList();
        }

        private TerminationDto MapToDto(TerminationRecord record, User user)
        {
            return new TerminationDto
            {
                Id = record.Id,
                UserId = record.UserId,
                UserFullName = user?.FullName ?? "",
                UserEmployeeCode = user?.EmployeeCode ?? "",
                EffectiveDate = record.EffectiveDate,
                Reason = record.Reason,
                AdditionalNotes = record.AdditionalNotes,
                EquipmentReturned = record.EquipmentReturned,
                HandoverDocumentsSubmitted = record.HandoverDocumentsSubmitted,
                ExitInterviewCompleted = record.ExitInterviewCompleted,
                SystemAccessRevoked = record.SystemAccessRevoked,
                SeveranceProcessed = record.SeveranceProcessed,
                CreatedAt = record.CreatedAt,
                TerminatedByName = record.TerminatedBy?.FullName ?? ""
            };
        }
    }
}