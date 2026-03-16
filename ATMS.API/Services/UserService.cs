using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using ATMS.API.Data;
using ATMS.API.DTOs;
using ATMS.API.Helpers;
using ATMS.API.Models;

namespace ATMS.API.Services
{
    public interface IUserService
    {
        Task<UserDto> GetUserById(int id);
        Task<bool> UpdateProfile(int userId, UpdateProfileDto dto);
        Task<string> SaveSignature(int userId, string signatureBase64);
        Task<bool> DeleteSignature(int userId);
        Task<bool> ChangePassword(int userId, string currentPassword, string newPassword);
        Task<List<SuperviseeListDto>> GetSupervisees(int supervisorId, string supervisorRole);
        Task<string> UploadProfilePicture(int userId, IFormFile file);
        Task<bool> DeleteProfilePicture(int userId);
    }

    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<UserService> _logger;

        public UserService(
            ApplicationDbContext context, 
            IWebHostEnvironment environment,
            ILogger<UserService> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
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

        public async Task<bool> UpdateProfile(int userId, UpdateProfileDto dto)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) return false;

                user.PhoneNumber = dto.PhoneNumber ?? user.PhoneNumber;
                user.EmergencyContactName = dto.EmergencyContactName ?? user.EmergencyContactName;
                user.EmergencyContactPhone = dto.EmergencyContactPhone ?? user.EmergencyContactPhone;
                user.BankName = dto.BankName ?? user.BankName;
                user.AccountNumber = dto.AccountNumber ?? user.AccountNumber;
                user.AccountName = dto.AccountName ?? user.AccountName;
                user.NINName = dto.NINName ?? user.NINName;
                user.NINNumber = dto.NINNumber ?? user.NINNumber;
                user.TINName = dto.TINName ?? user.TINName;
                user.TINNumber = dto.TINNumber ?? user.TINNumber;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating profile for user {UserId}", userId);
                return false;
            }
        }

        public async Task<string> SaveSignature(int userId, string signatureBase64)
        {
            try
            {
                if (signatureBase64.Contains(","))
                {
                    signatureBase64 = signatureBase64.Substring(signatureBase64.IndexOf(",") + 1);
                }

                byte[] signatureBytes = Convert.FromBase64String(signatureBase64);

                var webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var signaturesPath = Path.Combine(webRootPath, "signatures");
                if (!Directory.Exists(signaturesPath))
                {
                    Directory.CreateDirectory(signaturesPath);
                }

                var fileName = $"signature_{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}.png";
                var filePath = Path.Combine(signaturesPath, fileName);

                await System.IO.File.WriteAllBytesAsync(filePath, signatureBytes);

                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    if (!string.IsNullOrEmpty(user.DigitalSignatureUrl))
                    {
                        var oldFilePath = Path.Combine(webRootPath, user.DigitalSignatureUrl.TrimStart('/'));
                        if (System.IO.File.Exists(oldFilePath))
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                    }

                    user.DigitalSignatureUrl = $"/signatures/{fileName}";
                    user.SignatureProvidedAt = DateTime.UtcNow;
                    user.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                return $"/signatures/{fileName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving signature for user {UserId}", userId);
                return null;
            }
        }

        public async Task<string> UploadProfilePicture(int userId, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    throw new Exception("No file uploaded");

                // Check file size (max 2MB)
                if (file.Length > 2 * 1024 * 1024)
                    throw new Exception("File size must be less than 2MB");

                // Check file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                    throw new Exception("Only image files (jpg, jpeg, png, gif) are allowed");

                var webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var profilePicturesPath = Path.Combine(webRootPath, "profile-pictures");
                
                if (!Directory.Exists(profilePicturesPath))
                {
                    Directory.CreateDirectory(profilePicturesPath);
                }

                // Generate unique filename
                var fileName = $"profile_{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}{fileExtension}";
                var filePath = Path.Combine(profilePicturesPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Update user record
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    // Delete old profile picture if exists
                    if (!string.IsNullOrEmpty(user.ProfileImageUrl))
                    {
                        var oldFilePath = Path.Combine(webRootPath, user.ProfileImageUrl.TrimStart('/'));
                        if (System.IO.File.Exists(oldFilePath))
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                    }

                    user.ProfileImageUrl = $"/profile-pictures/{fileName}";
                    user.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                return $"/profile-pictures/{fileName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading profile picture for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> DeleteProfilePicture(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null || string.IsNullOrEmpty(user.ProfileImageUrl)) 
                    return false;

                var webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var filePath = Path.Combine(webRootPath, user.ProfileImageUrl.TrimStart('/'));
                
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }

                user.ProfileImageUrl = null;
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting profile picture for user {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> DeleteSignature(int userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null || string.IsNullOrEmpty(user.DigitalSignatureUrl)) return false;

                var webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var filePath = Path.Combine(webRootPath, user.DigitalSignatureUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }

                user.DigitalSignatureUrl = null;
                user.SignatureProvidedAt = null;
                user.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting signature for user {UserId}", userId);
                return false;
            }
        }

        public async Task<List<SuperviseeListDto>> GetSupervisees(int supervisorId, string supervisorRole)
        {
            try
            {
                var supervisees = await _context.Users
                    .Where(u => (supervisorRole == "EcewsSupervisor" && u.EcewsSupervisorId == supervisorId) ||
                                (supervisorRole == "GonSupervisor" && u.GonSupervisorId == supervisorId))
                    .Select(u => new SuperviseeListDto
                    {
                        Id = u.Id,
                        Name = u.FullName,
                        Designation = u.Designation ?? "",
                        StaffId = u.EmployeeCode ?? "",
                        ContractStatus = u.ContractStatus ?? "Active",
                        ContractStatusClass = GetContractStatusClass(u.ContractStatus),
                        FlagsCount = 0,
                        FlagsDisplay = "0 Flags",
                        HasFlags = false
                    })
                    .ToListAsync();

                return supervisees;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting supervisees for supervisor {SupervisorId}", supervisorId);
                throw;
            }
        }

        private string GetContractStatusClass(string? status)
        {
            return status?.ToLower().Replace(" ", "") switch
            {
                "active" => "active",
                "expiringsoon" => "expiringsoon",
                "onpip" => "onpip",
                _ => "active"
            } ?? "active";
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

        private string MaskSensitiveData(string? data)
        {
            if (string.IsNullOrEmpty(data) || data.Length < 4)
                return data ?? "";

            return "****" + data.Substring(data.Length - 4);
        }
    }
}