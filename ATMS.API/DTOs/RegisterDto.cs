// ATMS.API/DTOs/RegisterDto.cs

using System.ComponentModel.DataAnnotations;

namespace ATMS.API.DTOs
{
    public class RegisterDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string FullName { get; set; } = string.Empty;
        
        public string? Username { get; set; }
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
        public string? PhoneNumber { get; set; }
        
    //    public string? Gender { get; set; }

        [Required]
        public string Role { get; set; } = string.Empty;
        
        public string? Designation { get; set; }
        public string? Department { get; set; }
        public string? State { get; set; }
        public string? LGA { get; set; }
        public string? HealthFacility { get; set; }
        public string? Project { get; set; }
        
        public string? BankName { get; set; }
        public string? AccountNumber { get; set; }
        public string? AccountName { get; set; }
        
        public string? NINName { get; set; }
        public string? NINNumber { get; set; }
        public string? TINName { get; set; }
        public string? TINNumber { get; set; }
        
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        
        public int? EcewsSupervisorId { get; set; }
        public int? GonSupervisorId { get; set; }
        public string? EmployeeCode { get; set; }
        public string? ContractStatus { get; set; }
        public string? RoleName { get; set; }   // frontend sends "roleName"
    }
}