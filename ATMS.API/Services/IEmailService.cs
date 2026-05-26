using System.Threading.Tasks;

namespace ATMS.API.Services
{
    public interface IEmailService
    {
        Task SendWelcomeEmailAsync(string toEmail, string staffName, string staffId, string defaultPassword);

        Task SendContractLetterAsync(string toEmail, string staffName, string subject, string htmlContent);
        Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetLink);
    }
}