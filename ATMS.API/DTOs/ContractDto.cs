using System;

namespace ATMS.API.DTOs
{
    public class ContractDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Period { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StatusClass { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime? SignedAt { get; set; }
    }
    
    public class SignContractDto
    {
        public int ContractId { get; set; }
        public string SignatureImageBase64 { get; set; } = string.Empty;
    }
}