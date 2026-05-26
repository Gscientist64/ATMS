using System;

namespace ATMS.API.DTOs
{
    public class UpdateContractDto
    {
        public string ContractStatus { get; set; } = string.Empty;
        public DateTime? ContractStartDate { get; set; }
        public DateTime? ContractEndDate { get; set; }
    }
}