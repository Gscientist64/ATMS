using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ATMS.API.Migrations
{
    /// <inheritdoc />
    public partial class AddContractLetterSigningFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ContractDate",
                table: "ContractLetters",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "ContractLetters",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSigned",
                table: "ContractLetters",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "JobRoleLabel",
                table: "ContractLetters",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "ContractLetters",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProjectLabel",
                table: "ContractLetters",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReportingLine",
                table: "ContractLetters",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Salary",
                table: "ContractLetters",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SignedAt",
                table: "ContractLetters",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                table: "ContractLetters",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContractDate",
                table: "ContractLetters");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "ContractLetters");

            migrationBuilder.DropColumn(
                name: "IsSigned",
                table: "ContractLetters");

            migrationBuilder.DropColumn(
                name: "JobRoleLabel",
                table: "ContractLetters");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "ContractLetters");

            migrationBuilder.DropColumn(
                name: "ProjectLabel",
                table: "ContractLetters");

            migrationBuilder.DropColumn(
                name: "ReportingLine",
                table: "ContractLetters");

            migrationBuilder.DropColumn(
                name: "Salary",
                table: "ContractLetters");

            migrationBuilder.DropColumn(
                name: "SignedAt",
                table: "ContractLetters");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "ContractLetters");
        }
    }
}
