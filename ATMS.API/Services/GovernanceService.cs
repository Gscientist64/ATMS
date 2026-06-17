using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ATMS.API.Data;
using ATMS.API.DTOs;

namespace ATMS.API.Services
{
    public class GovernanceService : IGovernanceService
    {
        private readonly ApplicationDbContext _context;

        public GovernanceService(ApplicationDbContext context)
        {
            _context = context;
        }

        private static string GetCategoryDisplay(string type) => type switch
        {
            "Renewal" => "Contract Renewal",
            "PIP" => "PIP Advisory",
            "Termination" => "Termination Advisory",
            _ => type,
        };

        public async Task<List<GovernanceActionDto>> GetAllGovernanceActionsAsync(string? type, string? status)
        {
            var advisories = await _context.Advisories
                .Include(a => a.IssuedBy)
                .Include(a => a.TargetUser)
                .Where(a => a.Status == "Pending")
                .ToListAsync();

            var concerns = await _context.Concerns
                .Include(c => c.RaisedBy)
                .Include(c => c.TargetUser)
                .Where(c => c.Status == "Open")
                .ToListAsync();

            var recommendations = await _context.ContractRecommendations
                .Include(r => r.RecommendedBy)
                .Include(r => r.TargetUser)
                .Where(r => r.Status == "Pending")
                .ToListAsync();

            var actions = new List<GovernanceActionDto>();

            actions.AddRange(advisories.Select(a => new GovernanceActionDto
            {
                Id = a.Id,
                Category = GetCategoryDisplay(a.AdvisoryType),
                StaffName = a.TargetUser?.FullName ?? "Unknown",
                StaffRole = a.TargetUser?.Designation ?? "Not specified",
                RaisedBy = a.IssuedBy?.FullName ?? "Unknown",
                DateRaised = a.IssuedAt,
                Justification = a.Justification,
                Status = a.Status,
                PublicId = a.TargetUser?.PublicId ?? "",
                EmployeeCode = a.TargetUser?.EmployeeCode ?? "",
                StaffEmail = a.TargetUser?.Email ?? "",
            }));

            actions.AddRange(concerns.Select(c => new GovernanceActionDto
            {
                Id = c.Id,
                Category = "Concern",
                StaffName = c.TargetUser?.FullName ?? "Unknown",
                StaffRole = c.TargetUser?.Designation ?? "Not specified",
                RaisedBy = c.RaisedBy?.FullName ?? "Unknown",
                DateRaised = c.RaisedAt,
                Justification = c.Description,
                Status = c.Status,
                PublicId = c.TargetUser?.PublicId ?? "",
                EmployeeCode = c.TargetUser?.EmployeeCode ?? "",
                StaffEmail = c.TargetUser?.Email ?? "",
            }));

            actions.AddRange(recommendations.Select(r => new GovernanceActionDto
            {
                Id = r.Id,
                Category = GetCategoryDisplay(r.RecommendationType),
                StaffName = r.TargetUser?.FullName ?? "Unknown",
                StaffRole = r.TargetUser?.Designation ?? "Not specified",
                RaisedBy = r.RecommendedBy?.FullName ?? "Unknown",
                DateRaised = r.RecommendedAt,
                Justification = r.Reason ?? "",
                Status = r.Status,
                PublicId = r.TargetUser?.PublicId ?? "",
                EmployeeCode = r.TargetUser?.EmployeeCode ?? "",
                StaffEmail = r.TargetUser?.Email ?? "",
            }));

            if (!string.IsNullOrWhiteSpace(type))
            {
                actions = actions
                    .Where(a => a.Category.Contains(type, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                actions = actions
                    .Where(a => a.Status.Contains(status, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            return actions.OrderByDescending(a => a.DateRaised).ToList();
        }

        public async Task<GovernanceActionDto?> GetGovernanceActionByIdAsync(int id)
        {
            var advisory = await _context.Advisories
                .Include(a => a.IssuedBy)
                .Include(a => a.TargetUser)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (advisory != null)
            {
                return new GovernanceActionDto
                {
                    Id = advisory.Id,
                    Category = GetCategoryDisplay(advisory.AdvisoryType),
                    StaffName = advisory.TargetUser?.FullName ?? "Unknown",
                    StaffRole = advisory.TargetUser?.Designation ?? "Not specified",
                    RaisedBy = advisory.IssuedBy?.FullName ?? "Unknown",
                    DateRaised = advisory.IssuedAt,
                    Justification = advisory.Justification,
                    Status = advisory.Status,
                    PublicId = advisory.TargetUser?.PublicId ?? "",
                    EmployeeCode = advisory.TargetUser?.EmployeeCode ?? "",
                    StaffEmail = advisory.TargetUser?.Email ?? "",
                };
            }

            var concern = await _context.Concerns
                .Include(c => c.RaisedBy)
                .Include(c => c.TargetUser)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (concern != null)
            {
                return new GovernanceActionDto
                {
                    Id = concern.Id,
                    Category = "Concern",
                    StaffName = concern.TargetUser?.FullName ?? "Unknown",
                    StaffRole = concern.TargetUser?.Designation ?? "Not specified",
                    RaisedBy = concern.RaisedBy?.FullName ?? "Unknown",
                    DateRaised = concern.RaisedAt,
                    Justification = concern.Description,
                    Status = concern.Status,
                    PublicId = concern.TargetUser?.PublicId ?? "",
                    EmployeeCode = concern.TargetUser?.EmployeeCode ?? "",
                    StaffEmail = concern.TargetUser?.Email ?? "",
                };
            }

            var recommendation = await _context.ContractRecommendations
                .Include(r => r.RecommendedBy)
                .Include(r => r.TargetUser)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (recommendation != null)
            {
                return new GovernanceActionDto
                {
                    Id = recommendation.Id,
                    Category = GetCategoryDisplay(recommendation.RecommendationType),
                    StaffName = recommendation.TargetUser?.FullName ?? "Unknown",
                    StaffRole = recommendation.TargetUser?.Designation ?? "Not specified",
                    RaisedBy = recommendation.RecommendedBy?.FullName ?? "Unknown",
                    DateRaised = recommendation.RecommendedAt,
                    Justification = recommendation.Reason ?? "",
                    Status = recommendation.Status,
                    PublicId = recommendation.TargetUser?.PublicId ?? "",
                    EmployeeCode = recommendation.TargetUser?.EmployeeCode ?? "",
                    StaffEmail = recommendation.TargetUser?.Email ?? "",
                };
            }

            return null;
        }
    }
}
