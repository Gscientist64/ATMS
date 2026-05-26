using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ATMS.API.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPublicId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PublicId",
                table: "Users",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE ""Users""
                SET ""PublicId"" = gen_random_uuid()
                WHERE ""PublicId"" IS NULL
            ");

            migrationBuilder.AlterColumn<Guid>(
                name: "PublicId",
                table: "Users",
                nullable: false,
                oldClrType: typeof(Guid),
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_PublicId",
                table: "Users",
                column: "PublicId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_PublicId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "Users");
        }
    }
}
