// ATMS.API/Services/IAnalyticsService.cs

using System.Threading.Tasks;
using ATMS.API.DTOs;

namespace ATMS.API.Services
{
    public interface IAnalyticsService
    {
        Task<HrisDashboardDto> GetHrisDashboardAsync(string? type = null);
    }
}