using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ATMS.API.Data;
using ATMS.API.DTOs;

namespace ATMS.API.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AnalyticsService> _logger;

        public AnalyticsService(ApplicationDbContext context, ILogger<AnalyticsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<HrisDashboardDto> GetHrisDashboardAsync(string? type = null)
        {
            try
            {
                // Get all users with roles
                var allUsers = await _context.Users
                    .Include(u => u.Role)
                    .ToListAsync();

                // Filter users based on dashboard type
                // ECEWS = users whose project indicates ECEWS (or role is EcewsSupervisor)
                // Ancillary = users with role AdHoc
                var ecewsUsers = allUsers.Where(u =>
                    u.Role?.Name == "EcewsSupervisor" ||
                    u.Project == "ACE-5" ||
                    u.Project == "SPEED" ||
                    u.Project == "Global Fund" ||
                    u.Role?.Name == "Programs").ToList();

                var ancillaryUsers = allUsers.Where(u =>
                    u.Role?.Name == "AdHoc" ||
                    u.Role?.Name == "GonSupervisor").ToList();

                // Determine which user set to use based on type
                var filteredUsers = type?.ToLower() switch
                {
                    "ecews" => ecewsUsers,
                    "ancillary" => ancillaryUsers,
                    _ => allUsers // unified or null
                };

                var activeUsers = filteredUsers.Where(u => u.IsActive).ToList();
                var totalWorkforce = filteredUsers.Count;
                var activeEmployees = activeUsers.Count;

                // Count active PIPs
                var activePips = await _context.PerformanceImprovementPlans
                    .CountAsync(p => p.Status == "Active");

                // Count users on leave
                var onLeave = 0;

                // ECEWS Distribution (always show full breakdown)
                var ecewsTotal = ecewsUsers.Count;
                var ecewsActive = ecewsUsers.Count(u => u.IsActive);

                // Ancillary Distribution
                var ancillaryTotal = ancillaryUsers.Count;
                var ancillaryActive = ancillaryUsers.Count(u => u.IsActive);

                // Count flagged ancillary staff
                var flaggedUserIds = await _context.Concerns
                    .Where(c => c.Status == "Open")
                    .Select(c => c.TargetUserId)
                    .Distinct()
                    .ToListAsync();
                var ancillaryFlagged = ancillaryUsers.Count(u => flaggedUserIds.Contains(u.Id));

                // Timesheet compliance (based on filtered users)
                var currentYear = DateTime.UtcNow.Year;
                var monthlyCompliance = new List<int>();
                var filteredUserIds = filteredUsers.Select(u => u.Id).ToHashSet();
                
                for (int month = 1; month <= 12; month++)
                {
                    var startDate = new DateTime(currentYear, month, 1, 0, 0, 0, DateTimeKind.Utc);
                    var endDate = startDate.AddMonths(1);
                    
                    var totalSubmitted = await _context.Timesheets
                        .CountAsync(t =>
                            filteredUserIds.Contains(t.UserId) &&
                            t.SubmittedAt != default &&
                            t.SubmittedAt >= startDate &&
                            t.SubmittedAt < endDate);
                    
                    var totalUsersCount = filteredUsers.Count;
                    var compliance = totalUsersCount > 0 ? (int)((double)totalSubmitted / totalUsersCount * 100) : 0;
                    monthlyCompliance.Add(compliance);
                }

                // Gender distribution (filtered)
                int maleCount = filteredUsers.Count(u => u.Gender == "Male" || u.Gender == "M");
                int femaleCount = filteredUsers.Count(u => u.Gender == "Female" || u.Gender == "F");

                var totalWithGender = maleCount + femaleCount;

                if (totalWithGender == 0)
                {
                    maleCount = (int)(activeEmployees * 0.6);
                    femaleCount = activeEmployees - maleCount;
                    totalWithGender = activeEmployees;
                }

                // Employment status
                var confirmedCount = activeEmployees;
                var probationCount = totalWorkforce - activeEmployees;

                return new HrisDashboardDto
                {
                    TotalWorkforce = totalWorkforce,
                    ActiveEmployees = activeEmployees,
                    OnLeave = onLeave,
                    ActivePips = activePips,
                    EcewsDistribution = new WorkforceDistributionDto
                    {
                        Total = ecewsTotal,
                        Categories = new[]
                        {
                            new CategoryDto { Label = "Confirmed", Value = ecewsActive, Icon = "check" },
                            new CategoryDto { Label = "Probation", Value = ecewsTotal - ecewsActive, Icon = "bag" },
                            new CategoryDto { Label = "On Leave", Value = 0, Icon = "clock" }
                        }.ToList()
                    },
                    AncillaryDistribution = new AncillaryDistributionDto
                    {
                        Total = ancillaryTotal,
                        Active = ancillaryActive,
                        OnPip = 0,
                        Flagged = ancillaryFlagged,
                        Categories = new[]
                        {
                            new CategoryDto { Label = "Active", Value = ancillaryActive, Icon = "check" },
                            new CategoryDto { Label = "On PIP", Value = 0, Icon = "pip" },
                            new CategoryDto { Label = "Flagged", Value = ancillaryFlagged, Icon = "flag" }
                        }.ToList()
                    },
                    TimesheetCompliance = new TimesheetComplianceDto
                    {
                        MonthlyData = monthlyCompliance
                    },
                    GenderDiversity = new GenderDiversityDto
                    {
                        Male = maleCount,
                        Female = femaleCount,
                        MalePercentage = totalWithGender > 0 ? (maleCount * 100 / totalWithGender) : 0,
                        FemalePercentage = totalWithGender > 0 ? (femaleCount * 100 / totalWithGender) : 0
                    },
                    EmploymentStatus = new EmploymentStatusDto
                    {
                        Confirmed = confirmedCount,
                        Probation = probationCount
                    },
                    LeaveDistribution = new LeaveDistributionDto
                    {
                        Applied = 0,
                        Approved = 0,
                        LeaveTypes = new List<LeaveTypeDto>()
                    },
                    AppraisalActivity = new AppraisalActivityDto
                    {
                        GoalSettingCompleted = 0,
                        GoalSettingPending = 0,
                        AnnualAppraisalCompleted = 0,
                        AnnualAppraisalPending = 0
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting HRIS dashboard");
                return new HrisDashboardDto
                {
                    TotalWorkforce = 0,
                    ActiveEmployees = 0,
                    OnLeave = 0,
                    ActivePips = 0,
                    EcewsDistribution = new WorkforceDistributionDto { Total = 0, Categories = new List<CategoryDto>() },
                    AncillaryDistribution = new AncillaryDistributionDto { Total = 0, Categories = new List<CategoryDto>() },
                    TimesheetCompliance = new TimesheetComplianceDto { MonthlyData = Enumerable.Repeat(0, 12).ToList() },
                    GenderDiversity = new GenderDiversityDto { Male = 0, Female = 0, MalePercentage = 0, FemalePercentage = 0 },
                    EmploymentStatus = new EmploymentStatusDto { Confirmed = 0, Probation = 0 },
                    LeaveDistribution = new LeaveDistributionDto { Applied = 0, Approved = 0, LeaveTypes = new List<LeaveTypeDto>() },
                    AppraisalActivity = new AppraisalActivityDto { GoalSettingCompleted = 0, GoalSettingPending = 0, AnnualAppraisalCompleted = 0, AnnualAppraisalPending = 0 }
                };
            }
        }
    }
}