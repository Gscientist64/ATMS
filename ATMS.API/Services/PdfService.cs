using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ATMS.API.DTOs;

namespace ATMS.API.Services
{
    public interface IPdfService
    {
        Task<byte[]> GenerateTimesheetPdf(TimesheetDetailDto timesheet);
    }

    public class PdfService : IPdfService
    {
        public PdfService()
        {
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public Task<byte[]> GenerateTimesheetPdf(TimesheetDetailDto timesheet)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header()
                        .Text("Timesheet")
                        .FontSize(20)
                        .Bold()
                        .AlignCenter();

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(column =>
                        {
                            // Employee Information
                            column.Item().Text("Employee Information").FontSize(14).Bold();
                            column.Item().PaddingTop(5).Row(row =>
                            {
                                row.RelativeItem().Text($"Name: {timesheet.FullName}");
                                row.RelativeItem().Text($"Department: {timesheet.Department}");
                            });
                            column.Item().PaddingTop(5).Row(row =>
                            {
                                row.RelativeItem().Text($"Month: {timesheet.MonthYear}");
                                row.RelativeItem().Text($"Status: {timesheet.Status}");
                            });
                            column.Item().PaddingTop(5).Text($"Total Hours: {timesheet.TotalHours}");

                            column.Item().PaddingTop(15).Text("Timesheet Entries").FontSize(14).Bold();

                            // Entries Table
                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                    columns.RelativeColumn(2);
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Text("Date");
                                    header.Cell().Text("Start Time");
                                    header.Cell().Text("End Time");
                                    header.Cell().Text("Hours");
                                    header.Cell().Text("Work Done");
                                });

                                foreach (var entry in timesheet.Entries)
                                {
                                    table.Cell().Text(entry.Date);
                                    table.Cell().Text(entry.StartTime);
                                    table.Cell().Text(entry.EndTime);
                                    table.Cell().Text(entry.TotalHours);
                                    table.Cell().Text(entry.WorkDone);
                                }
                            });
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Generated on ");
                            x.Span(DateTime.Now.ToString("dd-MM-yyyy HH:mm"));
                        });
                });
            });

            return Task.FromResult(document.GeneratePdf());
        }
    }
}