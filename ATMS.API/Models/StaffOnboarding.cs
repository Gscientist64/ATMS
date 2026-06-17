using System;

namespace ATMS.API.Models
{
    public class StaffOnboarding
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        
        // Onboarding status
        public string Status { get; set; } = "NotStarted"; // NotStarted, InProgress, Submitted, Approved, Rejected
        public int CurrentStep { get; set; } = 0;
        
        // Personal information (stored as JSON)
        public string? PersonalInfo { get; set; }
        public string? EducationInfo { get; set; }
        public string? WorkExperience { get; set; }
        public string? NextOfKinInfo { get; set; }
        public string? BankPensionInfo { get; set; }
        public string? NinTinInfo { get; set; }
        public string? DependentsInfo { get; set; }
        
        public DateTime? SubmittedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public int? ApprovedById { get; set; }
        public User? ApprovedBy { get; set; }
        public string? Comments { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
