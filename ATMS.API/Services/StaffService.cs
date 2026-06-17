using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ATMS.API.Data;
using ATMS.API.DTOs;
using ATMS.API.Models;

namespace ATMS.API.Services
{
    public class StaffService : IStaffService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<StaffService> _logger;

        public StaffService(ApplicationDbContext context, ILogger<StaffService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ==================== Profile ====================

        public async Task<StaffProfileDto> GetProfileAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User not found");

            return MapToProfileDto(user);
        }

        public async Task<StaffProfileDto> UpdateProfileAsync(int userId, StaffProfileDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User not found");

            user.PhoneNumber = dto.PhoneNumber ?? user.PhoneNumber;
            user.BankName = dto.BankName ?? user.BankName;
            user.AccountNumber = dto.AccountNumber ?? user.AccountNumber;
            user.AccountName = dto.AccountName ?? user.AccountName;
            user.EmergencyContactName = dto.EmergencyContactName ?? user.EmergencyContactName;
            user.EmergencyContactPhone = dto.EmergencyContactPhone ?? user.EmergencyContactPhone;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Staff profile updated for user {UserId}", userId);

            return MapToProfileDto(user);
        }

        // ==================== Timesheets ====================

        public async Task<List<StaffTimesheetDto>> GetTimesheetsAsync(int userId)
        {
            var timesheets = await _context.Timesheets
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.Year)
                .ThenByDescending(t => t.CreatedAt)
                .ToListAsync();

