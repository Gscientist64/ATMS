using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ATMS.API.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        public string EmployeeCode { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string FullName { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        public string? PhoneNumber { get; set; }
        public string? ProfileImageUrl { get; set; }
        
        // Employment Details
        public string? Designation { get; set; }
        public string? Department { get; set; }
        public string? Project { get; set; }
        
        // Location
        public string? State { get; set; }
        public string? LGA { get; set; }
        public string? HealthFacility { get; set; }
        
        // Banking Details
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
        
        // Contract Status
        public string? ContractStatus { get; set; }
        public DateTime? ContractStartDate { get; set; }
        public DateTime? ContractEndDate { get; set; }
        
        // Digital Signature
        public string? DigitalSignatureUrl { get; set; }
        public DateTime? SignatureProvidedAt { get; set; }
        
        // Security Fields
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public int FailedLoginAttempts { get; set; }
        public DateTime? LockoutEnd { get; set; }
        
        // Audit Fields
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        
        // Foreign Keys
        public int RoleId { get; set; }
        public int? EcewsSupervisorId { get; set; }
        public int? GonSupervisorId { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        public Role? Role { get; set; }
        public User? EcewsSupervisor { get; set; }
        public User? GonSupervisor { get; set; }
        
        public ICollection<Timesheet> Timesheets { get; set; } = new List<Timesheet>();
        public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<User> EcewsSupervisees { get; set; } = new List<User>();
        public ICollection<User> GonSupervisees { get; set; } = new List<User>();
        public ICollection<Approval> Approvals { get; set; } = new List<Approval>();
    }
}