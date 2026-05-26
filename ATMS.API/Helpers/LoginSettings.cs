namespace ATMS.API.Helpers
{
    public class LoginSettings
    {
        public bool AllowEmailLogin { get; set; } = false;
        public bool AllowUsernameLogin { get; set; } = false;
        public bool AllowStaffIdLogin { get; set; } = true;
        public string PrimaryLoginMethod { get; set; } = "StaffId";
    }
}