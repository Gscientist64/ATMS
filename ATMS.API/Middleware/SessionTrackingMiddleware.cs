using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using ATMS.API.Services;

namespace ATMS.API.Middleware
{
    public class SessionTrackingMiddleware
    {
        private readonly RequestDelegate _next;

        public SessionTrackingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IUserManagementService userManagementService)
        {
            if (context.User?.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                {
                    
                    _ = userManagementService.UpdateSessionActivityAsync(userId);
                }
            }
            
            await _next(context);
        }
    }
}