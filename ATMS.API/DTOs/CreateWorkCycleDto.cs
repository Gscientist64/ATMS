namespace ATMS.API.DTOs
{
    public class CreateWorkCycleDto
    {
        public string CycleType { get; set; } = string.Empty;
        public string StartDay { get; set; } = string.Empty;
        public string EndDay { get; set; } = string.Empty;
        public string Repeat { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public bool CreateAnnouncement { get; set; }
        public string? Reminder { get; set; }
    }
}