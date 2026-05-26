using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class HrisDashboardDto
    {
        public int TotalWorkforce { get; set; }
        public int ActiveEmployees { get; set; }
        public int OnLeave { get; set; }
        public int ActivePips { get; set; }
        public WorkforceDistributionDto EcewsDistribution { get; set; } = new();
        public AncillaryDistributionDto AncillaryDistribution { get; set; } = new();
        public TimesheetComplianceDto TimesheetCompliance { get; set; } = new();
        public GenderDiversityDto GenderDiversity { get; set; } = new();
        public EmploymentStatusDto EmploymentStatus { get; set; } = new();
        public LeaveDistributionDto LeaveDistribution { get; set; } = new();
        public AppraisalActivityDto AppraisalActivity { get; set; } = new();
    }

    public class WorkforceDistributionDto
    {
        public int Total { get; set; }
        public List<CategoryDto> Categories { get; set; } = new();
    }

    public class AncillaryDistributionDto
    {
        public int Total { get; set; }
        public int Active { get; set; }
        public int OnPip { get; set; }
        public int Flagged { get; set; }
        public List<CategoryDto> Categories { get; set; } = new();
    }

    public class CategoryDto
    {
        public string Label { get; set; } = string.Empty;
        public int Value { get; set; }
        public string Icon { get; set; } = string.Empty;
    }

    public class TimesheetComplianceDto
    {
        public List<int> MonthlyData { get; set; } = new();
    }

    public class GenderDiversityDto
    {
        public int Male { get; set; }
        public int Female { get; set; }
        public int MalePercentage { get; set; }
        public int FemalePercentage { get; set; }
    }

    public class EmploymentStatusDto
    {
        public int Confirmed { get; set; }
        public int Probation { get; set; }
    }

    public class LeaveDistributionDto
    {
        public int Applied { get; set; }
        public int Approved { get; set; }
        public List<LeaveTypeDto> LeaveTypes { get; set; } = new();
    }

    public class LeaveTypeDto
    {
        public string Type { get; set; } = string.Empty;
        public int Count { get; set; }
        public int Percentage { get; set; }
    }

    public class AppraisalActivityDto
    {
        public int GoalSettingCompleted { get; set; }
        public int GoalSettingPending { get; set; }
        public int AnnualAppraisalCompleted { get; set; }
        public int AnnualAppraisalPending { get; set; }
    }
}