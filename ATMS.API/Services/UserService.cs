using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using ATMS.API.Data;
using ATMS.API.DTOs;
using ATMS.API.Helpers;
using ATMS.API.Models;

namespace ATMS.API.Services
{
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

            // Fetch contract letters for this user
            var contractLetters = await _context.ContractLetters
                .Where(cl => cl.UserId == user.Id)
                .OrderByDescending(cl => cl.GeneratedAt)
                .Select(cl => new ContractLetterDto
                {
                    Id = cl.Id,
                    FileName = cl.FileName,
                    FileUrl = cl.FileUrl,
                    FileSize = cl.FileSize,
                    GeneratedAt = cl.GeneratedAt,
                    GeneratedByUserId = cl.GeneratedByUserId
                })
                .ToListAsync();

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
                ContractLetters = contractLetters,
                DigitalSignatureUrl = user.DigitalSignatureUrl,
                Role = user.Role?.Name ?? "Unknown",
                EcewsSupervisorId = user.EcewsSupervisorId,
                EcewsSupervisorName = user.EcewsSupervisor?.FullName,
                GonSupervisorId = user.GonSupervisorId,
                GonSupervisorName = user.GonSupervisor?.FullName,
                PublicId = user.PublicId,
                IsActive = user.IsActive
            };
        }

        public async Task<UserDto> GetUserByPublicId(string publicId)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.PublicId == publicId);
            
            if (user == null) return null;
            
            // Fetch contract letters for this user
            var contractLetters = await _context.ContractLetters
                .Where(cl => cl.UserId == user.Id)
                .OrderByDescending(cl => cl.GeneratedAt)
                .Select(cl => new ContractLetterDto
                {
                    Id = cl.Id,
                    FileName = cl.FileName,
                    FileUrl = cl.FileUrl,
                    FileSize = cl.FileSize,
                    GeneratedAt = cl.GeneratedAt,
                    GeneratedByUserId = cl.GeneratedByUserId
                })
                .ToListAsync();
            
            return new UserDto
            {
                Id = user.Id,
                PublicId = user.PublicId,
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
                ContractLetters = contractLetters,
                DigitalSignatureUrl = user.DigitalSignatureUrl,
                Role = user.Role?.Name ?? "Unknown",
                EcewsSupervisorId = user.EcewsSupervisorId,
                EcewsSupervisorName = user.EcewsSupervisor?.FullName,
                GonSupervisorId = user.GonSupervisorId,
                GonSupervisorName = user.GonSupervisor?.FullName,
                IsActive = user.IsActive
            };
        }
        
        public async Task<UserDto> GetUserByEmployeeCode(string employeeCode)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.EcewsSupervisor)
                .Include(u => u.GonSupervisor)
                .FirstOrDefaultAsync(u => u.EmployeeCode == employeeCode);
            
            if (user == null) return null;
            
           // Fetch contract letters for this user
            var contractLetters = await _context.ContractLetters
                .Where(cl => cl.UserId == user.Id)
                .OrderByDescending(cl => cl.GeneratedAt)
                .Select(cl => new ContractLetterDto
                {
                    Id = cl.Id,
                    FileName = cl.FileName,
                    FileUrl = cl.FileUrl,
                    FileSize = cl.FileSize,
                    GeneratedAt = cl.GeneratedAt,
                    GeneratedByUserId = cl.GeneratedByUserId
                })
                .ToListAsync();
            
            return new UserDto
            {
                Id = user.Id,
                PublicId = user.PublicId,
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
                ContractLetters = contractLetters,
                DigitalSignatureUrl = user.DigitalSignatureUrl,
                Role = user.Role?.Name ?? "Unknown",
                EcewsSupervisorId = user.EcewsSupervisorId,
                EcewsSupervisorName = user.EcewsSupervisor?.FullName,
                GonSupervisorId = user.GonSupervisorId,
                GonSupervisorName = user.GonSupervisor?.FullName,
                IsActive = user.IsActive
            };
        }

        public async Task<UserDto?> GetUserByIdOrCode(string identifier)
        {
            // Try numeric ID first
            if (int.TryParse(identifier, out int id))
            {
                var userById = await GetUserById(id);
                if (userById != null) return userById;
            }

            // Then employee code
            return await GetUserByEmployeeCode(identifier);
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

                if (file.Length > 2 * 1024 * 1024)
                    throw new Exception("File size must be less than 2MB");

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

                var fileName = $"profile_{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}{fileExtension}";
                var filePath = Path.Combine(profilePicturesPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
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

        public async Task<object> GetAncillaryEmployeesAsync(string? search, string? location, string? status, int page, int pageSize)
        {
            var query = _context.Users
                .Include(u => u.Role)
                .Where(u => u.Role.Name == "AdHoc");
            
            // Apply search filter
            if (!string.IsNullOrEmpty(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(u => 
                    u.FullName.ToLower().Contains(searchLower) ||
                    (u.EmployeeCode != null && u.EmployeeCode.ToLower().Contains(searchLower)) ||
                    (u.Designation != null && u.Designation.ToLower().Contains(searchLower)));
            }
            
            // Apply location filter
            if (!string.IsNullOrEmpty(location))
            {
                query = query.Where(u => u.State == location);
            }
            
            // Apply status filter
            if (!string.IsNullOrEmpty(status))
            {
                switch (status.ToLower())
                {
                    case "active":
                        query = query.Where(u => u.ContractStatus == "Active");
                        break;
                    case "onpip":
                        var pipUserIds = await _context.Advisories
                            .Where(a => a.AdvisoryType == "PIP" && a.Status == "Pending")
                            .Select(a => a.TargetUserId)
                            .ToListAsync();
                        query = query.Where(u => pipUserIds.Contains(u.Id));
                        break;
                    case "expiringsoon":
                        var thirtyDaysFromNow = DateTime.UtcNow.AddDays(30);
                        query = query.Where(u => u.ContractEndDate.HasValue && u.ContractEndDate.Value <= thirtyDaysFromNow);
                        break;
                }
            }
            
            // Get total count before pagination
            var totalCount = await query.CountAsync();
            
            // Apply pagination
            var users = await query
                .OrderBy(u => u.FullName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new
                {
                    id = u.Id,
                    publicId = u.PublicId,
                    name = u.FullName,
                    designation = u.Designation ?? "Not specified",
                    staffId = u.EmployeeCode ?? "Not assigned",
                    employeeCode = u.EmployeeCode,
                    contractStatus = u.ContractStatus ?? "Active",
                    location = u.State ?? "Not specified",
                    role = u.Role != null ? u.Role.Name : "AdHoc"
                })
                .ToListAsync();
            
            return new
            {
                data = users,
                totalCount = totalCount,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };
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

        // New HRIS methods
        public async Task<List<HrisEmployeeSummaryDto>> GetAllEmployeesAsync(string? role, bool? active)
        {
            var query = _context.Users.Include(u => u.Role).AsQueryable();
            if (!string.IsNullOrEmpty(role))
                query = query.Where(u => u.Role.Name == role);
            if (active.HasValue)
                query = query.Where(u => u.IsActive == active.Value);

            var users = await query.ToListAsync();
            return users.Select(u => MapToHrisSummary(u)).ToList();
        }

        public async Task<List<HrisEmployeeSummaryDto>> GetEmployeesByRoleAsync(string roleName)
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Role.Name == roleName)
                .ToListAsync();
            return users.Select(u => MapToHrisSummary(u)).ToList();
        }

        public async Task<bool> UpdateContractStatusAsync(int userId, UpdateContractDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.ContractStatus = dto.ContractStatus;
            user.ContractStartDate = dto.ContractStartDate;
            user.ContractEndDate = dto.ContractEndDate;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        // ========== Document Management Methods ==========

        public async Task<List<UserDocumentDto>> GetUserDocumentsAsync(int userId)
        {
            var documents = await _context.UserDocuments
                .Where(d => d.UserId == userId && d.IsActive)
                .OrderByDescending(d => d.UploadedAt)
                .Select(d => new UserDocumentDto
                {
                    Id = d.Id,
                    FileName = d.FileName,
                    FileUrl = d.FileUrl,
                    FileType = d.FileType,
                    FileSize = d.FileSize,
                    UploadedAt = d.UploadedAt
                })
                .ToListAsync();

            return documents;
        }

        public async Task<UserDocumentDto> UploadDocumentAsync(int userId, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    throw new Exception("No file uploaded");

                // Check file size (max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                    throw new Exception("File size must be less than 5MB");

                // Allowed file types
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (!allowedExtensions.Contains(fileExtension))
                    throw new Exception("Only image files, PDF, and Word documents are allowed");

                var webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var documentsPath = Path.Combine(webRootPath, "user-documents", userId.ToString());

                if (!Directory.Exists(documentsPath))
                {
                    Directory.CreateDirectory(documentsPath);
                }

                // Generate unique filename
                var safeFileName = $"{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}{fileExtension}";
                var filePath = Path.Combine(documentsPath, safeFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var document = new UserDocument
                {
                    UserId = userId,
                    FileName = file.FileName,
                    FileUrl = $"/user-documents/{userId}/{safeFileName}",
                    FileType = file.ContentType,
                    FileSize = file.Length,
                    UploadedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.UserDocuments.Add(document);
                await _context.SaveChangesAsync();

                return new UserDocumentDto
                {
                    Id = document.Id,
                    FileName = document.FileName,
                    FileUrl = document.FileUrl,
                    FileType = document.FileType,
                    FileSize = document.FileSize,
                    UploadedAt = document.UploadedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading document for user {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> DeleteDocumentAsync(int userId, int documentId)
        {
            try
            {
                var document = await _context.UserDocuments
                    .FirstOrDefaultAsync(d => d.Id == documentId && d.UserId == userId);

                if (document == null)
                    return false;

                // Delete physical file
                var webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var filePath = Path.Combine(webRootPath, document.FileUrl.TrimStart('/'));

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }

                // Soft delete (or hard delete)
                document.IsActive = false;
                // Or hard delete: _context.UserDocuments.Remove(document);
                
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting document {DocumentId} for user {UserId}", documentId, userId);
                return false;
            }
        }

        // ========== State and Project Assignment Methods ==========

        public async Task<List<string>> GetUserAssignedStatesAsync(int userId)
        {
            var assignments = await _context.UserStateAssignments
                .Where(a => a.UserId == userId)
                .Select(a => a.State)
                .ToListAsync();
            
            return assignments;
        }

        public async Task<List<string>> GetUserAssignedProjectsAsync(int userId)
        {
            var assignments = await _context.UserProjectAssignments
                .Where(a => a.UserId == userId)
                .Select(a => a.Project)
                .ToListAsync();
            
            return assignments;
        }

        public async Task<bool> AssignStateToUserAsync(int userId, string state, int assignedBy)
        {
            try
            {
                // Check if already assigned
                var existing = await _context.UserStateAssignments
                    .FirstOrDefaultAsync(a => a.UserId == userId && a.State == state);
                
                if (existing != null)
                    return true; // Already assigned
                
                var assignment = new UserStateAssignment
                {
                    UserId = userId,
                    State = state,
                    AssignedAt = DateTime.UtcNow,
                    AssignedBy = assignedBy
                };
                
                _context.UserStateAssignments.Add(assignment);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning state {State} to user {UserId}", state, userId);
                return false;
            }
        }

        public async Task<bool> AssignProjectToUserAsync(int userId, string project, int assignedBy)
        {
            try
            {
                // Check if already assigned
                var existing = await _context.UserProjectAssignments
                    .FirstOrDefaultAsync(a => a.UserId == userId && a.Project == project);
                
                if (existing != null)
                    return true; // Already assigned
                
                var assignment = new UserProjectAssignment
                {
                    UserId = userId,
                    Project = project,
                    AssignedAt = DateTime.UtcNow,
                    AssignedBy = assignedBy
                };
                
                _context.UserProjectAssignments.Add(assignment);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning project {Project} to user {UserId}", project, userId);
                return false;
            }
        }

        public async Task<List<UserDto>> GetUsersByStateAsync(string state)
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.State == state)
                .ToListAsync();
            
            return users.Select(u => new UserDto
            {
                Id = u.Id,
                PublicId = u.PublicId,
                EmployeeCode = u.EmployeeCode,
                Email = u.Email,
                FullName = u.FullName,
                PhoneNumber = u.PhoneNumber,
                ProfileImageUrl = u.ProfileImageUrl,
                Designation = u.Designation,
                Department = u.Department,
                Project = u.Project,
                State = u.State,
                LGA = u.LGA,
                HealthFacility = u.HealthFacility,
                BankName = u.BankName,
                AccountNumber = u.AccountNumber,
                AccountName = u.AccountName,
                ContractStatus = u.ContractStatus,
                Role = u.Role?.Name ?? "Unknown",
                IsActive = u.IsActive
            }).ToList();
        }

        public async Task<List<UserDto>> GetEcewsSupervisorsByStateAsync(string state)
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Role.Name == "EcewsSupervisor" && u.State == state)
                .ToListAsync();
            
            return users.Select(u => new UserDto
            {
                Id = u.Id,
                PublicId = u.PublicId,
                EmployeeCode = u.EmployeeCode,
                Email = u.Email,
                FullName = u.FullName,
                PhoneNumber = u.PhoneNumber,
                ProfileImageUrl = u.ProfileImageUrl,
                Designation = u.Designation,
                Department = u.Department,
                Project = u.Project,
                State = u.State,
                LGA = u.LGA,
                HealthFacility = u.HealthFacility,
                BankName = u.BankName,
                AccountNumber = u.AccountNumber,
                AccountName = u.AccountName,
                ContractStatus = u.ContractStatus,
                Role = u.Role?.Name ?? "Unknown",
                IsActive = u.IsActive
            }).ToList();
        }

        public async Task<List<UserDto>> GetGonSupervisorsByStateAsync(string state)
        {
            var users = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.Role.Name == "GonSupervisor" && u.State == state)
                .ToListAsync();
            
            return users.Select(u => new UserDto
            {
                Id = u.Id,
                PublicId = u.PublicId,
                EmployeeCode = u.EmployeeCode,
                Email = u.Email,
                FullName = u.FullName,
                PhoneNumber = u.PhoneNumber,
                ProfileImageUrl = u.ProfileImageUrl,
                Designation = u.Designation,
                Department = u.Department,
                Project = u.Project,
                State = u.State,
                LGA = u.LGA,
                HealthFacility = u.HealthFacility,
                BankName = u.BankName,
                AccountNumber = u.AccountNumber,
                AccountName = u.AccountName,
                ContractStatus = u.ContractStatus,
                Role = u.Role?.Name ?? "Unknown",
                IsActive = u.IsActive
            }).ToList();
        }

        // Private helpers
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

        private HrisEmployeeSummaryDto MapToHrisSummary(User u)
        {
            return new HrisEmployeeSummaryDto
            {
                Id = u.Id,
                PublicId = u.PublicId,
                Name = u.FullName,
                Designation = u.Designation ?? "",
                StaffId = u.EmployeeCode,
                ContractStatus = u.ContractStatus ?? "Active",
                Location = u.State ?? "",
                Initials = GetInitials(u.FullName),
                FlagsCount = 0,
                Role = u.Role?.Name ?? ""
            };
        }

        private string GetInitials(string fullName)
        {
            if (string.IsNullOrEmpty(fullName)) return "U";
            var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 2)
                return $"{parts[0][0]}{parts[1][0]}".ToUpper();
            return fullName.Length > 0 ? fullName[0].ToString().ToUpper() : "U";
        }

        private string MaskSensitiveData(string? data)
        {
            if (string.IsNullOrEmpty(data) || data.Length < 4)
                return data ?? "";
            return "****" + data.Substring(data.Length - 4);
        }
    }
}