using System;

namespace ATMS.API.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? ProfileImageUrl { get; set; }
        
        // Employment
        public string? Designation { get; set; }
        public string? Department { get; set; }
        public string? Project { get; set; }
        
        // Location
        public string? State { get; set; }
        public string? LGA { get; set; }
        public string? HealthFacility { get; set; }
        
        // Banking
        public string? BankName { get; set; }
        public string? AccountNumber { get; set; }
        public string? AccountName { get; set; }
        
        // Government IDs
        public string? NINName { get; set; }
        public string? NINNumber { get; set; }
        public string? TINName { get; set; }
        public string? TINNumber { get; set; }
        
        // Emergency Contact
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        
        // Contract
        public string? ContractStatus { get; set; }
        public DateTime? ContractStartDate { get; set; }
        public DateTime? ContractEndDate { get; set; }
        
        // Signature
        public string? DigitalSignatureUrl { get; set; }
        public bool HasSignature => !string.IsNullOrEmpty(DigitalSignatureUrl);
        
        // Role and Supervisors
        public string Role { get; set; } = string.Empty;
        public int? EcewsSupervisorId { get; set; }
        public string? EcewsSupervisorName { get; set; }
        public int? GonSupervisorId { get; set; }
        public string? GonSupervisorName { get; set; }
        
        public bool IsActive { get; set; }
    }
    
    public class UpdateProfileDto
    {
        public string? PhoneNumber { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? BankName { get; set; }
        public string? AccountNumber { get; set; }
        public string? AccountName { get; set; }
        public string? NINName { get; set; }
        public string? NINNumber { get; set; }
        public string? TINName { get; set; }
        public string? TINNumber { get; set; }
    }
    
    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
    
    public class UploadSignatureDto
    {
        public string SignatureImageBase64 { get; set; } = string.Empty;
    }
}