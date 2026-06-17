using System.Collections.Generic;
using System.Threading.Tasks;
using ATMS.API.DTOs;

namespace ATMS.API.Services
{
    public interface IGovernanceService
    {
        Task<List<GovernanceActionDto>> GetAllGovernanceActionsAsync(string? type, string? status);
        Task<GovernanceActionDto?> GetGovernanceActionByIdAsync(int id);
    }
}
