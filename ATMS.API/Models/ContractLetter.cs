using System;

namespace ATMS.API.Models
{
    public class ContractLetter
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        public int GeneratedByUserId { get; set; }
        public User? GeneratedBy { get; set; }
    }
}