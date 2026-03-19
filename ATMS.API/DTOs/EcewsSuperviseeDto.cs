using System;
using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class EcewsSuperviseeListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public string StaffId { get; set; } = string.Empty;
        public string ContractStatus { get; set; } = string.Empty;
        public string Flags { get; set; } = string.Empty;
        public int FlagCount { get; set; }
    }

    public class EcewsSuperviseeDetailDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string ContractStatus { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        
        // GON Concerns
        public List<EcewsGonConcernDto> GonConcerns { get; set; } = new();
        
        // Advisories
        public List<EcewsAdvisoryDto> Advisories { get; set; } = new();
    }

    public class EcewsGonConcernDto
    {
        public int Id { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string AuthorRole { get; set; } = string.Empty;
        public string AuthorAvatar { get; set; } = string.Empty;
        public string ConcernText { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }

    public class EcewsAdvisoryDto
    {
        public int Id { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string AuthorRole { get; set; } = string.Empty;
        public string AuthorAvatar { get; set; } = string.Empty;
        public string AdvisoryText { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }

    public class EcewsSendAdvisoryDto
    {
        public string AdvisoryType { get; set; } = string.Empty; // Renewal, PIP, Termination, Other
        public string Justification { get; set; } = string.Empty;
    }
}