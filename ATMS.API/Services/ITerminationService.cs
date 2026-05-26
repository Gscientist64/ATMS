using System.Collections.Generic;
using System.Threading.Tasks;
using ATMS.API.DTOs;

namespace ATMS.API.Services
{
    public interface ITerminationService
    {
        Task<TerminationDto> TerminateEmployeeAsync(int terminatedById, CreateTerminationDto dto);
        Task<TerminationDto> GetTerminationByUserIdAsync(int userId);
        Task<List<TerminationDto>> GetAllTerminationsAsync();
    }
}