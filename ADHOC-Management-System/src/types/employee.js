// Standard employee type - use this across all components
export class Employee {
  constructor(data) {
    this.id = data.id;                    // Internal DB ID (number)
    this.publicId = data.publicId;        // Stable external ID (string)
    this.employeeCode = data.employeeCode;
    this.fullName = data.fullName;
    this.email = data.email;
    this.designation = data.designation;
    this.department = data.department;
    this.state = data.state;
    this.contractStatus = data.contractStatus;
    this.role = data.role;
    // ... other fields as needed
  }
  
  // Helper getters
  getDisplayName() { return this.fullName; }
  getDisplayId() { return this.employeeCode; }
  getActionId() { return this.publicId; }  // Use for API calls
}

// Usage in components:
// const employee = new Employee(response.data);
// <Link to={`/staff/${employee.getActionId()}`}>