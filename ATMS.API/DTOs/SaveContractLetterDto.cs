using Microsoft.AspNetCore.Http;

namespace ATMS.API.DTOs
{
    public class SaveContractLetterDto
    {
        public int UserId { get; set; }
        public required IFormFile File { get; set; }
        public string? FileName { get; set; }
    }
}