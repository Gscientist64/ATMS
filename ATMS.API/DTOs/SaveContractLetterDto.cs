using System;
using Microsoft.AspNetCore.Http;

namespace ATMS.API.DTOs
{
    public class SaveContractLetterDto
    {
        public int UserId { get; set; }
        public required IFormFile File { get; set; }
        public string? FileName { get; set; }

        public string? JobRoleLabel { get; set; }
        public string? ProjectLabel { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Location { get; set; }
        public string? ReportingLine { get; set; }
        public string? Salary { get; set; }
        public DateTime? ContractDate { get; set; }
    }
}
