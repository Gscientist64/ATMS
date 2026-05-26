namespace ATMS.API.DTOs
{
    public class SendContractLetterDto
    {
        public string ToEmail { get; set; } = string.Empty;
        public string StaffName { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string HtmlContent { get; set; } = string.Empty;
    }
}