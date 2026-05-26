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
    }
}