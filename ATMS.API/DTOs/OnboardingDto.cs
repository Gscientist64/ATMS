using System;

namespace ATMS.API.DTOs
{
    public class OnboardingStatusDto
    {
        public int Id { get; set; }
        public string Status { get; set; } = string.Empty;
        public int CurrentStep { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? Comments { get; set; }
    }
    
    public class SaveOnboardingStepDto
    {
        public int Step { get; set; }
        public string? PersonalInfo { get; set; }
        public string? EducationInfo { get; set; }
        public string? WorkExperience { get; set; }
        public string? NextOfKinInfo { get; set; }
        public string? BankPensionInfo { get; set; }
        public string? NinTinInfo { get; set; }
        public string? DependentsInfo { get; set; }
    }
    
    public class SubmitOnboardingDto
    {
        public string? PersonalInfo { get; set; }
        public string? EducationInfo { get; set; }
        public string? WorkExperience { get; set; }
        public string? NextOfKinInfo { get; set; }
        public string? BankPensionInfo { get; set; }
        public string? NinTinInfo { get; set; }
        public string? DependentsInfo { get; set; }
        public string? Comments { get; set; }
    }
}
