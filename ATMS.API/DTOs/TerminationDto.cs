using System;

namespace ATMS.API.DTOs
{
    public class TerminationDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string UserEmployeeCode { get; set; } = string.Empty;
        public DateTime EffectiveDate { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? AdditionalNotes { get; set; }
        public bool EquipmentReturned { get; set; }
        public bool HandoverDocumentsSubmitted { get; set; }
        public bool ExitInterviewCompleted { get; set; }
        public bool SystemAccessRevoked { get; set; }
        public bool SeveranceProcessed { get; set; }
        public DateTime CreatedAt { get; set; }
        public string TerminatedByName { get; set; } = string.Empty;
    }
}