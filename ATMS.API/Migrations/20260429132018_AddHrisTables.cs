using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ATMS.API.Migrations
{
    /// <inheritdoc />
    public partial class AddHrisTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Announcements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    Priority = table.Column<string>(type: "text", nullable: false),
                    Audience = table.Column<string>(type: "text", nullable: false),
                    CreatedById = table.Column<int>(type: "integer", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Announcements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Announcements_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PerformanceImprovementPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    InitiatedById = table.Column<int>(type: "integer", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Objective = table.Column<string>(type: "text", nullable: false),
                    ActionPlan = table.Column<string>(type: "text", nullable: false),
                    SuccessCriteria = table.Column<string>(type: "text", nullable: true),
                    SupportProvided = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletionOutcome = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerformanceImprovementPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PerformanceImprovementPlans_Users_InitiatedById",
                        column: x => x.InitiatedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PerformanceImprovementPlans_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TerminationRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    TerminatedById = table.Column<int>(type: "integer", nullable: true),
                    EffectiveDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    AdditionalNotes = table.Column<string>(type: "text", nullable: true),
                    EquipmentReturned = table.Column<bool>(type: "boolean", nullable: false),
                    HandoverDocumentsSubmitted = table.Column<bool>(type: "boolean", nullable: false),
                    ExitInterviewCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    SystemAccessRevoked = table.Column<bool>(type: "boolean", nullable: false),
                    SeveranceProcessed = table.Column<bool>(type: "boolean", nullable: false),
                    ChecklistNotApplicable = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TerminationRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TerminationRecords_Users_TerminatedById",
                        column: x => x.TerminatedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TerminationRecords_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkCycles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CycleType = table.Column<string>(type: "text", nullable: false),
                    StartDay = table.Column<string>(type: "text", nullable: false),
                    EndDay = table.Column<string>(type: "text", nullable: false),
                    Repeat = table.Column<string>(type: "text", nullable: false),
                    Audience = table.Column<string>(type: "text", nullable: false),
                    CreateAnnouncement = table.Column<bool>(type: "boolean", nullable: false),
                    Reminder = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedById = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkCycles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkCycles_Users_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PipReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PipId = table.Column<int>(type: "integer", nullable: false),
                    ReviewerId = table.Column<int>(type: "integer", nullable: false),
                    ReviewDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Comments = table.Column<string>(type: "text", nullable: false),
                    Rating = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PipReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PipReviews_PerformanceImprovementPlans_PipId",
                        column: x => x.PipId,
                        principalTable: "PerformanceImprovementPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PipReviews_Users_ReviewerId",
                        column: x => x.ReviewerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Announcements_CreatedById",
                table: "Announcements",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_PerformanceImprovementPlans_InitiatedById",
                table: "PerformanceImprovementPlans",
                column: "InitiatedById");

            migrationBuilder.CreateIndex(
                name: "IX_PerformanceImprovementPlans_UserId",
                table: "PerformanceImprovementPlans",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PipReviews_PipId",
                table: "PipReviews",
                column: "PipId");

            migrationBuilder.CreateIndex(
                name: "IX_PipReviews_ReviewerId",
                table: "PipReviews",
                column: "ReviewerId");

            migrationBuilder.CreateIndex(
                name: "IX_TerminationRecords_TerminatedById",
                table: "TerminationRecords",
                column: "TerminatedById");

            migrationBuilder.CreateIndex(
                name: "IX_TerminationRecords_UserId",
                table: "TerminationRecords",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkCycles_CreatedById",
                table: "WorkCycles",
                column: "CreatedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Announcements");

            migrationBuilder.DropTable(
                name: "PipReviews");

            migrationBuilder.DropTable(
                name: "TerminationRecords");

            migrationBuilder.DropTable(
                name: "WorkCycles");

            migrationBuilder.DropTable(
                name: "PerformanceImprovementPlans");
        }
    }
}
