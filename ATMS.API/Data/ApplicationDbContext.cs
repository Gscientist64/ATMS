using Microsoft.EntityFrameworkCore;
using ATMS.API.Models;

namespace ATMS.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Timesheet> Timesheets { get; set; }
        public DbSet<TimesheetEntry> TimesheetEntries { get; set; }
        public DbSet<Approval> Approvals { get; set; }
        public DbSet<Supervision> Supervisions { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Contract> Contracts { get; set; }
        public DbSet<Concern> Concerns { get; set; }
        public DbSet<Advisory> Advisories { get; set; }
        public DbSet<ContractRecommendation> ContractRecommendations { get; set; }
        public DbSet<WorkflowStage> WorkflowStages { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // User relationships
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<User>()
                .HasOne(u => u.EcewsSupervisor)
                .WithMany(u => u.EcewsSupervisees)
                .HasForeignKey(u => u.EcewsSupervisorId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<User>()
                .HasOne(u => u.GonSupervisor)
                .WithMany(u => u.GonSupervisees)
                .HasForeignKey(u => u.GonSupervisorId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Timesheet relationships
            modelBuilder.Entity<Timesheet>()
                .HasOne(t => t.User)
                .WithMany(u => u.Timesheets)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Timesheet>()
                .HasOne(t => t.GonReviewer)
                .WithMany()
                .HasForeignKey(t => t.GonReviewerId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Timesheet>()
                .HasOne(t => t.EcewsReviewer)
                .WithMany()
                .HasForeignKey(t => t.EcewsReviewerId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // TimesheetEntry relationships
            modelBuilder.Entity<TimesheetEntry>()
                .HasOne(e => e.Timesheet)
                .WithMany(t => t.Entries)
                .HasForeignKey(e => e.TimesheetId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Comment relationships
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Timesheet)
                .WithMany(t => t.CommentsList)
                .HasForeignKey(c => c.TimesheetId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Approval relationships
            modelBuilder.Entity<Approval>()
                .HasOne(a => a.Timesheet)
                .WithMany(t => t.Approvals)
                .HasForeignKey(a => a.TimesheetId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Approval>()
                .HasOne(a => a.Approver)
                .WithMany(u => u.Approvals)
                .HasForeignKey(a => a.ApproverId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Supervision relationships
            modelBuilder.Entity<Supervision>()
                .HasOne(s => s.Supervisor)
                .WithMany()
                .HasForeignKey(s => s.SupervisorId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Supervision>()
                .HasOne(s => s.Supervisee)
                .WithMany()
                .HasForeignKey(s => s.SuperviseeId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Concern relationships
            modelBuilder.Entity<Concern>()
                .HasOne(c => c.Timesheet)
                .WithMany()
                .HasForeignKey(c => c.TimesheetId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Concern>()
                .HasOne(c => c.RaisedBy)
                .WithMany()
                .HasForeignKey(c => c.RaisedById)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Concern>()
                .HasOne(c => c.TargetUser)
                .WithMany()
                .HasForeignKey(c => c.TargetUserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Advisory relationships
            modelBuilder.Entity<Advisory>()
                .HasOne(a => a.IssuedBy)
                .WithMany()
                .HasForeignKey(a => a.IssuedById)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Advisory>()
                .HasOne(a => a.TargetUser)
                .WithMany()
                .HasForeignKey(a => a.TargetUserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Advisory>()
                .HasOne(a => a.Timesheet)
                .WithMany()
                .HasForeignKey(a => a.TimesheetId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Contract Recommendation relationships
            modelBuilder.Entity<ContractRecommendation>()
                .HasOne(c => c.Timesheet)
                .WithMany()
                .HasForeignKey(c => c.TimesheetId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ContractRecommendation>()
                .HasOne(c => c.RecommendedBy)
                .WithMany()
                .HasForeignKey(c => c.RecommendedById)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<ContractRecommendation>()
                .HasOne(c => c.TargetUser)
                .WithMany()
                .HasForeignKey(c => c.TargetUserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // WorkflowStage relationships
            modelBuilder.Entity<WorkflowStage>()
                .HasOne(w => w.Timesheet)
                .WithMany(t => t.WorkflowStages)
                .HasForeignKey(w => w.TimesheetId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<WorkflowStage>()
                .HasOne(w => w.CompletedByUser)
                .WithMany()
                .HasForeignKey(w => w.CompletedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Contract relationships
            modelBuilder.Entity<Contract>()
                .HasOne(c => c.User)
                .WithMany(u => u.Contracts)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Unique constraints
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
            
            modelBuilder.Entity<User>()
                .HasIndex(u => u.EmployeeCode)
                .IsUnique();
            
            modelBuilder.Entity<Role>()
                .HasIndex(r => r.Name)
                .IsUnique();
            
            // Seed roles
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "AdHoc", Description = "Regular Ad-Hoc staff" },
                new Role { Id = 2, Name = "EcewsSupervisor", Description = "ECEWS Supervisor" },
                new Role { Id = 3, Name = "GonSupervisor", Description = "GON Supervisor" }
            );
        }
    }
}