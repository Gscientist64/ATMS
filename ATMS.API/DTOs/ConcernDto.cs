namespace ATMS.API.DTOs
{
    public class ConcernDto
    {
        public int Id { get; set; }
        public int TimesheetId { get; set; }
        public string RaisedByName { get; set; } = string.Empty;
        public string RaisedByRole { get; set; } = string.Empty;
        public string RaisedByAvatar { get; set; } = string.Empty;
        public string ConcernType { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string RaisedAt { get; set; } = string.Empty;
        public string SeverityClass { get; set; } = string.Empty;
        public string TypeClass { get; set; } = string.Empty;
    }
    
    public class CreateConcernDto
    {
        public int TimesheetId { get; set; }
        public int TargetUserId { get; set; }
        public string ConcernType { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}