using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class EcewsTimesheetReviewDto
    {
        public int Id { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public string SubmissionDate { get; set; } = string.Empty;
        public string GonSupervisor { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StatusType { get; set; } = string.Empty; // 'ecews', 'programs', 'returned'
    }
}