using System.Collections.Generic;
using System.Threading.Tasks;
using ATMS.API.DTOs;

namespace ATMS.API.Services
{
    public interface IStaffService
    {
        // Profile
        Task<StaffProfileDto> GetProfileAsync(int userId);
        Task<StaffProfileDto> UpdateProfileAsync(int userId, StaffProfileDto dto);
        
        // Timesheets
        Task<List<StaffTimesheetDto>> GetTimesheetsAsync(int userId);
        Task<StaffCurrentTimesheetDto> GetCurrentTimesheetAsync(int userId);
        
        // Leave
        Task<LeaveBalanceDto> GetLeaveBalanceAsync(int userId);
        Task<List<LeaveHistoryDto>> GetLeaveHistoryAsync(int userId);
        Task<LeaveHistoryDto> ApplyForLeaveAsync(int userId, CreateLeaveDto dto);
        Task<bool> CancelLeaveAsync(int userId, int leaveId, CancelLeaveDto? dto);
        
        // Onboarding
        Task<OnboardingStatusDto> GetOnboardingStatusAsync(int userId);
        Task<OnboardingStatusDto> SaveOnboardingStepAsync(int userId, SaveOnboardingStepDto dto);
        Task<OnboardingStatusDto> SubmitOnboardingAsync(int userId, SubmitOnboardingDto dto);
    }
}
