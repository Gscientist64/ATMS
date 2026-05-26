using System;
using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class EcewsTimesheetDetailDto
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
        
        // GON Status
        public bool GonApproved { get; set; }
        public bool GonFlagged { get; set; }
        public string GonSupervisorName { get; set; } = string.Empty;
        
        // Timesheet Status
        public string Status { get; set; } = string.Empty;

        // Timesheet Entries
        public List<EcewsTimesheetEntryDto> Entries { get; set; } = new();
        public double TotalHours { get; set; }
        public string SummaryInfo { get; set; } = string.Empty;
        
        // Comments
        public List<EcewsCommentDto> Comments { get; set; } = new();
        
        // Concerns
        public List<EcewsConcernDto> Concerns { get; set; } = new();
    }

    public class EcewsTimesheetEntryDto
    {
        public string Date { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public string TotalHours { get; set; } = string.Empty;
        public string WorkDone { get; set; } = string.Empty;
    }

    public class EcewsCommentDto
    {
        public int Id { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string AuthorRole { get; set; } = string.Empty;
        public string AuthorAvatar { get; set; } = string.Empty;
        public string CommentText { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }

    public class EcewsConcernDto
    {
        public int Id { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string AuthorRole { get; set; } = string.Empty;
        public string AuthorAvatar { get; set; } = string.Empty;
        public string ConcernText { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty; // High, Medium, Low
        public string Type { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }

    public class EcewsApproveTimesheetDto
    {
        public string? Comments { get; set; }
        public string? ContractRecommendation { get; set; } // Renewal, PIP, Termination
        public string? Reason { get; set; }
    }

    public class EcewsDeclineTimesheetDto
    {
        public string Feedback { get; set; } = string.Empty;
    }
}