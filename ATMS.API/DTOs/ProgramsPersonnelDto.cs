using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class ProgramsPersonnelListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public string StaffId { get; set; } = string.Empty;
        public string ContractStatus { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public int FlagsCount { get; set; }
        public string FlagsDisplay { get; set; } = string.Empty;
    }

    public class ProgramsStaffDetailDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string AvatarInitials { get; set; } = string.Empty;
        public string ContractStatus { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string? ProfileImageUrl { get; set; }
        public string Designation { get; set; } = string.Empty;
        public string GonSupervisorName { get; set; } = string.Empty;
        public string EcewsSupervisorName { get; set; } = string.Empty;
        
        // Contact Information
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string EmergencyContactName { get; set; } = string.Empty;
        public string EmergencyContactPhone { get; set; } = string.Empty;
        
        // Banking Details
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        
        // Contract Details
        public string Facility { get; set; } = string.Empty;
        public string LGA { get; set; } = string.Empty;
        public string EmployeeCode { get; set; } = string.Empty;
        public string Project { get; set; } = string.Empty;
        
        // Timesheets
        public List<TimesheetListDto> Timesheets { get; set; } = new();
        
        // Concerns
        public List<ProgramsConcernDto> Concerns { get; set; } = new();
    }

    public class ProgramsConcernDto
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

    public class ProgramsChangeLocationDto
    {
        public string State { get; set; } = string.Empty;
        public string FacilityName { get; set; } = string.Empty;
        public string LGA { get; set; } = string.Empty;
    }

    public class ProgramsManageSupervisorsDto
    {
        public int? GonSupervisorId { get; set; }
        public int? EcewsSupervisorId { get; set; }
    }
}