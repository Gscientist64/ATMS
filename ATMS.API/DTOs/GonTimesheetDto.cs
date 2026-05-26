// GonTimesheetDto.cs - DTOs for GON Supervisor timesheet management and review features

using System;
using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class GonDashboardDto
    {
        public int PendingTimesheets { get; set; }
        public int ApprovedThisMonth { get; set; }
        public int ReturnedForCorrection { get; set; }
        public int SuperviseesCount { get; set; }
        public List<GonActiveTimesheetDto> ActiveTimesheets { get; set; } = new();
    }

    public class GonActiveTimesheetDto
    {
        public int Id { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Month { get; set; } = string.Empty;
        public string SubmissionDate { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class GonTimesheetReviewDto
    {
        public int Id { get; set; }
        public string StaffName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Month { get; set; } = string.Empty;
        public string SubmissionDate { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StatusType { get; set; } = string.Empty;

        public string StatusDisplay => Status switch
        {
            "GONReview" => "Pending",
            "ProgramsReview" => "Programs Review",
            "Approved" => "Approved",
            "Rejected" => "Returned",
            "Submitted" => "Submitted",
            _ => Status
        };
    }

    public class GonTimesheetDetailDto
    {
        public int Id { get; set; }
        public string MonthYear { get; set; } = string.Empty;
        public string StaffName { get; set; } = string.Empty;
        
        // Staff Information
        public string FullName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StatusPill { get; set; } = string.Empty;
        
        // Timesheet Entries
        public List<GonTimesheetEntryDto> Entries { get; set; } = new();
        public double TotalHours { get; set; }
        public string SummaryInfo { get; set; } = string.Empty;
        
        // Comments
        public List<GonCommentDto> Comments { get; set; } = new();
    }

    public class GonTimesheetEntryDto
    {
        public string Date { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public string TotalHours { get; set; } = string.Empty;
        public string WorkDone { get; set; } = string.Empty;
    }

    public class GonCommentDto
    {
        public int Id { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string AuthorRole { get; set; } = string.Empty;
        public string AuthorAvatar { get; set; } = string.Empty;
        public string CommentText { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }

    public class GonApproveTimesheetDto
    {
        public string? Comments { get; set; }
        public bool FlagConcern { get; set; }
        public string? ConcernType { get; set; }
        public string? Severity { get; set; }
        public string? ConcernDescription { get; set; }
    }

    public class GonDeclineTimesheetDto
    {
        public string Feedback { get; set; } = string.Empty;
    }
}