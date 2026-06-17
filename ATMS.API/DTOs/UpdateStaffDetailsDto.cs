namespace ATMS.API.DTOs
{
    public class UpdateStaffDetailsDto
    {
        public string? PhoneNumber { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? BankName { get; set; }
        public string? AccountNumber { get; set; }
        public string? AccountName { get; set; }
        public string? NINName { get; set; }
        public string? NINNumber { get; set; }
        public string? TINName { get; set; }
        public string? TINNumber { get; set; }
    }
}