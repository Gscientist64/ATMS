// ATMS.API/Services/AnnouncementService.cs

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
    public class AnnouncementService : IAnnouncementService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AnnouncementService> _logger;
        private readonly INotificationService _notificationService;

        public AnnouncementService(ApplicationDbContext context, ILogger<AnnouncementService> logger, INotificationService notificationService)
        {
            _context = context;
            _logger = logger;
            _notificationService = notificationService;
        }

        public async Task<AnnouncementDto> CreateAnnouncementAsync(int createdById, CreateAnnouncementDto dto)
        {
            try
            {
                var announcement = new Announcement
                {
                    Title = dto.Title,
                    Message = dto.Message,
                    Priority = dto.Priority,
                    Audience = dto.Audience,
                    ExpiresAt = dto.ExpiresAt,
                    CreatedById = createdById,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Announcements.Add(announcement);
                await _context.SaveChangesAsync();

                // Broadcast announcement to target audience
                await BroadcastAnnouncement(announcement);

                return MapToDto(announcement, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating announcement");
                throw;
            }
        }

        private async Task BroadcastAnnouncement(Announcement announcement)
        {
            var targetUserIds = await GetTargetUserIds(announcement.Audience);
            if (!targetUserIds.Any()) return;

            foreach (var userId in targetUserIds)
            {
                await _notificationService.CreateNotification(new CreateNotificationDto
                {
                    UserId = userId,
                    Type = "announcement",
                    Title = announcement.Title,
                    Message = announcement.Message,
                    Data = new { announcementId = announcement.Id, priority = announcement.Priority },
                    ActionUrl = "/announcements",
                    Priority = announcement.Priority == "High" ? "High" : (announcement.Priority == "Normal" ? "Medium" : "Low")
                });
            }

            _logger.LogInformation($"Announcement {announcement.Id} broadcasted to {targetUserIds.Count} users");
        }

        private async Task<List<int>> GetTargetUserIds(string audience)
        {
            var query = _context.Users.AsQueryable();

            // Define audience filters
            switch (audience?.ToLower())
            {
                case "ad-hoc":
                    query = query.Where(u => u.Role.Name == "AdHoc");
                    break;
                case "ecews":
                    query = query.Where(u => u.Role.Name == "EcewsSupervisor");
                    break;
                case "gon":
                    query = query.Where(u => u.Role.Name == "GonSupervisor");
                    break;
                case "programs":
                    query = query.Where(u => u.Role.Name == "Programs");
                    break;
                case "supervisors":
                    query = query.Where(u => u.Role.Name == "EcewsSupervisor" || u.Role.Name == "GonSupervisor");
                    break;
                case "everyone":
                default:
                    // no filter
                    break;
            }

            return await query.Select(u => u.Id).ToListAsync();
        }

        public async Task<List<AnnouncementDto>> GetActiveAnnouncementsAsync()
        {
            var now = DateTime.UtcNow;
            var announcements = await _context.Announcements
                .Include(a => a.CreatedBy)
                .Where(a => a.IsActive && (a.ExpiresAt == null || a.ExpiresAt > now))
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return announcements.Select(a => MapToDto(a, a.CreatedBy)).ToList();
        }

        public async Task<List<AnnouncementDto>> GetAllAnnouncementsAsync()
        {
            var announcements = await _context.Announcements
                .Include(a => a.CreatedBy)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return announcements.Select(a => MapToDto(a, a.CreatedBy)).ToList();
        }

        public async Task<AnnouncementDto> UpdateAnnouncementAsync(int id, CreateAnnouncementDto dto)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null) throw new Exception("Announcement not found");

            announcement.Title = dto.Title;
            announcement.Message = dto.Message;
            announcement.Priority = dto.Priority;
            announcement.Audience = dto.Audience;
            announcement.ExpiresAt = dto.ExpiresAt;
            announcement.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(announcement, null);
        }

        public async Task<bool> DeleteAnnouncementAsync(int id)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null) return false;

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();
            return true;
        }

        private AnnouncementDto MapToDto(Announcement a, User? creator)
        {
            return new AnnouncementDto
            {
                Id = a.Id,
                Title = a.Title,
                Message = a.Message,
                Priority = a.Priority,
                Audience = a.Audience,
                ExpiresAt = a.ExpiresAt,
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                CreatedByName = creator?.FullName ?? ""
            };
        }
    }
}