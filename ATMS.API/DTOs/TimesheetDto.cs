using System;
using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class TimesheetListDto
    {
        public int Id { get; set; }
        public string MonthYear { get; set; } = string.Empty; // "January 2026"
        public string DaysWorked { get; set; } = string.Empty; // "3 Days"
        public string SubmittedDate { get; set; } = string.Empty; // "05-02-2026"
        public string Status { get; set; } = string.Empty;
        public string StatusType { get; set; } = string.Empty; // "review", "approved", etc.
        public string StaffName { get; set; } = string.Empty;
    }
    
    public class TimesheetDetailDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string MonthYear { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string UserEmployeeCode { get; set; } = string.Empty;
        
        // Employee Info
        public string FullName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string StatusType { get; set; } = string.Empty;
        
        // Workflow Stages
        public List<WorkflowStageDto> WorkflowStages { get; set; } = new();
        
        // Timesheet Entries
        public List<TimesheetEntryDto> Entries { get; set; } = new();
        public double TotalHours { get; set; }
        
        // Comments
        public List<CommentDto> Comments { get; set; } = new();
    }
    
    public class TimesheetEntryDto
    {
        public int Id { get; set; }
        public string Date { get; set; } = string.Empty; // "28-02-2026"
        public string StartTime { get; set; } = string.Empty; // "08:00"
        public string EndTime { get; set; } = string.Empty; // "17:00"
        public string TotalHours { get; set; } = string.Empty; // "9 hrs"
        public string WorkDone { get; set; } = string.Empty;
        public string? LGA { get; set; }
        public string? Ward { get; set; }
        public string? HealthFacility { get; set; }
    }
    
    public class WorkflowStageDto
    {
        public string Name { get; set; } = string.Empty;
        public bool Completed { get; set; }
        public bool Current { get; set; }
        public int Order { get; set; }
    }
    
    public class CommentDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserRole { get; set; } = string.Empty;
        public string UserAvatar { get; set; } = string.Empty;
        public string CommentText { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty; // "28-02-2026 10:30"
    }
    
    public class CreateTimesheetDto
    {
        public string Month { get; set; } = string.Empty;
        public int Year { get; set; }
        public DateTime WeekStarting { get; set; }
        public DateTime WeekEnding { get; set; }
        public List<CreateTimesheetEntryDto> Entries { get; set; } = new();
    }
    
    public class CreateTimesheetEntryDto
    {
        public string Date { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public string WorkDone { get; set; } = string.Empty;
        public string? LGA { get; set; }
        public string? Ward { get; set; }
        public string? HealthFacility { get; set; }
    }
    
    public class TimesheetReviewDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int UserId { get; set; }
        public DateTime WeekStarting { get; set; }
        public DateTime WeekEnding { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
        public double TotalHours { get; set; }
        public bool CanReview { get; set; }
    }
}