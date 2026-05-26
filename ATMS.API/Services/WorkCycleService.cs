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
    public class WorkCycleService : IWorkCycleService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<WorkCycleService> _logger;
        private readonly INotificationService _notificationService;

        public WorkCycleService(
            ApplicationDbContext context,
            ILogger<WorkCycleService> logger,
            INotificationService notificationService)
        {
            _context = context;
            _logger = logger;
            _notificationService = notificationService;
        }

        public async Task<WorkCycleDto> CreateWorkCycleAsync(int userId, CreateWorkCycleDto dto)
        {
            try
            {
                var now = DateTime.UtcNow;
                var currentMonth = now.Month;
                var currentYear = now.Year;
                
                // Calculate start and end dates based on the month
                var startDate = GetDateForDayInMonth(dto.StartDay, currentMonth, currentYear);
                var endDate = GetDateForDayInMonth(dto.EndDay, currentMonth, currentYear);
                
                // If end date is before start date, assume it's the next month
                if (endDate < startDate)
                {
                    endDate = endDate.AddMonths(1);
                }
                
                // Set end date to end of day (23:59:59) in UTC
                endDate = endDate.Date.AddDays(1).AddSeconds(-1);
                
                // Ensure both dates are UTC
                startDate = DateTime.SpecifyKind(startDate.Date, DateTimeKind.Utc);
                endDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);
                
                // Deactivate any existing active cycle of the same type for this audience
                var existingCycles = await _context.WorkCycles
                    .Where(w => w.CycleType == dto.CycleType && w.Audience == dto.Audience && w.IsActive)
                    .ToListAsync();
                
                foreach (var existing in existingCycles)
                {
                    existing.IsActive = false;
                    existing.UpdatedAt = DateTime.UtcNow;
                }
                
                var workCycle = new WorkCycle
                {
                    CycleType = dto.CycleType,
                    Month = currentMonth,
                    Year = currentYear,
                    StartDate = startDate,
                    EndDate = endDate,
                    StartDay = dto.StartDay,
                    EndDay = dto.EndDay,
                    Repeat = dto.Repeat,
                    Audience = dto.Audience,
                    CreateAnnouncement = dto.CreateAnnouncement,
                    IsActive = true,
                    CreatedById = userId,
                    CreatedAt = DateTime.UtcNow
                };
                
                _context.WorkCycles.Add(workCycle);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Work cycle created: {dto.CycleType} cycle from {startDate:dd-MM-yyyy} to {endDate:dd-MM-yyyy}");
                
                return await MapToDto(workCycle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating work cycle");
                throw;
            }
        }

        public async Task<WorkCycleDto> UpdateWorkCycleAsync(int id, CreateWorkCycleDto dto)
        {
            try
            {
                var workCycle = await _context.WorkCycles.FindAsync(id);
                if (workCycle == null)
                {
                    throw new Exception("Work cycle not found");
                }
                
                var now = DateTime.UtcNow;
                var currentMonth = now.Month;
                var currentYear = now.Year;
                
                // Recalculate dates
                var startDate = GetDateForDayInMonth(dto.StartDay, currentMonth, currentYear);
                var endDate = GetDateForDayInMonth(dto.EndDay, currentMonth, currentYear);
                
                if (endDate < startDate)
                {
                    endDate = endDate.AddMonths(1);
                }
                
                workCycle.CycleType = dto.CycleType;
                workCycle.StartDate = startDate;
                workCycle.EndDate = endDate;
                workCycle.StartDay = dto.StartDay;
                workCycle.EndDay = dto.EndDay;
                workCycle.Repeat = dto.Repeat;
                workCycle.Audience = dto.Audience;
                workCycle.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Work cycle {id} updated");
                
                return await MapToDto(workCycle);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating work cycle {WorkCycleId}", id);
                throw;
            }
        }

        public async Task<bool> DeactivateWorkCycleAsync(int id)
        {
            try
            {
                var workCycle = await _context.WorkCycles.FindAsync(id);
                if (workCycle == null)
                {
                    return false;
                }
                
                workCycle.IsActive = false;
                workCycle.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Work cycle {id} deactivated");
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating work cycle {WorkCycleId}", id);
                return false;
            }
        }

        public async Task<List<WorkCycleDto>> GetActiveWorkCyclesAsync()
        {
            try
            {
                var now = DateTime.UtcNow;
                var currentMonth = now.Month;
                var currentYear = now.Year;
                
                var workCycles = await _context.WorkCycles
                    .Where(w => w.IsActive)
                    .OrderByDescending(w => w.CreatedAt)
                    .ToListAsync();
                
                var result = new List<WorkCycleDto>();
                
                foreach (var cycle in workCycles)
                {
                    // For recurring cycles, check if we need to update the dates
                    if (cycle.Repeat == "every-month" && (cycle.Month != currentMonth || cycle.Year != currentYear))
                    {
                        // Update the dates for the new month
                        var startDate = GetDateForDayInMonth(cycle.StartDay ?? "monday", currentMonth, currentYear);
                        var endDate = GetDateForDayInMonth(cycle.EndDay ?? "friday", currentMonth, currentYear);
                        
                        if (endDate < startDate)
                        {
                            endDate = endDate.AddMonths(1);
                        }
                        
                        cycle.StartDate = startDate;
                        cycle.EndDate = endDate;
                        cycle.Month = currentMonth;
                        cycle.Year = currentYear;
                        
                        _context.WorkCycles.Update(cycle);
                        await _context.SaveChangesAsync();
                    }
                    
                    result.Add(await MapToDto(cycle));
                }
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active work cycles");
                return new List<WorkCycleDto>();
            }
        }

        public async Task SendRemindersForActiveCyclesAsync()
        {
            try
            {
                var now = DateTime.UtcNow;
                var activeCycles = await _context.WorkCycles
                    .Where(w => w.IsActive)
                    .ToListAsync();
                
                foreach (var cycle in activeCycles)
                {
                    // Check if reminder should be sent
                    var daysUntilEnd = (cycle.EndDate - now).Days;
                    
                    if (daysUntilEnd == 1 || daysUntilEnd == 3 || daysUntilEnd == 0)
                    {
                        // Get users based on audience
                        var userIds = await GetUserIdsByAudience(cycle.Audience);
                        
                        foreach (var userId in userIds)
                        {
                            await _notificationService.CreateNotification(new CreateNotificationDto
                            {
                                UserId = userId,
                                Type = "workcycle",
                                Title = $"{cycle.CycleType} Cycle Reminder",
                                Message = $"The {cycle.CycleType} cycle ends on {cycle.EndDate:dd-MM-yyyy}. Please ensure all tasks are completed.",
                                Priority = "Medium"
                            });
                        }
                        
                        _logger.LogInformation($"Reminders sent for {cycle.CycleType} cycle to {userIds.Count} users");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending work cycle reminders");
            }
        }

        #region Private Methods

        private DateTime GetDateForDayInMonth(string dayName, int month, int year)
        {
            var dayOfWeek = dayName?.ToLower() switch
            {
                "monday" => DayOfWeek.Monday,
                "tuesday" => DayOfWeek.Tuesday,
                "wednesday" => DayOfWeek.Wednesday,
                "thursday" => DayOfWeek.Thursday,
                "friday" => DayOfWeek.Friday,
                "saturday" => DayOfWeek.Saturday,
                "sunday" => DayOfWeek.Sunday,
                _ => DayOfWeek.Monday
            };
            
            var date = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            while (date.DayOfWeek != dayOfWeek)
            {
                date = date.AddDays(1);
            }
            
            return date;
        }

        private async Task<List<int>> GetUserIdsByAudience(string? audience)
        {
            var query = _context.Users.AsQueryable();
            
            switch (audience?.ToLower())
            {
                case "auxilary-staff":
                    query = query.Where(u => u.Role.Name == "AdHoc");
                    break;
                case "all-staff":
                    // No filter - all users
                    break;
                case "ace-5-staff":
                    query = query.Where(u => u.Project == "ACE-5");
                    break;
                case "speed-staff":
                    query = query.Where(u => u.Project == "SPEED");
                    break;
                case "gf-staff":
                    query = query.Where(u => u.Project == "Global Fund");
                    break;
                default:
                    query = query.Where(u => u.Role.Name == "AdHoc");
                    break;
            }
            
            return await query.Select(u => u.Id).ToListAsync();
        }

        private async Task<WorkCycleDto> MapToDto(WorkCycle cycle)
        {
            var createdBy = cycle.CreatedById.HasValue 
                ? await _context.Users.FindAsync(cycle.CreatedById.Value) 
                : null;
            
            return new WorkCycleDto
            {
                Id = cycle.Id,
                CycleType = cycle.CycleType,
                Month = cycle.Month,
                Year = cycle.Year,
                StartDate = cycle.StartDate,
                EndDate = cycle.EndDate,
                StartDay = cycle.StartDay,
                EndDay = cycle.EndDay,
                Repeat = cycle.Repeat,
                Audience = cycle.Audience,
                IsActive = cycle.IsActive,
                CreatedAt = cycle.CreatedAt,
                CreatedBy = createdBy?.FullName ?? "System"
            };
        }

        #endregion
    }
}