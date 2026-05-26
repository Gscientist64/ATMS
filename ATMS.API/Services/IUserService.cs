using System.Collections.Generic;
using System.Threading.Tasks;
using ATMS.API.DTOs;
using Microsoft.AspNetCore.Http;

namespace ATMS.API.Services
{
    public interface IUserService
    {
        Task<UserDto> GetUserById(int id);
        Task<UserDto?> GetUserByIdOrCode(string identifier);
        Task<UserDto> GetUserByEmployeeCode(string employeeCode);
        Task<bool> UpdateProfile(int userId, UpdateProfileDto dto);
        Task<string> SaveSignature(int userId, string signatureBase64);
        Task<bool> DeleteSignature(int userId);
        Task<bool> ChangePassword(int userId, string currentPassword, string newPassword);
        Task<List<SuperviseeListDto>> GetSupervisees(int supervisorId, string supervisorRole);
        Task<string> UploadProfilePicture(int userId, IFormFile file);
        Task<bool> DeleteProfilePicture(int userId);
        
        // New HRIS methods
        Task<List<HrisEmployeeSummaryDto>> GetAllEmployeesAsync(string? role, bool? active);
        Task<List<HrisEmployeeSummaryDto>> GetEmployeesByRoleAsync(string roleName);
        Task<bool> UpdateContractStatusAsync(int userId, UpdateContractDto dto);
        Task<UserDto> GetUserByPublicId(string publicId);
        Task<List<UserDocumentDto>> GetUserDocumentsAsync(int userId);
        Task<UserDocumentDto> UploadDocumentAsync(int userId, IFormFile file);
        Task<object> GetAncillaryEmployeesAsync(string? search, string? location, string? status, int page, int pageSize);
        Task<bool> DeleteDocumentAsync(int userId, int documentId);
        Task<List<string>> GetUserAssignedStatesAsync(int userId);
        Task<List<string>> GetUserAssignedProjectsAsync(int userId);
        Task<bool> AssignStateToUserAsync(int userId, string state, int assignedBy);
        Task<bool> AssignProjectToUserAsync(int userId, string project, int assignedBy);
        Task<List<UserDto>> GetUsersByStateAsync(string state);
        Task<List<UserDto>> GetEcewsSupervisorsByStateAsync(string state);
        Task<List<UserDto>> GetGonSupervisorsByStateAsync(string state);
    }
}