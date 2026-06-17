using System;

namespace ATMS.API.DTOs
{
    public class CreateWorkCycleDto
    {
        public string CycleType { get; set; } = string.Empty;
        public string Repeat { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public bool CreateAnnouncement { get; set; }
        public string? Reminder { get; set; }
        
        /// <summary>
        /// Direct start date selected by the user via date picker.
        /// </summary>
        public DateTime StartDate { get; set; }
        
        /// <summary>
        /// Direct end date selected by the user via date picker.
        /// </summary>
        public DateTime EndDate { get; set; }
    }
}