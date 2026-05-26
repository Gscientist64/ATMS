using System;
using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class CreatePipDto
    {
        public int? UserId { get; set; }
        public string? EmployeeCode { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Objective { get; set; } = string.Empty;
        public string ActionPlan { get; set; } = string.Empty;
        public string? SuccessCriteria { get; set; }
        public string? SupportProvided { get; set; }
    }

    public class UpdatePipDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Objective { get; set; }
        public string? ActionPlan { get; set; }
        public string? SuccessCriteria { get; set; }
        public string? SupportProvided { get; set; }
        public string? Status { get; set; }
    }

    public class PipDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string UserEmployeeCode { get; set; } = string.Empty;
        public string UserDesignation { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Duration { get; set; } = string.Empty;
        public string Objective { get; set; } = string.Empty;
        public string ActionPlan { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? CompletedAt { get; set; }
        public string? CompletionOutcome { get; set; }
        public List<PipReviewDto> Reviews { get; set; } = new();
    }

    public class AddPipReviewDto
    {
        public string Comments { get; set; } = string.Empty;
        public string? Rating { get; set; }
    }

    public class PipReviewDto
    {
        public int Id { get; set; }
        public string ReviewerName { get; set; } = string.Empty;
        public string ReviewerRole { get; set; } = string.Empty;
        public DateTime ReviewDate { get; set; }
        public string Comments { get; set; } = string.Empty;
        public string? Rating { get; set; }
    }

    public class EndPipDto
    {
        public string Outcome { get; set; } = string.Empty;
        public bool ReviewCompleted { get; set; }
        public bool EvaluationDocumented { get; set; }
        public bool SupervisorFeedbackProvided { get; set; }
        public bool HrReviewCompleted { get; set; }
    }
}