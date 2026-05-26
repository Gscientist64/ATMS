using System;

namespace ATMS.API.DTOs
{
    public class GovernanceActionDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string StaffName { get; set; } = string.Empty;
        public string StaffRole { get; set; } = string.Empty;
        public string InitiatedBy { get; set; } = string.Empty;
        public DateTime InitiatedDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Justification { get; set; }
        public int TargetUserId { get; set; }
    }
}