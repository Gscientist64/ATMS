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
        private readonly IAnnouncementService _announcementService;

        public WorkCycleService(
            ApplicationDbContext context,
            ILogger<WorkCycleService> logger,
            INotificationService notificationService,
            IAnnouncementService announcementService)
        {
            _context = context;
            _logger = logger;
            _notificationService = notificationService;
            _announcementService = announcementService;
        }

        public async Task<WorkCycleDto> CreateWorkCycleAsync(int userId, CreateWorkCycleDto dto)
        {
            try
            {
                var now = DateTime.UtcNow;
                var currentMonth = now.Month;
                var currentYear = now.Year;
                
                // Use the dates directly from the DTO (provided by date picker)
                var startDate = dto.StartDate.Kind == DateTimeKind.Utc
                    ? dto.StartDate
                    : DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
                    
                var endDate = dto.EndDate.Kind == DateTimeKind.Utc
                    ? dto.EndDate
                    : DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc);
                
                // Set end date to end of day (23:59:59) in UTC
                endDate = endDate.Date.AddDays(1).AddSeconds(-1);
                
                // Normalize start date to start of day
                startDate = startDate.Date;
                
                // Derive day names from the selected dates (for recurring cycle calculations)
                var startDay = startDate.DayOfWeek.ToString().ToLower();
                var endDay = endDate.DayOfWeek.ToString().ToLower();
                
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
                    Month = startDate.Month,
                    Year = startDate.Year,
                    StartDate = startDate,
                    EndDate = endDate,
                    StartDay = startDay,
                    EndDay = endDay,
                    Repeat = dto.Repeat,
                    Audience = dto.Audience,
                    CreateAnnouncement = dto.CreateAnnouncement,
                    IsActive = true,
                    CreatedById = userId,
                    CreatedAt = DateTime.UtcNow
                };
                
                _context.WorkCycles.Add(workCycle);
                await _context.SaveChangesAsync();
                
                // Automatically create an announcement if requested
                if (dto.CreateAnnouncement)
                {
                    try
                    {
                        var audienceLabel = dto.Audience?.Replace("-", " ").Replace("staff", "Staff") ?? "All Staff";
                        var endDateDisplay = endDate.ToString("MMM dd, yyyy");
                        
                        // Map work cycle audience values to announcement audience values
                        var announcementAudience = (dto.Audience?.ToLower()) switch
                        {
                            "all-staff" or "everyone" => "Everyone",
                            "auxilary-staff" => "Ad-Hoc",
                            "ace-5-staff" or "speed-staff" or "gf-staff" => "Everyone",
                            _ => "Everyone"
                        };
                        
                        await _announcementService.CreateAnnouncementAsync(userId, new CreateAnnouncementDto
                        {
                            Title = $"{dto.CycleType} Cycle Now Open",
                            Message = $"The {dto.CycleType} cycle has been scheduled for {audienceLabel} and will run until {endDateDisplay}. Please ensure all submissions are completed before the deadline.",
                            Priority = "Normal",
                            Audience = announcementAudience,
                            ExpiresAt = endDate.AddDays(1)
                        });
                        
                        _logger.LogInformation($"Announcement created for work cycle {workCycle.Id}");
                    }
                    catch (Exception annEx)
                    {
                        _logger.LogWarning(annEx, "Failed to create announcement for work cycle {WorkCycleId}, but cycle was created", workCycle.Id);
                    }
                }
                
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
                
                // Use the dates directly from the DTO (provided by date picker)
                var startDate = dto.StartDate.Kind == DateTimeKind.Utc
                    ? dto.StartDate
                    : DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
                    
                var endDate = dto.EndDate.Kind == DateTimeKind.Utc
                    ? dto.EndDate
                    : DateTime.SpecifyKind(dto.EndDate, DateTimeKind.Utc);
                
                // Set end date to end of day (23:59:59) in UTC
                endDate = endDate.Date.AddDays(1).AddSeconds(-1);
                
                // Normalize start date to start of day
                startDate = startDate.Date;
                
                // Derive day names from the selected dates (for recurring cycle calculations)
                var startDay = startDate.DayOfWeek.ToString().ToLower();
                var endDay = endDate.DayOfWeek.ToString().ToLower();
                
                workCycle.CycleType = dto.CycleType;
                workCycle.StartDate = startDate;
                workCycle.EndDate = endDate;
                workCycle.StartDay = startDay;
                workCycle.EndDay = endDay;
                workCycle.Month = startDate.Month;
                workCycle.Year = startDate.Year;
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
                        // Calculate month difference to advance the exact dates
                        var monthDiff = (currentYear - cycle.Year) * 12 + (currentMonth - cycle.Month);
                        
                        // Advance the original start/end dates by the month difference
                        // preserving the exact day-of-month
                        var startDate = cycle.StartDate.AddMonths(monthDiff);
                        var endDate = cycle.EndDate.AddMonths(monthDiff);
                        
                        // Ensure both dates are in the current month context
                        var expectedStartDate = new DateTime(currentYear, currentMonth, Math.Min(startDate.Day, DateTime.DaysInMonth(currentYear, currentMonth)), 0, 0, 0, DateTimeKind.Utc);
                        var expectedEndDate = new DateTime(currentYear, currentMonth, Math.Min(endDate.Day, DateTime.DaysInMonth(currentYear, currentMonth)), 23, 59, 59, DateTimeKind.Utc);
                        
                        // If end date day is before start date day, adjust end date to next month
                        if (expectedEndDate < expectedStartDate)
                        {
                            expectedEndDate = expectedEndDate.AddMonths(1);
                        }
                        
                        cycle.StartDate = expectedStartDate;
                        cycle.EndDate = expectedEndDate;
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