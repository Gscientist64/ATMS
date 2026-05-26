namespace ATMS.API.DTOs
{
    public class UserDocumentDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
    }
    
    public class UploadDocumentDto
    {
        public IFormFile? File { get; set; }
    }
}