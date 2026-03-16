using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ATMS.API.DTOs;
using ATMS.API.Services;

namespace ATMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(
            INotificationService notificationService,
            ILogger<NotificationController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _notificationService.GetUserNotifications(userId, page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notifications");
                return StatusCode(500, new { message = "An error occurred while fetching notifications" });
            }
        }

        [HttpGet("unread")]
        public async Task<IActionResult> GetUnreadNotifications()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _notificationService.GetUnreadNotifications(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread notifications");
                return StatusCode(500, new { message = "An error occurred while fetching notifications" });
            }
        }

        [HttpGet("unread/count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var count = await _notificationService.GetUnreadCount(userId);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting unread count");
                return StatusCode(500, new { message = "An error occurred while fetching unread count" });
            }
        }

        [HttpPost("mark-read")]
        public async Task<IActionResult> MarkAsRead(MarkAsReadDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _notificationService.MarkAsRead(userId, dto);
                
                if (!result)
                    return BadRequest(new { message = "Failed to mark notifications as read" });
                
                return Ok(new { message = "Notifications marked as read" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notifications as read");
                return StatusCode(500, new { message = "An error occurred while updating notifications" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _notificationService.DeleteNotification(userId, id);
                
                if (!result)
                    return NotFound(new { message = "Notification not found" });
                
                return Ok(new { message = "Notification deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification {NotificationId}", id);
                return StatusCode(500, new { message = "An error occurred while deleting notification" });
            }
        }

        [HttpDelete("read/all")]
        public async Task<IActionResult> DeleteAllRead()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var result = await _notificationService.DeleteAllRead(userId);
                
                if (!result)
                    return BadRequest(new { message = "Failed to delete read notifications" });
                
                return Ok(new { message = "Read notifications deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting read notifications");
                return StatusCode(500, new { message = "An error occurred while deleting notifications" });
            }
        }
    }
}