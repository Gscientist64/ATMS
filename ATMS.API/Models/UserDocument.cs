using System;

namespace ATMS.API.Models
{
    public class UserDocument
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}