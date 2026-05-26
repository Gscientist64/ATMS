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
    public class PipService : IPipService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PipService> _logger;
        private readonly INotificationService _notificationService;

        public PipService(ApplicationDbContext context, ILogger<PipService> logger, INotificationService notificationService)
        {
            _context = context;
            _logger = logger;
            _notificationService = notificationService;
        }

        public async Task<PipDto> InitiatePipAsync(int initiatedById, CreatePipDto dto)
        {
            try
            {
                _logger.LogInformation($"=== PIP INITIATION DEBUG ===");
                _logger.LogInformation($"initiatedById: {initiatedById}");
                _logger.LogInformation($"dto.EmployeeCode: '{dto.EmployeeCode}'");
                _logger.LogInformation($"dto.UserId: {dto.UserId}");
                _logger.LogInformation($"dto.StartDate: {dto.StartDate}");
                _logger.LogInformation($"dto.EndDate: {dto.EndDate}");
                _logger.LogInformation($"dto.Objective: {dto.Objective}");
                _logger.LogInformation($"==========================");

                // Find user by EmployeeCode or UserId
                User? user = null;
                if (!string.IsNullOrEmpty(dto.EmployeeCode))
                {
                    user = await _context.Users.FirstOrDefaultAsync(u => u.EmployeeCode == dto.EmployeeCode);
                }
                else if (dto.UserId.HasValue)
                {
                    user = await _context.Users.FindAsync(dto.UserId.Value);
                }

                if (user == null) throw new Exception("User not found");

            
                var pip = new PerformanceImprovementPlan
                {
                    UserId = user.Id,   // Use the found user's ID
                    InitiatedById = initiatedById,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    Objective = dto.Objective,
                    ActionPlan = dto.ActionPlan,
                    SuccessCriteria = dto.SuccessCriteria,
                    SupportProvided = dto.SupportProvided,
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };

                _context.PerformanceImprovementPlans.Add(pip);
                await _context.SaveChangesAsync();

                // Update user's contract status
                user.ContractStatus = "On PIP";
                await _context.SaveChangesAsync();

                await _notificationService.CreateNotification(new CreateNotificationDto
                {
                    UserId = user.Id,   // Use the found user's ID, not dto.UserId
                    Type = "pip_initiated",
                    Title = "Performance Improvement Plan",
                    Message = $"A PIP has been initiated for you from {pip.StartDate:dd-MM-yyyy} to {pip.EndDate:dd-MM-yyyy}",
                    Data = new { pipId = pip.Id },
                    ActionUrl = $"/programs/pip-management/{pip.Id}",
                    Priority = "High"
                });

                return await MapToDto(pip);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initiating PIP");
                throw;
            }
        }

        public async Task<PipDto> GetPipByIdAsync(int pipId)
        {
            var pip = await _context.PerformanceImprovementPlans
                .Include(p => p.User)
                .Include(p => p.InitiatedBy)
                .Include(p => p.Reviews)
                    .ThenInclude(r => r.Reviewer)
                .FirstOrDefaultAsync(p => p.Id == pipId);

            if (pip == null) return null;
            return await MapToDto(pip);
        }

        public async Task<List<PipDto>> GetPipsForUserAsync(int userId)
        {
            var pips = await _context.PerformanceImprovementPlans
                .Include(p => p.User)
                .Include(p => p.InitiatedBy)
                .Include(p => p.Reviews)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            var dtos = new List<PipDto>();
            foreach (var pip in pips)
                dtos.Add(await MapToDto(pip));
            return dtos;
        }

        public async Task<List<PipDto>> GetAllActivePipsAsync()
        {
            var pips = await _context.PerformanceImprovementPlans
                .Include(p => p.User)
                .Include(p => p.InitiatedBy)
                .Include(p => p.Reviews)
                .Where(p => p.Status == "Active")
                .OrderByDescending(p => p.StartDate)
                .ToListAsync();

            var dtos = new List<PipDto>();
            foreach (var pip in pips)
                dtos.Add(await MapToDto(pip));
            return dtos;
        }

        public async Task<PipDto> UpdatePipAsync(int pipId, UpdatePipDto dto)
        {
            var pip = await _context.PerformanceImprovementPlans
                .FirstOrDefaultAsync(p => p.Id == pipId);
            if (pip == null) throw new Exception("PIP not found");

            if (dto.StartDate.HasValue) pip.StartDate = dto.StartDate.Value;
            if (dto.EndDate.HasValue) pip.EndDate = dto.EndDate.Value;
            if (dto.Objective != null) pip.Objective = dto.Objective;
            if (dto.ActionPlan != null) pip.ActionPlan = dto.ActionPlan;
            if (dto.SuccessCriteria != null) pip.SuccessCriteria = dto.SuccessCriteria;
            if (dto.SupportProvided != null) pip.SupportProvided = dto.SupportProvided;
            if (dto.Status != null) pip.Status = dto.Status;

            pip.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await MapToDto(pip);
        }

        public async Task<PipDto> AddReviewAsync(int pipId, int reviewerId, AddPipReviewDto dto)
        {
            var pip = await _context.PerformanceImprovementPlans.FindAsync(pipId);
            if (pip == null) throw new Exception("PIP not found");

            var review = new PipReview
            {
                PipId = pipId,
                ReviewerId = reviewerId,
                ReviewDate = DateTime.UtcNow,
                Comments = dto.Comments,
                Rating = dto.Rating
            };

            _context.PipReviews.Add(review);
            await _context.SaveChangesAsync();

            var reviewer = await _context.Users.FindAsync(reviewerId);
            await _notificationService.CreateNotification(new CreateNotificationDto
            {
                UserId = pip.UserId,
                Type = "pip_review",
                Title = "PIP Review Added",
                Message = $"{reviewer?.FullName} added a review to your PIP.",
                Data = new { pipId, reviewId = review.Id },
                ActionUrl = $"/programs/pip-management/{pipId}",
                Priority = "Medium"
            });

            return await GetPipByIdAsync(pipId);
        }

        public async Task<PipDto> EndPipAsync(int pipId, EndPipDto dto)
        {
            var pip = await _context.PerformanceImprovementPlans.FindAsync(pipId);
            if (pip == null) throw new Exception("PIP not found");

            pip.Status = "Completed";
            pip.CompletedAt = DateTime.UtcNow;
            pip.CompletionOutcome = dto.Outcome;
            pip.UpdatedAt = DateTime.UtcNow;

            if (dto.Outcome == "Success")
            {
                var user = await _context.Users.FindAsync(pip.UserId);
                if (user != null && user.ContractStatus == "On PIP")
                {
                    user.ContractStatus = "Active";
                    await _context.SaveChangesAsync();
                }
            }

            await _context.SaveChangesAsync();

            await _notificationService.CreateNotification(new CreateNotificationDto
            {
                UserId = pip.UserId,
                Type = "pip_ended",
                Title = "PIP Completed",
                Message = $"Your Performance Improvement Plan has been completed with outcome: {dto.Outcome}",
                Data = new { pipId },
                ActionUrl = $"/programs/pip-management/{pipId}",
                Priority = "Medium"
            });

            return await MapToDto(pip);
        }

        private async Task<PipDto> MapToDto(PerformanceImprovementPlan pip)
        {
            var user = await _context.Users.FindAsync(pip.UserId);
            var duration = (pip.EndDate - pip.StartDate).Days;
            return new PipDto
            {
                Id = pip.Id,
                UserId = pip.UserId,
                UserFullName = user?.FullName ?? "",
                UserEmployeeCode = user?.EmployeeCode ?? "",
                UserDesignation = user?.Designation ?? "",
                StartDate = pip.StartDate,
                EndDate = pip.EndDate,
                Duration = $"{duration} Days",
                Objective = pip.Objective,
                ActionPlan = pip.ActionPlan,
                Status = pip.Status,
                CompletedAt = pip.CompletedAt,
                CompletionOutcome = pip.CompletionOutcome,
                Reviews = pip.Reviews?.Select(r => new PipReviewDto
                {
                    Id = r.Id,
                    ReviewerName = r.Reviewer?.FullName ?? "",
                    ReviewerRole = r.Reviewer?.Role?.Name ?? "",
                    ReviewDate = r.ReviewDate,
                    Comments = r.Comments,
                    Rating = r.Rating
                }).ToList() ?? new()
            };
        }
    }
}