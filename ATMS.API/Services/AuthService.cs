using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Logging;
using ATMS.API.Data;
using ATMS.API.DTOs;
using ATMS.API.Helpers;
using ATMS.API.Models;

namespace ATMS.API.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto> Authenticate(LoginDto loginDto);
        Task<UserDto> Register(RegisterDto registerDto);
        Task<bool> ChangePassword(int userId, string currentPassword, string newPassword);
        Task<UserDto> GetUserById(int id);
    }

    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            ApplicationDbContext context, 
            IOptions<JwtSettings> jwtSettings,
            ILogger<AuthService> logger)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
            _logger = logger;
        }

        public async Task<LoginResponseDto> Authenticate(LoginDto loginDto)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.Role)
                    .Include(u => u.EcewsSupervisor)
                    .Include(u => u.GonSupervisor)
                    .FirstOrDefaultAsync(u => u.Email == loginDto.Email && u.IsActive);

                if (user == null || !PasswordHasher.VerifyPassword(loginDto.Password, user.PasswordHash))
                {
                    _logger.LogWarning("Failed login attempt for email {Email}", loginDto.Email);
                    return null;
                }

                var token = GenerateJwtToken(user);

                return new LoginResponseDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role?.Name ?? "Unknown",
                    Token = token,
                    ProfileImageUrl = user.ProfileImageUrl,
                    EcewsSupervisorName = user.EcewsSupervisor?.FullName,
                    GonSupervisorName = user.GonSupervisor?.FullName
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during authentication for {Email}", loginDto.Email);
                throw;
            }
        }

        public async Task<UserDto> Register(RegisterDto registerDto)
        {
            try
            {
                // Check if user already exists
                if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                {
                    return null;
                }

                var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == registerDto.Role);
                if (role == null)
                {
                    return null;
                }

                // Generate employee code
                var employeeCode = await GenerateEmployeeCode(registerDto.State ?? "XXX", registerDto.LGA ?? "XXX");

                var user = new User
                {
                    EmployeeCode = employeeCode,
                    Email = registerDto.Email,
                    FullName = registerDto.FullName,
                    PasswordHash = PasswordHasher.HashPassword(registerDto.Password),
                    PhoneNumber = registerDto.PhoneNumber,
                    Designation = registerDto.Designation,
                    Department = registerDto.Department,
                    State = registerDto.State,
                    LGA = registerDto.LGA,
                    HealthFacility = registerDto.HealthFacility,
                    Project = registerDto.Project,
                    BankName = registerDto.BankName,
                    AccountNumber = registerDto.AccountNumber,
                    AccountName = registerDto.AccountName,
                    NINName = registerDto.NINName,
                    NINNumber = registerDto.NINNumber,
                    TINName = registerDto.TINName,
                    TINNumber = registerDto.TINNumber,
                    EmergencyContactName = registerDto.EmergencyContactName,
                    EmergencyContactPhone = registerDto.EmergencyContactPhone,
                    ContractStatus = "Pending",
                    RoleId = role.Id,
                    EcewsSupervisorId = registerDto.EcewsSupervisorId,
                    GonSupervisorId = registerDto.GonSupervisorId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return new UserDto
                {
                    Id = user.Id,
                    EmployeeCode = user.EmployeeCode,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = role.Name
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering user {Email}", registerDto.Email);
                throw;
            }
        }

        public async Task<bool> ChangePassword(int userId, string currentPassword, string newPassword)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) return false;

                if (!PasswordHasher.VerifyPassword(currentPassword, user.PasswordHash))
                {
                    return false;
                }

                user.PasswordHash = PasswordHasher.HashPassword(newPassword);
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user {UserId}", userId);
                return false;
            }
        }

        public async Task<UserDto> GetUserById(int id)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.EcewsSupervisor)
                .Include(u => u.GonSupervisor)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                EmployeeCode = user.EmployeeCode,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                ProfileImageUrl = user.ProfileImageUrl,
                Designation = user.Designation,
                Department = user.Department,
                Project = user.Project,
                State = user.State,
                LGA = user.LGA,
                HealthFacility = user.HealthFacility,
                BankName = user.BankName,
                AccountNumber = MaskSensitiveData(user.AccountNumber),
                AccountName = user.AccountName,
                NINName = user.NINName,
                NINNumber = MaskSensitiveData(user.NINNumber),
                TINName = user.TINName,
                TINNumber = MaskSensitiveData(user.TINNumber),
                EmergencyContactName = user.EmergencyContactName,
                EmergencyContactPhone = user.EmergencyContactPhone,
                ContractStatus = user.ContractStatus,
                ContractStartDate = user.ContractStartDate,
                ContractEndDate = user.ContractEndDate,
                DigitalSignatureUrl = user.DigitalSignatureUrl,
                Role = user.Role?.Name ?? "Unknown",
                EcewsSupervisorId = user.EcewsSupervisorId,
                EcewsSupervisorName = user.EcewsSupervisor?.FullName,
                GonSupervisorId = user.GonSupervisorId,
                GonSupervisorName = user.GonSupervisor?.FullName,
                IsActive = user.IsActive
            };
        }

        #region Private Methods

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role?.Name ?? "User"),
                new Claim("employeeCode", user.EmployeeCode ?? "")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
                Issuer = _jwtSettings.Issuer,
                Audience = _jwtSettings.Audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private async Task<string> GenerateEmployeeCode(string state, string lga)
        {
            var stateCode = state.Length >= 3 ? state.Substring(0, 3).ToUpper() : state.PadRight(3, 'X').ToUpper();
            var lgaCode = lga.Length >= 3 ? lga.Substring(0, 3).ToUpper() : lga.PadRight(3, 'X').ToUpper();
            
            var lastUser = await _context.Users
                .OrderByDescending(u => u.Id)
                .FirstOrDefaultAsync();

            var nextNumber = (lastUser?.Id ?? 0) + 1;
            
            return $"{stateCode}/{lgaCode}/{nextNumber:D5}";
        }

        private string MaskSensitiveData(string? data)
        {
            if (string.IsNullOrEmpty(data) || data.Length < 4)
                return data ?? "";

            return "****" + data.Substring(data.Length - 4);
        }

        #endregion
    }
}