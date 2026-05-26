// ATMS.API\Services\IWorkCycleService.cs

using System.Collections.Generic;
using System.Threading.Tasks;
using ATMS.API.DTOs;

namespace ATMS.API.Services
{
    public interface IWorkCycleService
    {
        Task<WorkCycleDto> CreateWorkCycleAsync(int createdById, CreateWorkCycleDto dto);
        Task<List<WorkCycleDto>> GetActiveWorkCyclesAsync();
        Task<WorkCycleDto> UpdateWorkCycleAsync(int id, CreateWorkCycleDto dto);
        Task<bool> DeactivateWorkCycleAsync(int id);
        Task SendRemindersForActiveCyclesAsync();
    }
}