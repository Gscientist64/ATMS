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

        // Structured letter content, persisted so the letter can be re-rendered
        // client-side (with the staff signature embedded) when the staff signs it.
        public string? JobRoleLabel { get; set; }
        public string? ProjectLabel { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Location { get; set; }
        public string? ReportingLine { get; set; }
        public string? Salary { get; set; }
        public DateTime? ContractDate { get; set; }

        public bool IsSigned { get; set; } = false;
        public DateTime? SignedAt { get; set; }
    }
}
