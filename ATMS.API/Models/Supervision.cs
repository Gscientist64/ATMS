using System;

namespace ATMS.API.Models
{
    public class Supervision
    {
        public int Id { get; set; }
        
        public int SupervisorId { get; set; }
        public User? Supervisor { get; set; }
        
        public int SuperviseeId { get; set; }
        public User? Supervisee { get; set; }
        
        public string SupervisorRole { get; set; } = string.Empty;
        
        public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}