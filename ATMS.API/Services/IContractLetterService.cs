using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using ATMS.API.DTOs;

namespace ATMS.API.Services
{
    public interface IContractLetterService
    {
        Task<ContractLetterDto> SaveContractLetterAsync(SaveContractLetterDto dto, int generatedByUserId);
        Task<ContractLetterDto> GetLatestContractLetterByUserIdAsync(int userId);
        Task<List<ContractLetterDto>> GetContractLettersByUserIdAsync(int userId);
        Task<ContractLetterDto?> GetContractLetterByIdAsync(int id, int userId);
        Task<ContractLetterDto> MarkContractLetterSignedAsync(int id, int userId, IFormFile signedFile);
    }
}
