using System.Collections.Generic;
using System.Threading.Tasks;
using ATMS.API.DTOs;

namespace ATMS.API.Services
{
    public interface IUserManagementService
    {
        Task<List<SystemUserDto>> GetAllSystemUsersAsync(string? team = null);
        Task<SystemUserDto?> GetSystemUserByIdAsync(int id);
        Task<SystemUserDto> CreateSystemUserAsync(CreateSystemUserDto dto, int createdBy);
        Task<SystemUserDto> UpdateSystemUserAsync(int id, UpdateSystemUserDto dto, int updatedBy);
        Task<bool> DeleteSystemUserAsync(int id);
        Task<bool> ResetUserPasswordAsync(int userId);
        Task<PermissionMatrixDto> GetPermissionMatrixAsync();
        Task<List<ActiveSessionDto>> GetActiveSessionsAsync();
        Task<bool> EndSessionAsync(int sessionId);
        Task<bool> TrackUserSessionAsync(int userId, string token, string browser, string ipAddress, string location);
        Task<bool> UpdateSessionActivityAsync(int userId);
        Task<bool> InvalidateUserSessionsAsync(int userId);
    }
}