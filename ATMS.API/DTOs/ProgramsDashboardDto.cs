using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class ProgramsDashboardDto
    {
        public int PendingTimesheets { get; set; }
        public int ApprovedThisMonth { get; set; }
        public int PipRecommended { get; set; }
        public int ContractReviewRequired { get; set; }
        public int SuperviseesCount { get; set; }
        public List<ProgramsActiveTimesheetDto> ActiveTimesheets { get; set; } = new();
    }

    public class ProgramsActiveTimesheetDto
    {
        public int Id { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public string SubmissionDate { get; set; } = string.Empty;
        public string TimesheetStatus { get; set; } = string.Empty;
        public string ContractStatus { get; set; } = string.Empty;
    }
}