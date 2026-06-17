using System;

namespace ATMS.API.DTOs
{
    public class GovernanceActionDto
    {
        public int Id { get; set; }
        public string Category { get; set; } = string.Empty;
        public string StaffName { get; set; } = string.Empty;
        public string StaffRole { get; set; } = string.Empty;
        public string RaisedBy { get; set; } = string.Empty;
        public DateTime DateRaised { get; set; }
        public string Justification { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string PublicId { get; set; } = string.Empty;
        public string EmployeeCode { get; set; } = string.Empty;
        public string StaffEmail { get; set; } = string.Empty;
    }
}
