using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class SuperviseeListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public string StaffId { get; set; } = string.Empty;
        public string ContractStatus { get; set; } = string.Empty;
        public string ContractStatusClass { get; set; } = string.Empty;
        public int FlagsCount { get; set; }
        public string FlagsDisplay { get; set; } = string.Empty;
        public bool HasFlags { get; set; }
    }
    
    public class SuperviseeDetailDto : UserDto
    {
        public List<ConcernDto> Concerns { get; set; } = new();
        public List<AdvisoryDto> Advisories { get; set; } = new();
        public List<TimesheetListDto> RecentTimesheets { get; set; } = new();
        public ContractRecommendationDto? ActiveRecommendation { get; set; }
    }
    
    public class ContractRecommendationDto
    {
        public int Id { get; set; }
        public string RecommendationType { get; set; } = string.Empty;
        public string? Reason { get; set; }
        public string RecommendedBy { get; set; } = string.Empty;
        public string RecommendedAt { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}