using Microsoft.AspNetCore.Http;

namespace ATMS.API.DTOs
{
    public class SignContractLetterDto
    {
        public required IFormFile File { get; set; }
    }
}
