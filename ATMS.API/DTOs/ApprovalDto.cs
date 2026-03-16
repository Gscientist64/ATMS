namespace ATMS.API.DTOs
{
    public class ApproveTimesheetDto
    {
        public string? Comments { get; set; }
        public string? ContractRecommendation { get; set; }
        public string? Reason { get; set; }
    }
    
    public class ApproveTimesheetWithConcernDto
    {
        public string? Comments { get; set; }
        public bool FlagConcern { get; set; }
        public string? ConcernType { get; set; }
        public string? Severity { get; set; }
        public string? ConcernDescription { get; set; }
    }
    
    public class DeclineTimesheetDto
    {
        public string Feedback { get; set; } = string.Empty;
    }
    
    public class AddCommentDto
    {
        public string Comment { get; set; } = string.Empty;
    }
}