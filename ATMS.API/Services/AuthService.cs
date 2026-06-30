// ATMS.API/Services/AuthService.cs

using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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
using Microsoft.AspNetCore.Http;

namespace ATMS.API.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto> Authenticate(LoginDto loginDto);
        Task<UserDto> Register(RegisterDto registerDto);
        Task<bool> ChangePassword(int userId, string currentPassword, string newPassword);
        Task<bool> ForgotPassword(string email);
        Task<bool> ResetPassword(string token, string newPassword);
        Task<UserDto> GetUserById(int id);
    }

    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtSettings _jwtSettings;
        private readonly ILogger<AuthService> _logger;
        private readonly IEmailService _emailService;
        private readonly IUserManagementService _userManagementService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly LoginSettings _loginSettings;
        private readonly IServiceScopeFactory _scopeFactory;

        public AuthService(
            ApplicationDbContext context,
            IOptions<JwtSettings> jwtSettings,
            ILogger<AuthService> logger,
            IEmailService emailService,
            IUserManagementService userManagementService,
            IHttpContextAccessor httpContextAccessor,
            IOptions<LoginSettings> loginSettings,
            IServiceScopeFactory scopeFactory)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
            _logger = logger;
            _emailService = emailService;
            _userManagementService = userManagementService;
            _httpContextAccessor = httpContextAccessor;
            _loginSettings = loginSettings.Value;
            _scopeFactory = scopeFactory;
        }

        public async Task<LoginResponseDto> Authenticate(LoginDto loginDto)
        {
            try
            {
                IQueryable<User> query = _context.Users.Include(u => u.Role);

                if (!string.IsNullOrEmpty(loginDto.StaffId) && _loginSettings.AllowStaffIdLogin)
                {
                    query = query.Where(u => u.EmployeeCode == loginDto.StaffId);
                }
                else if (!string.IsNullOrEmpty(loginDto.Email) && _loginSettings.AllowEmailLogin)
                {
                    query = query.Where(u => u.Email == loginDto.Email);
                }
                else if (!string.IsNullOrEmpty(loginDto.Username) && _loginSettings.AllowUsernameLogin)
                {
                    query = query.Where(u => u.Username == loginDto.Username);
                }
                else
                {
                    _logger.LogWarning("Login attempt with invalid method or credentials");
                    return null;
                }

                var user = await query.FirstOrDefaultAsync(u => u.IsActive);

                if (user == null)
                {
                    _logger.LogWarning("User not found for {Identifier}", loginDto.Email ?? loginDto.StaffId);
                    return null;
                }

                // Check if account is locked
                if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
                {
                    var remainingMinutes = (int)(user.LockoutEnd.Value - DateTime.UtcNow).TotalMinutes;
                    throw new Exception($"Account is locked. Please try again in {remainingMinutes} minutes.");
                }

                // Verify password
                if (!PasswordHasher.VerifyPassword(loginDto.Password, user.PasswordHash))
                {
                    user.FailedLoginAttempts++;
                    
                    if (user.FailedLoginAttempts >= 3)
                    {
                        user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                        user.FailedLoginAttempts = 0;
                        await _context.SaveChangesAsync();
                        throw new Exception("Too many failed attempts. Your account has been locked for 15 minutes.");
                    }
                    
                    await _context.SaveChangesAsync();
                    _logger.LogWarning("Failed login attempt {Attempts}/3 for {Identifier}", user.FailedLoginAttempts, loginDto.Email ?? loginDto.StaffId);
                    return null;
                }

                // Reset failed attempts on successful login
                user.FailedLoginAttempts = 0;
                user.LockoutEnd = null;
                user.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var token = GenerateJwtToken(user);

                // Track the session in the background — do not block the login response
                var userId = user.Id;
                var userAgent = _httpContextAccessor?.HttpContext?.Request.Headers["User-Agent"].ToString() ?? "Unknown";
                var ipAddress = _httpContextAccessor?.HttpContext?.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
                _ = Task.Run(async () =>
                {
                    using var scope = _scopeFactory.CreateScope();
                    var mgmtService = scope.ServiceProvider.GetRequiredService<IUserManagementService>();
                    await mgmtService.TrackUserSessionAsync(userId, token, userAgent, ipAddress, "Unknown");
                });
                
                _logger.LogInformation($"User {user.Email} logged in with role: {user.Role?.Name}");

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
                _logger.LogError(ex, "Error during authentication");
                throw;
            }
        }

        public async Task<UserDto> Register(RegisterDto dto)
        {
            try
            {
                // Check if user already exists
                if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                {
                    _logger.LogWarning($"User with email {dto.Email} already exists");
                    return null;
                }

                // Determine role: prefer RoleName if provided, otherwise use Role
                var roleName = !string.IsNullOrEmpty(dto.RoleName) ? dto.RoleName : dto.Role;
                var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
                if (role == null)
                {
                    _logger.LogError($"Role '{roleName}' not found");
                    return null;
                }

                // Employee code: use provided one or generate
                string employeeCode;
                if (!string.IsNullOrEmpty(dto.EmployeeCode))
                {
                    employeeCode = dto.EmployeeCode;
                }
                else
                {
                    employeeCode = await GenerateEmployeeCode(dto.State ?? "XXX", dto.LGA ?? "XXX");
                }

                var user = new User
                {
                    EmployeeCode = employeeCode,
                    Username = dto.Username,
                    Email = dto.Email,
                    FullName = dto.FullName,
                    PasswordHash = PasswordHasher.HashPassword(dto.Password),
                    PhoneNumber = dto.PhoneNumber,
                //    Gender = dto.Gender,
                    Designation = dto.Designation,
                    Department = dto.Department,
                    State = dto.State,
                    LGA = dto.LGA,
                    HealthFacility = dto.HealthFacility,
                    Project = dto.Project,
                    BankName = dto.BankName,
                    AccountNumber = dto.AccountNumber,
                    AccountName = dto.AccountName,
                    NINName = dto.NINName,
                    NINNumber = dto.NINNumber,
                    TINName = dto.TINName,
                    TINNumber = dto.TINNumber,
                    EmergencyContactName = dto.EmergencyContactName,
                    EmergencyContactPhone = dto.EmergencyContactPhone,
                    ContractStatus = dto.ContractStatus ?? "Pending",
                    RoleId = role.Id,
                    EcewsSupervisorId = dto.EcewsSupervisorId,
                    GonSupervisorId = dto.GonSupervisorId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                    // PublicId will be set AFTER save, not before
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Now that we have the actual ID, generate and set the PublicId
                user.PublicId = GeneratePublicId(user.Id);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"User registered successfully with ID: {user.Id}, PublicId: {user.PublicId}");

                // Send welcome email after successful creation
                try
                {
                    await _emailService.SendWelcomeEmailAsync(user.Email, user.FullName, user.EmployeeCode, "Password123@");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send welcome email to {Email}", user.Email);
                    // Do not throw – user still created
                }

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
                _logger.LogError(ex, "Error registering user {Email}", dto.Email);
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

        public async Task<bool> ForgotPassword(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return false;
            
            // Generate reset token
            var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            user.PasswordResetToken = token;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
            
            await _context.SaveChangesAsync();
            
            // Send email with reset link (you'll need to implement this)
            var baseUrl = "https://atms.ecews.org"; // set via AppBaseUrl in appsettings
            var resetLink = $"{baseUrl}/reset-password?token={token}";
            await _emailService.SendPasswordResetEmailAsync(user.Email, user.FullName, resetLink);
            
            return true;
        }

        public async Task<bool> ResetPassword(string token, string newPassword)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.PasswordResetToken == token && u.PasswordResetTokenExpiry > DateTime.UtcNow);
            
            if (user == null) return false;
            
            user.PasswordHash = PasswordHasher.HashPassword(newPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
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

        private string GeneratePublicId(int id)
        {
            return $"EMP-{id:D6}";  // Format: EMP-000001, EMP-000002, etc.
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