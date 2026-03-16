namespace ATMS.API.DTOs
{
    public class AdvisoryDto
    {
        public int Id { get; set; }
        public string IssuedByName { get; set; } = string.Empty;
        public string IssuedByRole { get; set; } = string.Empty;
        public string IssuedByAvatar { get; set; } = string.Empty;
        public string AdvisoryType { get; set; } = string.Empty;
        public string Justification { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string IssuedAt { get; set; } = string.Empty;
        public int? TimesheetId { get; set; }
    }
    
    public class CreateAdvisoryDto
    {
        public int TargetUserId { get; set; }
        public int? TimesheetId { get; set; }
        public string AdvisoryType { get; set; } = string.Empty;
        public string Justification { get; set; } = string.Empty;
    }
}