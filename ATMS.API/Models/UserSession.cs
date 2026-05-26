using System;

namespace ATMS.API.Models
{
    public class UserSession
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public string Token { get; set; } = string.Empty;
        public string Browser { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime LoginTime { get; set; } = DateTime.UtcNow;
        public DateTime? LastActivityTime { get; set; }
        public DateTime? LogoutTime { get; set; }
        public bool IsActive { get; set; } = true;
    }
}