using System.ComponentModel.DataAnnotations;

namespace ATMS.API.DTOs
{
    public class LoginDto
    {
        public string? Email { get; set; }
        public string? StaffId { get; set; }
        public string? Username { get; set; }
        
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