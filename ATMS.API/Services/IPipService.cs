using System.Collections.Generic;
using System.Threading.Tasks;
using ATMS.API.DTOs;

namespace ATMS.API.Services
{
    public interface IPipService
    {
        Task<PipDto> InitiatePipAsync(int initiatedById, CreatePipDto dto);
        Task<PipDto> GetPipByIdAsync(int pipId);
        Task<List<PipDto>> GetPipsForUserAsync(int userId);
        Task<List<PipDto>> GetAllActivePipsAsync();
        Task<PipDto> UpdatePipAsync(int pipId, UpdatePipDto dto);
        Task<PipDto> AddReviewAsync(int pipId, int reviewerId, AddPipReviewDto dto);
        Task<PipDto> EndPipAsync(int pipId, EndPipDto dto);
    }
}