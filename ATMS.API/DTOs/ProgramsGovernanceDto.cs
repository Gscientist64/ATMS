using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class ProgramsGovernanceDashboardDto
    {
        public int RenewalAdvisoryCount { get; set; }
        public int PipAdvisoryCount { get; set; }
        public int TerminationAdvisoryCount { get; set; }
        public List<GovernanceAdvisoryDto> Advisories { get; set; } = new();
    }

    public class GovernanceAdvisoryDto
    {
        public int Id { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Contract Renewal, PIP Advisory, Termination Advisory
        public string RaisedBy { get; set; } = string.Empty;
        public string ContractStatus { get; set; } = string.Empty;
        public string Justification { get; set; } = string.Empty;
        public string StaffRole { get; set; } = string.Empty;
        public string SubmittedBy { get; set; } = string.Empty;
        public string DateSubmitted { get; set; } = string.Empty;
    }

    public class GovernanceAdvisoryDetailDto
    {
        public int Id { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public string StaffRole { get; set; } = string.Empty;
        public string AdvisoryTitle { get; set; } = string.Empty;
        public string SubmittedBy { get; set; } = string.Empty;
        public string DateSubmitted { get; set; } = string.Empty;
        public string Justification { get; set; } = string.Empty;
        public string StaffId { get; set; } = string.Empty;
        public string ContractStatus { get; set; } = string.Empty;
    }

    public class GovernanceAdvisoryActionDto
    {
        public string Action { get; set; } = string.Empty; // Approve, Decline
        public string? Comments { get; set; }
        public string? Feedback { get; set; }
    }
}