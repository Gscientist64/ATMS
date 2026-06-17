using System;

namespace ATMS.API.DTOs
{
    public class ContractLetterDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime GeneratedAt { get; set; }
        public int? GeneratedByUserId { get; set; }
        public string? GeneratedByUserName { get; set; }

        public string? JobRoleLabel { get; set; }
        public string? ProjectLabel { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Location { get; set; }
        public string? ReportingLine { get; set; }
        public string? Salary { get; set; }
        public DateTime? ContractDate { get; set; }

        public bool IsSigned { get; set; }
        public DateTime? SignedAt { get; set; }

        public string? StaffName { get; set; }
        public string? StaffSignatureUrl { get; set; }
    }
}
