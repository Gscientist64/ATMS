namespace ATMS.API.DTOs
{
    public class HrisEmployeeSummaryDto
    {
        public int Id { get; set; }
        public string PublicId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public string StaffId { get; set; } = string.Empty;
        public string ContractStatus { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Initials { get; set; } = string.Empty;
        public int FlagsCount { get; set; }
        public string Role { get; set; } = string.Empty;
    }
}