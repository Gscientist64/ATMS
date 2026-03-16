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
        public List<TimesheetListDto> ActiveTimesheets { get; set; } = new();
    }
    
    public class GonDashboardDto
    {
        public int PendingTimesheets { get; set; }
        public int ApprovedThisMonth { get; set; }
        public int ReturnedForCorrection { get; set; }
        public int SuperviseesCount { get; set; }
        public List<TimesheetListDto> ActiveTimesheets { get; set; } = new();
    }
}