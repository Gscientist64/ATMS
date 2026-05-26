using System.Threading.Tasks;
using ATMS.API.DTOs;

namespace ATMS.API.Services
{
    public interface IContractLetterService
    {
        Task<ContractLetterDto> SaveContractLetterAsync(SaveContractLetterDto dto, int generatedByUserId);
        Task<ContractLetterDto> GetLatestContractLetterByUserIdAsync(int userId);
        Task<List<ContractLetterDto>> GetContractLettersByUserIdAsync(int userId);
    }
}