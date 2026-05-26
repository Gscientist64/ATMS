// ATMS.API/Services/GraphEmailService.cs

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Azure.Identity;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Extensions.Options;
using ATMS.API.Helpers;
using Microsoft.Extensions.Logging;

namespace ATMS.API.Services
{
    public class GraphEmailService : IEmailService
    {
        private readonly GraphSettings _graphSettings;
        private readonly ILogger<GraphEmailService> _logger;

        public GraphEmailService(IOptions<GraphSettings> graphSettings, ILogger<GraphEmailService> logger)
        {
            _graphSettings = graphSettings.Value;
            _logger = logger;
        }

        public async Task SendContractLetterAsync(string toEmail, string staffName, string subject, string htmlContent)
        {
            var credential = new ClientSecretCredential(_graphSettings.TenantId, _graphSettings.ClientId, _graphSettings.ClientSecret);
            var graphClient = new GraphServiceClient(credential);

            var message = new Message
            {
                Subject = subject,
                Body = new ItemBody { ContentType = BodyType.Html, Content = htmlContent },
                ToRecipients = new List<Recipient>
                {
                    new Recipient { EmailAddress = new EmailAddress { Address = toEmail } }
                }
            };
            var requestBody = new Microsoft.Graph.Users.Item.SendMail.SendMailPostRequestBody
            {
                Message = message,
                SaveToSentItems = false
            };
            await graphClient.Users[_graphSettings.SenderEmail].SendMail.PostAsync(requestBody);
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetLink)
        {
            try
            {
                var credential = new ClientSecretCredential(
                    _graphSettings.TenantId,
                    _graphSettings.ClientId,
                    _graphSettings.ClientSecret);

                var graphClient = new GraphServiceClient(credential);

                var subject = "Password Reset Request";
                var body = $@"
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; }}
                            .container {{ max-width: 600px; margin: 0 auto; }}
                            .header {{ background-color: #2c7da0; padding: 20px; text-align: center; color: white; }}
                            .content {{ padding: 20px; }}
                            .button {{ display: inline-block; background-color: #2c7da0; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; }}
                            .footer {{ text-align: center; font-size: 12px; color: #777; margin-top: 20px; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h2>Password Reset Request</h2>
                            </div>
                            <div class='content'>
                                <p>Hello <strong>{userName}</strong>,</p>
                                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                                <p style='text-align: center;'>
                                    <a href='{resetLink}' class='button' style='color: white;'>Reset Password</a>
                                </p>
                                <p>This link will expire in <strong>1 hour</strong>.</p>
                                <p>If you did not request this, please ignore this email.</p>
                            </div>
                            <div class='footer'>
                                <p>ECEWS | Excellence Community Education Welfare Scheme</p>
                            </div>
                        </div>
                    </body>
                    </html>
                ";

                var message = new Message
                {
                    Subject = subject,
                    Body = new ItemBody
                    {
                        ContentType = BodyType.Html,
                        Content = body
                    },
                    ToRecipients = new List<Recipient>
                    {
                        new Recipient
                        {
                            EmailAddress = new EmailAddress
                            {
                                Address = toEmail
                            }
                        }
                    }
                };

                var requestBody = new Microsoft.Graph.Users.Item.SendMail.SendMailPostRequestBody
                {
                    Message = message,
                    SaveToSentItems = false
                };

                await graphClient.Users[_graphSettings.SenderEmail]
                    .SendMail
                    .PostAsync(requestBody);

                _logger.LogInformation("Password reset email sent successfully to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to {Email}", toEmail);
                throw;
            }
        }

        public async Task SendWelcomeEmailAsync(string toEmail, string staffName, string staffId, string defaultPassword)
        {
            try
            {
                var credential = new ClientSecretCredential(
                    _graphSettings.TenantId,
                    _graphSettings.ClientId,
                    _graphSettings.ClientSecret);

                var graphClient = new GraphServiceClient(credential);

                var message = new Message
                {
                    Subject = "Welcome to ECEWS - Your Account Has Been Created",
                    Body = new ItemBody
                    {
                        ContentType = BodyType.Html,
                        Content = GetEmailBody(staffName, staffId, defaultPassword)
                    },
                    ToRecipients = new List<Recipient>
                    {
                        new Recipient
                        {
                            EmailAddress = new EmailAddress
                            {
                                Address = toEmail
                            }
                        }
                    }
                };

                var requestBody = new Microsoft.Graph.Users.Item.SendMail.SendMailPostRequestBody
                {
                    Message = message,
                    SaveToSentItems = false
                };

                await graphClient.Users[_graphSettings.SenderEmail]
                    .SendMail
                    .PostAsync(requestBody);

                _logger.LogInformation("Welcome email sent successfully to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send welcome email to {Email}", toEmail);
                throw;
            }
        }

        private string GetEmailBody(string staffName, string staffId, string defaultPassword)
        {
            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>Welcome to ECEWS</title>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ background-color: #2c7da0; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; color: white; }}
        .content {{ padding: 20px; line-height: 1.5; }}
        .footer {{ text-align: center; font-size: 12px; color: #777777; margin-top: 20px; border-top: 1px solid #eeeeee; padding-top: 10px; }}
        .button {{ display: inline-block; background-color: #2c7da0; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 15px; }}
        .info {{ margin: 15px 0; }}
        .label {{ font-weight: bold; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Welcome to ECEWS</h2>
        </div>
        <div class='content'>
            <p>Dear {staffName},</p>
            <p>Your account has been successfully created.</p>
            <div class='info'>
                <p><span class='label'>Staff ID:</span> {staffId}</p>
                <p><span class='label'>Default Password:</span> {defaultPassword}</p>
                <p><strong>For security reasons, you will be required to change your password upon first login.</strong></p>
            </div>
            <p>Use the link below to log in:</p>
            <p><a href='http://localhost:3000/login' class='button'>Login to ECEWS</a></p>
            <p>If the button doesn't work, copy and paste this URL into your browser:<br>http://localhost:3000/login</p>
            <p>After logging in, please update your password by clicking on your profile icon and selecting ""Change Password"".</p>
        </div>
        <div class='footer'>
            <p>ECEWS | Excellence Community Education Welfare Scheme</p>
        </div>
    </div>
</body>
</html>";
        }
    }
}