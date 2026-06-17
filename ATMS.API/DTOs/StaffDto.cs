using System;
using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class StaffProfileDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? EmployeeCode { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Designation { get; set; }
        public string? Department { get; set; }
        public string? Project { get; set; }
        public string? State { get; set; }
        public string? LGA { get; set; }
        public string? HealthFacility { get; set; }
        public string? ContractStatus { get; set; }
        public DateTime? ContractStartDate { get; set; }
        public DateTime? ContractEndDate { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? BankName { get; set; }
        public string? AccountNumber { get; set; }
        public string? AccountName { get; set; }
        public string? NINName { get; set; }
        public string? NINNumber { get; set; }
        public string? TINName { get; set; }
        public string? TINNumber { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? Gender { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public int FailedLoginAttempts { get; set; }
    }
    
    public class StaffTimesheetDto
    {
        public int Id { get; set; }
        public string Month { get; set; } = string.Empty;
        public int Year { get; set; }
        public string PeriodTotal { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? SupervisorStatus { get; set; }
        public string? HrStatus { get; set; }
        public DateTime? SubmittedAt { get; set; }
    }
    
    public class StaffCurrentTimesheetDto
    {
        public string Month { get; set; } = string.Empty;
        public int Year { get; set; }
        public int TotalWorkingDays { get; set; }
        public int TotalHours { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
