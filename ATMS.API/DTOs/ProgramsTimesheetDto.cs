using System;
using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class ProgramsTimesheetReviewDto
    {
        public int Id { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public string StaffState { get; set; } = string.Empty;
        public string SubmissionDate { get; set; } = string.Empty;
        public string TimesheetStatus { get; set; } = string.Empty;
        public string ContractStatus { get; set; } = string.Empty;
        public string Tab { get; set; } = string.Empty;
    }

    public class ProgramsTimesheetDetailDto
    {
        public int Id { get; set; }
        public string MonthYear { get; set; } = string.Empty;
        public string StaffName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string GonSupervisorName { get; set; } = string.Empty;
        public string EcewsSupervisorName { get; set; } = string.Empty;
        public bool GonApproved { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool GonFlagged { get; set; }
        public bool EcewsApproved { get; set; }
        
        // Timesheet Entries
        public List<ProgramsTimesheetEntryDto> Entries { get; set; } = new();
        public double TotalHours { get; set; }
        public string SummaryInfo { get; set; } = string.Empty;
        
        // Comments
        public List<ProgramsCommentDto> Comments { get; set; } = new();
        
        // Concerns
        public List<ProgramsConcernDto> Concerns { get; set; } = new();
    }

    public class ProgramsTimesheetEntryDto
    {
        public string Date { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public string TotalHours { get; set; } = string.Empty;
        public string WorkDone { get; set; } = string.Empty;
    }

    public class ProgramsCommentDto
    {
        public int Id { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string AuthorRole { get; set; } = string.Empty;
        public string AuthorAvatar { get; set; } = string.Empty;
        public string CommentText { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }

    public class ProgramsApproveTimesheetDto
    {
        public string? Comments { get; set; }
        public string? ContractRecommendation { get; set; }
        public string? Reason { get; set; }
    }

    public class ProgramsDeclineTimesheetDto
    {
        public string Feedback { get; set; } = string.Empty;
    }
}