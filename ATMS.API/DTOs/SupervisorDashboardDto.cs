using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class EcewsDashboardDto
    {
        public int PendingTimesheets { get; set; }
        public int ApprovedThisMonth { get; set; }
        public int PipAdvised { get; set; }
        public int ContractReviewRequired { get; set; }
        public int SuperviseesCount { get; set; }
        public List<EcewsActiveTimesheetDto> ActiveTimesheets { get; set; } = new();
    }

    public class EcewsActiveTimesheetDto
    {
        public int Id { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public string SubmissionDate { get; set; } = string.Empty;
        public string GonSupervisor { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}