using System;

namespace ATMS.API.Models
{
    public class TerminationRecord
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public int? TerminatedById { get; set; }
        public User? TerminatedBy { get; set; }
        
        public DateTime EffectiveDate { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? AdditionalNotes { get; set; }
        
        public bool EquipmentReturned { get; set; }
        public bool HandoverDocumentsSubmitted { get; set; }
        public bool ExitInterviewCompleted { get; set; }
        public bool SystemAccessRevoked { get; set; }
        public bool SeveranceProcessed { get; set; }
        
        public bool ChecklistNotApplicable { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}