            return timesheets.Select(t => new StaffTimesheetDto
            {
                Id = t.Id,
                Month = t.Month,
                Year = t.Year,
                PeriodTotal = $"{t.TotalHours}",
                Status = t.Status,
                SubmittedAt = t.SubmittedAt
            }).ToList();
        }

        public async Task<StaffCurrentTimesheetDto> GetCurrentTimesheetAsync(int userId)
        {
            var now = DateTime.UtcNow;
            var monthName = now.ToString("MMMM");
            
            // Calculate working days in current month (approx)
            var daysInMonth = DateTime.DaysInMonth(now.Year, now.Month);
            var workingDays = 0;
            for (int d = 1; d <= daysInMonth; d++)
            {
                var date = new DateTime(now.Year, now.Month, d);
                if (date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday)
                    workingDays++;
            }

            return new StaffCurrentTimesheetDto
            {
                Month = monthName,
                Year = now.Year,
                TotalWorkingDays = workingDays,
                TotalHours = workingDays * 8,
                Status = "Active"
            };
        }

        // ==================== Leave ====================

        public async Task<LeaveBalanceDto> GetLeaveBalanceAsync(int userId)
        {
            var now = DateTime.UtcNow;
            var balance = await _context.LeaveBalances
                .Where(b => b.UserId == userId && b.Year == now.Year)
                .FirstOrDefaultAsync();

            if (balance == null)
            {
                // Return default balance
                return new LeaveBalanceDto
                {
                    Year = now.Year,
                    TotalDays = 25,
                    TakenDays = 0,
                    RemainingDays = 25,
                    CarryoverDays = 0
                };
            }

            return new LeaveBalanceDto
            {
                Year = balance.Year,
                TotalDays = balance.TotalDays,
                TakenDays = balance.TakenDays,
                RemainingDays = balance.RemainingDays,
                CarryoverDays = balance.CarryoverDays
            };
        }

        public async Task<List<LeaveHistoryDto>> GetLeaveHistoryAsync(int userId)
        {
            var leaves = await _context.LeaveRequests
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            return leaves.Select(l => new LeaveHistoryDto
            {
                Id = l.Id,
                From = l.FromDate,
                To = l.ToDate,
                LeaveType = l.LeaveType,
                TotalDays = l.TotalDays,
                SupervisorStatus = l.SupervisorStatus,
                HrStatus = l.HrStatus,
                CanCancel = l.CanCancel && l.Status == "Pending",
                CreatedAt = l.CreatedAt
            }).ToList();
        }

        public async Task<LeaveHistoryDto> ApplyForLeaveAsync(int userId, CreateLeaveDto dto)
        {
            var totalDays = (dto.ToDate - dto.FromDate).Days + 1;

            var leaveRequest = new LeaveRequest
            {
                UserId = userId,
                LeaveType = dto.LeaveType,
                FromDate = dto.FromDate,
                ToDate = dto.ToDate,
                TotalDays = totalDays,
                Reason = dto.Reason,
                Status = "Pending",
                CanCancel = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.LeaveRequests.Add(leaveRequest);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Leave request created for user {UserId}: {LeaveType} from {From} to {To}",
                userId, dto.LeaveType, dto.FromDate, dto.ToDate);

            return new LeaveHistoryDto
            {
                Id = leaveRequest.Id,
                From = leaveRequest.FromDate,
                To = leaveRequest.ToDate,
                LeaveType = leaveRequest.LeaveType,
                TotalDays = leaveRequest.TotalDays,
                CanCancel = leaveRequest.CanCancel,
                CreatedAt = leaveRequest.CreatedAt
            };
        }

        public async Task<bool> CancelLeaveAsync(int userId, int leaveId, CancelLeaveDto? dto)
        {
            var leave = await _context.LeaveRequests
                .FirstOrDefaultAsync(l => l.Id == leaveId && l.UserId == userId);

            if (leave == null || !leave.CanCancel || leave.Status != "Pending")
                return false;

            leave.Status = "Cancelled";
            leave.CanCancel = false;
            leave.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Leave request {LeaveId} cancelled by user {UserId}", leaveId, userId);

            return true;
        }

        // ==================== Onboarding ====================

        public async Task<OnboardingStatusDto> GetOnboardingStatusAsync(int userId)
        {
            var onboarding = await _context.StaffOnboardings
                .FirstOrDefaultAsync(o => o.UserId == userId);

            if (onboarding == null)
            {
                return new OnboardingStatusDto
                {
                    Id = 0,
                    Status = "NotStarted",
                    CurrentStep = 0
                };
            }

            return new OnboardingStatusDto
            {
                Id = onboarding.Id,
                Status = onboarding.Status,
                CurrentStep = onboarding.CurrentStep,
                SubmittedAt = onboarding.SubmittedAt,
                ApprovedAt = onboarding.ApprovedAt,
                Comments = onboarding.Comments
            };
        }

        public async Task<OnboardingStatusDto> SaveOnboardingStepAsync(int userId, SaveOnboardingStepDto dto)
        {
            var onboarding = await _context.StaffOnboardings
                .FirstOrDefaultAsync(o => o.UserId == userId);

            if (onboarding == null)
            {
                onboarding = new StaffOnboarding
                {
                    UserId = userId,
                    Status = "InProgress",
                    CurrentStep = dto.Step,
                    CreatedAt = DateTime.UtcNow
                };
                _context.StaffOnboardings.Add(onboarding);
            }
            else
            {
                onboarding.CurrentStep = dto.Step;
                onboarding.UpdatedAt = DateTime.UtcNow;
            }

            // Update the relevant step data
            if (dto.Step == 1) onboarding.PersonalInfo = dto.PersonalInfo;
            else if (dto.Step == 2) onboarding.EducationInfo = dto.EducationInfo;
            else if (dto.Step == 3) onboarding.WorkExperience = dto.WorkExperience;
            else if (dto.Step == 4) onboarding.NextOfKinInfo = dto.NextOfKinInfo;
            else if (dto.Step == 5) onboarding.BankPensionInfo = dto.BankPensionInfo;
            else if (dto.Step == 6) onboarding.NinTinInfo = dto.NinTinInfo;
            else if (dto.Step == 7) onboarding.DependentsInfo = dto.DependentsInfo;

            await _context.SaveChangesAsync();

            return new OnboardingStatusDto
            {
                Id = onboarding.Id,
                Status = onboarding.Status,
                CurrentStep = onboarding.CurrentStep
            };
        }

        public async Task<OnboardingStatusDto> SubmitOnboardingAsync(int userId, SubmitOnboardingDto dto)
        {
            var onboarding = await _context.StaffOnboardings
                .FirstOrDefaultAsync(o => o.UserId == userId);

            if (onboarding == null)
            {
                onboarding = new StaffOnboarding
                {
                    UserId = userId,
                    Status = "Submitted",
                    CurrentStep = 8,
                    PersonalInfo = dto.PersonalInfo,
                    EducationInfo = dto.EducationInfo,
                    WorkExperience = dto.WorkExperience,
                    NextOfKinInfo = dto.NextOfKinInfo,
                    BankPensionInfo = dto.BankPensionInfo,
                    NinTinInfo = dto.NinTinInfo,
                    DependentsInfo = dto.DependentsInfo,
                    SubmittedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };
                _context.StaffOnboardings.Add(onboarding);
            }
            else
            {
                onboarding.Status = "Submitted";
                onboarding.SubmittedAt = DateTime.UtcNow;
                onboarding.UpdatedAt = DateTime.UtcNow;
                
                if (!string.IsNullOrEmpty(dto.PersonalInfo)) onboarding.PersonalInfo = dto.PersonalInfo;
                if (!string.IsNullOrEmpty(dto.EducationInfo)) onboarding.EducationInfo = dto.EducationInfo;
                if (!string.IsNullOrEmpty(dto.WorkExperience)) onboarding.WorkExperience = dto.WorkExperience;
                if (!string.IsNullOrEmpty(dto.NextOfKinInfo)) onboarding.NextOfKinInfo = dto.NextOfKinInfo;
                if (!string.IsNullOrEmpty(dto.BankPensionInfo)) onboarding.BankPensionInfo = dto.BankPensionInfo;
                if (!string.IsNullOrEmpty(dto.NinTinInfo)) onboarding.NinTinInfo = dto.NinTinInfo;
                if (!string.IsNullOrEmpty(dto.DependentsInfo)) onboarding.DependentsInfo = dto.DependentsInfo;
            }

            onboarding.Comments = dto.Comments;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Onboarding submitted for user {UserId}", userId);

            return new OnboardingStatusDto
            {
                Id = onboarding.Id,
                Status = onboarding.Status,
                CurrentStep = onboarding.CurrentStep,
                SubmittedAt = onboarding.SubmittedAt
            };
        }

        // ==================== Private Helpers ====================

        private static StaffProfileDto MapToProfileDto(User user)
        {
            return new StaffProfileDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                EmployeeCode = user.EmployeeCode,
                PhoneNumber = user.PhoneNumber,
                Designation = user.Designation,
                Department = user.Department,
                Project = user.Project,
                State = user.State,
                LGA = user.LGA,
                HealthFacility = user.HealthFacility,
                ContractStatus = user.ContractStatus,
                ContractStartDate = user.ContractStartDate,
                ContractEndDate = user.ContractEndDate,
                ProfileImageUrl = user.ProfileImageUrl,
                BankName = user.BankName,
                AccountNumber = user.AccountNumber,
                AccountName = user.AccountName,
                NINName = user.NINName,
                NINNumber = user.NINNumber,
                TINName = user.TINName,
                TINNumber = user.TINNumber,
                EmergencyContactName = user.EmergencyContactName,
                EmergencyContactPhone = user.EmergencyContactPhone,
                Gender = user.Gender,
                LastLoginAt = user.LastLoginAt,
                FailedLoginAttempts = user.FailedLoginAttempts
            };
        }
    }
}
