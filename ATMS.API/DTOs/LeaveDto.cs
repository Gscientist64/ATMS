using System;
using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class LeaveBalanceDto
    {
        public int Year { get; set; }
        public int TotalDays { get; set; }
        public int TakenDays { get; set; }
        public int RemainingDays { get; set; }
        public int CarryoverDays { get; set; }
    }
    
    public class LeaveHistoryDto
    {
        public int Id { get; set; }
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public string LeaveType { get; set; } = string.Empty;
        public int TotalDays { get; set; }
        public string? SupervisorStatus { get; set; }
        public string? HrStatus { get; set; }
        public bool CanCancel { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    
    public class CreateLeaveDto
    {
        public string LeaveType { get; set; } = string.Empty;
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string? Reason { get; set; }
    }
    
    public class CancelLeaveDto
    {
        public string? Reason { get; set; }
    }
}
