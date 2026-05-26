using System.Collections.Generic;
using System.Threading.Tasks;
using ATMS.API.DTOs;

namespace ATMS.API.Services
{
    public interface IAnnouncementService
    {
        Task<AnnouncementDto> CreateAnnouncementAsync(int createdById, CreateAnnouncementDto dto);
        Task<List<AnnouncementDto>> GetActiveAnnouncementsAsync();
        Task<List<AnnouncementDto>> GetAllAnnouncementsAsync();
        Task<AnnouncementDto> UpdateAnnouncementAsync(int id, CreateAnnouncementDto dto);
        Task<bool> DeleteAnnouncementAsync(int id);
    }
}