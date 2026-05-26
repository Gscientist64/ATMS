using System;

namespace ATMS.API.DTOs
{
    public class RenewContractDto
    {
        public string UserPublicId { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty; // 1m, 3m, 6m
        public DateTime StartDate { get; set; }
    }
}