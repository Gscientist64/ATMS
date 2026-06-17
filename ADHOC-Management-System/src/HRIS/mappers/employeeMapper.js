export const mapEmployee = (emp) => {
    if (!emp) return null
  
    return {
      id: emp.id,
      publicId: emp.publicId || emp.staffPublicId || emp.employeeCode || emp.id,
      employeeCode: emp.employeeCode,
      fullName: emp.fullName || emp.staffName,
      email: emp.email || emp.staffEmail || ''
    }
  }