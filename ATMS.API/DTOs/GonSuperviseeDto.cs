using System.Collections.Generic;

namespace ATMS.API.DTOs
{
    public class GonSuperviseeListDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public string StaffId { get; set; } = string.Empty;
        public string ContractStatus { get; set; } = string.Empty;
        public string ContractStatusClass { get; set; } = string.Empty;
    }

    public class GonRaiseConcernDto
    {
        public string ConcernType { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}