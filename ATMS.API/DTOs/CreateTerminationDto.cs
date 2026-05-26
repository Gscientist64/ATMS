using System;

namespace ATMS.API.DTOs
{
    public class CreateTerminationDto
    {
        public string StaffPublicId { get; set; } = string.Empty;
        public DateTime EffectiveDate { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? AdditionalNotes { get; set; }
        public bool EquipmentReturned { get; set; }
        public bool HandoverDocumentsSubmitted { get; set; }
        public bool ExitInterviewCompleted { get; set; }
        public bool SystemAccessRevoked { get; set; }
        public bool SeveranceProcessed { get; set; }
        public bool ChecklistNotApplicable { get; set; }
    }
}