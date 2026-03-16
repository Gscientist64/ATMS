using System.ComponentModel.DataAnnotations;

namespace ATMS.API.DTOs
{
    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Password { get; set; } = string.Empty;
    }
    
    public class LoginResponseDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string? RefreshToken { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? EcewsSupervisorName { get; set; }
        public string? GonSupervisorName { get; set; }
    }
}