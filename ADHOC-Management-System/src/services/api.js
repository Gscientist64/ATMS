// src/services/api.js
const API_BASE_URL = 'http://localhost:5087/api'; // Using your current API port

// ==================== Type Definitions ====================
/**
 * @typedef {Object} Employee
 * @property {number} id - Internal database ID (never changes)
 * @property {string} publicId - Stable external ID (use for UI actions)
 * @property {string} employeeCode - HR/business display code
 * @property {string} fullName
 * @property {string} email
 */

// Helper function to handle responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'An error occurred');
    }
    return response.json();
};

// Get auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Get headers with auth token
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

// Auth Service
export const authService = {
    login: async (loginData) => {
        const response = await fetch(`${API_BASE_URL}/Auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        const data = await handleResponse(response);
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
        }
        return data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await fetch(`${API_BASE_URL}/Auth/change-password`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ currentPassword, newPassword })
        });
        return handleResponse(response);
    },

    forgotPassword: async (email) => {
        const response = await fetch(`${API_BASE_URL}/Auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return handleResponse(response);
    },

    getMe: async () => {
        const response = await fetch(`${API_BASE_URL}/Auth/me`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};

// AdHoc Service (Regular Users)
export const adHocService = {
    getProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/AdHoc/profile`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    updateProfile: async (profileData) => {
        const response = await fetch(`${API_BASE_URL}/AdHoc/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(profileData)
        });
        return handleResponse(response);
    },

    uploadSignature: async (signatureImageBase64) => {
        const response = await fetch(`${API_BASE_URL}/AdHoc/signature`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ signatureImageBase64 })
        });
        return handleResponse(response);
    },

    uploadProfilePicture: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/AdHoc/profile-picture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });
        const data = await handleResponse(response);
        return data;
    },
    
    deleteProfilePicture: async () => {
        const response = await fetch(`${API_BASE_URL}/AdHoc/profile-picture`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    deleteSignature: async () => {
        const response = await fetch(`${API_BASE_URL}/AdHoc/signature`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getTimesheets: async () => {
        const response = await fetch(`${API_BASE_URL}/AdHoc/timesheets`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getTimesheet: async (id) => {
        const response = await fetch(`${API_BASE_URL}/AdHoc/timesheets/${id}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getActiveAnnouncements: async () => {
        const response = await fetch(`${API_BASE_URL}/Hris/announcement/active`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    downloadTimesheet: async (id) => {
        const response = await fetch(`${API_BASE_URL}/AdHoc/timesheets/${id}/download`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to download timesheet');
        }
        return response.blob();
    },
    
    exportAllTimesheets: async (tab = 'approved') => {
        const response = await fetch(`${API_BASE_URL}/Programs/timesheets/export?tab=${tab}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to export timesheets');
        }
        return response.blob();
    },

    createTimesheet: async (timesheetData) => {
        const response = await fetch(`${API_BASE_URL}/AdHoc/timesheets`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(timesheetData)
        });
        return handleResponse(response);
    },

    updateTimesheet: async (id, timesheetData) => {
        const response = await fetch(`${API_BASE_URL}/AdHoc/timesheets/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(timesheetData)
        });
        return handleResponse(response);
    },

    submitTimesheet: async (id, comments) => {
        const response = await fetch(`${API_BASE_URL}/AdHoc/timesheets/${id}/submit`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ comments })
        });
        return handleResponse(response);
    },
    
    getUserDocuments: async () => {
        const response = await fetch(`${API_BASE_URL}/AdHoc/documents`, {
          headers: getHeaders()
        });
        return handleResponse(response);
      },
      
      uploadDocument: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/AdHoc/documents/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`
          },
          body: formData
        });
        return handleResponse(response);
      },
      
      deleteDocument: async (id) => {
        const response = await fetch(`${API_BASE_URL}/AdHoc/documents/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        return handleResponse(response);
      }
};

// ========== HRIS Dashboard ==========
export const getHrisDashboard = async (type) => {
    let url = `${API_BASE_URL}/Hris/dashboard`;
    if (type) url += `?type=${type}`;
    const response = await fetch(url, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

// ========== Create Employee ==========
export const createEmployee = async (data) => {
    // Transform frontend data to backend expected format
    const payload = {
        email: data.email,
        fullName: data.fullName,
        password: data.password || 'Password123@',
        phoneNumber: data.phoneNumber,
        role: data.Role || 'AdHoc',
        roleName: data.Role || 'AdHoc',
        designation: data.designation,
        department: data.department,
        state: data.state,
        lga: data.lga,
        healthFacility: data.healthFacility,
        project: data.project,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        ninName: data.ninName,
        ninNumber: data.ninNumber,
        tinName: data.tinName,
        tinNumber: data.tinNumber,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        ecewsSupervisorId: data.ecewsSupervisorId,
        gonSupervisorId: data.gonSupervisorId,
        employeeCode: data.employeeCode,
        contractStatus: data.contractStatus || 'Active'
    };
    
    const response = await fetch(`${API_BASE_URL}/Auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
    });
    return handleResponse(response);
};

// ========== Get ECEWS Employees (for supervisor dropdown) ==========
export const getEcewsEmployees = async () => {
    const response = await fetch(`${API_BASE_URL}/Hris/employees/ecews`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

// ========== Get All Employees ==========
export const getAllEmployees = async (role = null, active = null) => {
    let url = `${API_BASE_URL}/Hris/employees`;
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (active !== null) params.append('active', active);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

// ========== Update Contract Status ==========
export const updateContractStatus = async (userId, data) => {
    const response = await fetch(`${API_BASE_URL}/Hris/employees/${userId}/contract`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

// Update permission matrix
//export const updatePermissionMatrix = async (permissions) => {
  //  const response = await fetch(`${API_BASE_URL}/UserManagement/permissions/matrix`, {
    //    method: 'PUT',
      //  headers: getHeaders(),
       // body: JSON.stringify(permissions)
   // });
   // return handleResponse(response);
//};

// Update permission matrix
export const updatePermissionMatrix = async (updates) => {
    const response = await fetch(`${API_BASE_URL}/UserManagement/permissions/matrix`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ updates })
    });
    return handleResponse(response);
};



// ========== Get Announcements ==========
export const getActiveAnnouncements = async () => {
    const response = await fetch(`${API_BASE_URL}/Hris/announcement/active`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

// ========== Create Announcement ==========
export const createAnnouncement = async (data) => {
    const response = await fetch(`${API_BASE_URL}/Hris/announcement`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

export const configurationService = {
    // Get all projects
    getProjects: async () => {
        const response = await fetch(`${API_BASE_URL}/Configuration/projects`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    
    // Create project
    createProject: async (data) => {
        const response = await fetch(`${API_BASE_URL}/Configuration/projects`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    
    // Update project
    updateProject: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/Configuration/projects/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    
    // Delete project
    deleteProject: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Configuration/projects/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    
    // Get permission settings
    getPermissionSettings: async () => {
        const response = await fetch(`${API_BASE_URL}/Configuration/permissions/settings`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    
    // Update permission settings
    updatePermissionSettings: async (data) => {
        const response = await fetch(`${API_BASE_URL}/Configuration/permissions/settings`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
    
    // Get users by permission
    getUsersByPermission: async (permissionKey) => {
        const response = await fetch(`${API_BASE_URL}/Configuration/permissions/${permissionKey}/users`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    
    // Assign user to permission
    assignUserToPermission: async (permissionKey, userId) => {
        const response = await fetch(`${API_BASE_URL}/Configuration/permissions/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ permissionKey, userId })
        });
        return handleResponse(response);
    },
    
    // Remove user from permission
    removeUserFromPermission: async (permissionKey, userId) => {
        const response = await fetch(`${API_BASE_URL}/Configuration/permissions/${permissionKey}/users/${userId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    
    // Departments
    getDepartments: async () => {
        const response = await fetch(`${API_BASE_URL}/Configuration/departments`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    createDepartment: async (data) => {
        const response = await fetch(`${API_BASE_URL}/Configuration/departments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    updateDepartment: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/Configuration/departments/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    deleteDepartment: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Configuration/departments/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    // Check if user has permission
    hasPermission: async (permissionKey) => {
        const response = await fetch(`${API_BASE_URL}/Configuration/permissions/has-access?permissionKey=${permissionKey}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    }
}

// ========== Get Work Cycles ==========
export const getActiveWorkCycles = async () => {
    const response = await fetch(`${API_BASE_URL}/Hris/workcycle/active`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

// ========== Create Work Cycle ==========
export const createWorkCycle = async (data) => {
    const response = await fetch(`${API_BASE_URL}/Hris/workcycle`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

// Contract Service
export const contractService = {
    getMyContracts: async () => {
        const response = await fetch(`${API_BASE_URL}/Contract/my-contracts`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getContract: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Contract/${id}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    signContract: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Contract/${id}/sign`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({})
        });
        return handleResponse(response);
      },

    downloadContract: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Contract/${id}/download`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to download contract');
        }
        return response.blob();
    },

    getContractLetterById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Contract/letters/${id}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    signContractLetter: async (id, file) => {
        const formData = new FormData();
        formData.append('File', file);
        const response = await fetch(`${API_BASE_URL}/Contract/letters/${id}/sign`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData
        });
        return handleResponse(response);
    }
};

export const saveContractLetter = async (data) => {
    const formData = new FormData();
    formData.append('UserId', data.userId);
    formData.append('File', data.file);
    if (data.fileName) {
        formData.append('FileName', data.fileName);
    }
    if (data.jobRoleLabel) formData.append('JobRoleLabel', data.jobRoleLabel);
    if (data.projectLabel) formData.append('ProjectLabel', data.projectLabel);
    if (data.startDate) formData.append('StartDate', data.startDate.toISOString());
    if (data.endDate) formData.append('EndDate', data.endDate.toISOString());
    if (data.location) formData.append('Location', data.location);
    if (data.reportingLine) formData.append('ReportingLine', data.reportingLine);
    if (data.salary) formData.append('Salary', data.salary);
    if (data.contractDate) formData.append('ContractDate', data.contractDate.toISOString());

    const response = await fetch(`${API_BASE_URL}/Hris/contract-letters/save`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        body: formData
    });
    return handleResponse(response);
};

// Notification Service
export const notificationService = {
    getNotifications: async (page = 1, pageSize = 20) => {
        const response = await fetch(`${API_BASE_URL}/Notification?page=${page}&pageSize=${pageSize}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getUnreadNotifications: async () => {
        const response = await fetch(`${API_BASE_URL}/Notification/unread`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getUnreadCount: async () => {
        const response = await fetch(`${API_BASE_URL}/Notification/unread/count`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    markAsRead: async (notificationIds = [], markAll = false) => {
        const response = await fetch(`${API_BASE_URL}/Notification/mark-read`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ 
                notificationIds: notificationIds,
                markAll: markAll 
            })
        });
        return handleResponse(response);
    },

    deleteNotification: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Notification/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    deleteAllRead: async () => {
        const response = await fetch(`${API_BASE_URL}/Notification/read/all`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};

export const sendContractLetter = async (data) => {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/hris/contract/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API call failed: ${response.status}`);
    }
    return response.json();
};

// ECEWS Supervisor Service
export const ecewsSupervisorService = {
    getDashboard: async () => {
        const response = await fetch(`${API_BASE_URL}/EcewsSupervisor/dashboard`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getTimesheetsForReview: async (tab = 'pending') => {
        const response = await fetch(`${API_BASE_URL}/EcewsSupervisor/timesheets/review?tab=${tab}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getTimesheetDetail: async (id) => {
        const response = await fetch(`${API_BASE_URL}/EcewsSupervisor/timesheets/${id}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    approveTimesheet: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/EcewsSupervisor/timesheets/${id}/approve`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    declineTimesheet: async (id, feedback) => {
        const response = await fetch(`${API_BASE_URL}/EcewsSupervisor/timesheets/${id}/decline`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ feedback })
        });
        return handleResponse(response);
    },

    addComment: async (id, comment) => {
        const response = await fetch(`${API_BASE_URL}/EcewsSupervisor/timesheets/${id}/comments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(comment)
        });
        return handleResponse(response);
    },

    getSupervisees: async (filter = 'all') => {
        const response = await fetch(`${API_BASE_URL}/EcewsSupervisor/supervisees?filter=${filter}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getSuperviseeDetail: async (id) => {
        const response = await fetch(`${API_BASE_URL}/EcewsSupervisor/supervisees/${id}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    downloadTimesheet: async (id) => {
        const response = await fetch(`${API_BASE_URL}/AdHoc/timesheets/${id}/download`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to download timesheet');
        }
        return response.blob();
    },
    
    exportAllTimesheets: async (tab = 'approved') => {
        const response = await fetch(`${API_BASE_URL}/Programs/timesheets/export?tab=${tab}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to export timesheets');
        }
        return response.blob();
    },

    sendAdvisory: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/EcewsSupervisor/supervisees/${id}/advisories`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    }
};

// GON Supervisor Service
export const gonSupervisorService = {
    getDashboard: async () => {
        const response = await fetch(`${API_BASE_URL}/GonSupervisor/dashboard`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getTimesheetsForReview: async (tab = 'pending') => {
        const response = await fetch(`${API_BASE_URL}/GonSupervisor/timesheets/review?tab=${tab}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getTimesheetDetail: async (id) => {
        const response = await fetch(`${API_BASE_URL}/GonSupervisor/timesheets/${id}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    approveTimesheet: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/GonSupervisor/timesheets/${id}/approve`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    declineTimesheet: async (id, feedback) => {
        const response = await fetch(`${API_BASE_URL}/GonSupervisor/timesheets/${id}/decline`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ feedback })
        });
        return handleResponse(response);
    },

    downloadTimesheet: async (id) => {
        const response = await fetch(`${API_BASE_URL}/AdHoc/timesheets/${id}/download`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to download timesheet');
        }
        return response.blob();
    },
    
    exportAllTimesheets: async (tab = 'approved') => {
        const response = await fetch(`${API_BASE_URL}/Programs/timesheets/export?tab=${tab}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error('Failed to export timesheets');
        }
        return response.blob();
    },

    addComment: async (id, comment) => {
        const response = await fetch(`${API_BASE_URL}/GonSupervisor/timesheets/${id}/comments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(comment)
        });
        return handleResponse(response);
    },

    getSupervisees: async () => {
        const response = await fetch(`${API_BASE_URL}/GonSupervisor/supervisees`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    raiseConcern: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/GonSupervisor/supervisees/${id}/concerns`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    }
};

// ========== Additional HRIS Functions (for HrisExecuteActionsPanel and other components) ==========
export const getEmployeeByPublicId = async (publicId) => {
    const response = await fetch(`${API_BASE_URL}/Hris/employees/by-public-id/${publicId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        }
    });
    return handleResponse(response);
};

export const getEmployeeById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/hris/employees/${id}`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

export const getEmployeeDetails = async (id) => {
    const response = await fetch(`${API_BASE_URL}/hris/employees/${id}`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

export const getEmployeeByCode = async (employeeCode) => {
    const response = await fetch(`${API_BASE_URL}/hris/employees/by-code/${employeeCode}`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

export const getContractLetters = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/hris/contract-letters/user/${userId}`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};



// PIP Management
export const initiatePip = async (data) => {
    const response = await fetch(`${API_BASE_URL}/hris/pip`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

export const getPipById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/hris/pip/${id}`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

export const getUserPips = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/hris/pip/user/${userId}`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

export const getAllActivePips = async () => {
    const response = await fetch(`${API_BASE_URL}/hris/pip/active/all`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

export const updatePip = async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/hris/pip/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

export const addPipReview = async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/hris/pip/${id}/review`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

export const endPip = async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/hris/pip/${id}/end`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

// Contract Renewal
export const renewContract = async (data) => {
    const response = await fetch(`${API_BASE_URL}/Hris/contract/renew`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

// Termination
export const terminateEmployee = async (data) => {
    const response = await fetch(`${API_BASE_URL}/Hris/termination`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

export const getTerminationByUser = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/Hris/termination/user/${userId}`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
    return handleResponse(response);
};

export const getAllTerminations = async () => {
    const response = await fetch(`${API_BASE_URL}/Hris/termination/all`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
    return handleResponse(response);
};

// Announcements (additional)
export const getAllAnnouncements = async () => {
    const response = await fetch(`${API_BASE_URL}/hris/announcement/all`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

export const updateAnnouncement = async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/hris/announcement/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

export const deleteAnnouncement = async (id) => {
    const response = await fetch(`${API_BASE_URL}/hris/announcement/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(response);
};

// ========== User Management API Calls ==========

// Get all system users
export const getSystemUsers = async (team = null) => {
    let url = `${API_BASE_URL}/UserManagement/users`;
    if (team) url += `?team=${team}`;
    const response = await fetch(url, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

// Get system user by ID
export const getSystemUserById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/UserManagement/users/${id}`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

// Create system user
export const createSystemUser = async (data) => {
    const response = await fetch(`${API_BASE_URL}/UserManagement/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

// Update system user
export const updateSystemUser = async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/UserManagement/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

// Delete system user
export const deleteSystemUser = async (id) => {
    const response = await fetch(`${API_BASE_URL}/UserManagement/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(response);
};

// Reset user password
export const resetUserPassword = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/UserManagement/users/${userId}/reset-password`, {
        method: 'POST',
        headers: getHeaders()
    });
    return handleResponse(response);
};

// Get permission matrix
export const getPermissionMatrix = async () => {
    const response = await fetch(`${API_BASE_URL}/UserManagement/permissions/matrix`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

// Get active sessions
export const getActiveSessions = async () => {
    const response = await fetch(`${API_BASE_URL}/UserManagement/sessions`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

// End session
export const endSession = async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/UserManagement/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(response);
};

// Get all users for dropdown (for adding new system users)
export const getAllUsersForSystemRole = async () => {
    const response = await fetch(`${API_BASE_URL}/Hris/employees?role=AdHoc`, {
        headers: getHeaders()
    });
    const result = await handleResponse(response);
    // Return the data array directly
    return result.data || result;
};

// Work Cycles (additional)
export const updateWorkCycle = async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/hris/workcycle/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

export const deactivateWorkCycle = async (id) => {
    const response = await fetch(`${API_BASE_URL}/hris/workcycle/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(response);
};

export const sendWorkCycleReminders = async () => {
    const response = await fetch(`${API_BASE_URL}/hris/workcycle/send-reminders`, {
        method: 'POST',
        headers: getHeaders()
    });
    return handleResponse(response);
};

// Employee lists (additional)
export const getAncillaryEmployees = async (params = {}) => {
    let url = `${API_BASE_URL}/Hris/employees/ancillary`;
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.location) queryParams.append('location', params.location);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page);
    if (params.pageSize) queryParams.append('pageSize', params.pageSize);
    
    if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
    }
    
    const response = await fetch(url, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

export const getProgramsEmployees = async () => {
    const response = await fetch(`${API_BASE_URL}/hris/employees/programs`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

// Update staff details (for HR/Programs with permission)
export const updateStaffDetails = async (staffId, data) => {
    const response = await fetch(`${API_BASE_URL}/Hris/employees/${staffId}/details`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

// Governance actions
export const getGovernanceActions = async (type, status) => {
    let url = `${API_BASE_URL}/Hris/governance/actions`;
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

export const getGovernanceActionById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/hris/governance/actions/${id}`, {
        headers: getHeaders()
    });
    return handleResponse(response);
};

// Programs Service
export const programsService = {
    getDashboard: async () => {
        const response = await fetch(`${API_BASE_URL}/Programs/dashboard`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getPersonnel: async (search = '', state = '', status = '') => {
        let url = `${API_BASE_URL}/Programs/personnel?`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (state) url += `state=${encodeURIComponent(state)}&`;
        if (status) url += `status=${encodeURIComponent(status)}&`;
        const response = await fetch(url, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getStaffDetail: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Programs/staff/${id}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    changeLocation: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/Programs/staff/${id}/location`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    manageSupervisors: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/Programs/staff/${id}/supervisors`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    getTimesheetsForReview: async (tab = 'pending') => {
        const response = await fetch(`${API_BASE_URL}/Programs/timesheets/review?tab=${tab}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getTimesheetDetail: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Programs/timesheets/${id}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    approveTimesheet: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/Programs/timesheets/${id}/approve`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    declineTimesheet: async (id, feedback) => {
        const response = await fetch(`${API_BASE_URL}/Programs/timesheets/${id}/decline`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ feedback })
        });
        return handleResponse(response);
    },

    getStaffDocuments: async (staffId) => {
        const response = await fetch(`${API_BASE_URL}/Programs/staff/${staffId}/documents`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    deleteStaffDocument: async (staffId, documentId) => {
        const response = await fetch(`${API_BASE_URL}/Programs/staff/${staffId}/documents/${documentId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    exportAllTimesheets: async (tab = 'approved') => {
        const response = await fetch(`${API_BASE_URL}/Programs/timesheets/export?tab=${tab}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to export timesheets');
        }
        return response.blob();
    },

    exportTimesheetsWithDateRange: async (tab, startDate, endDate) => {
        let url = `${API_BASE_URL}/Programs/timesheets/export?tab=${tab}`;
        if (startDate) url += `&startDate=${startDate.toISOString()}`;
        if (endDate) url += `&endDate=${endDate.toISOString()}`;
        
        const response = await fetch(url, {
            headers: getHeaders()
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to export timesheets');
        }
        return response.blob();
    },

    getGovernanceDashboard: async () => {
        const response = await fetch(`${API_BASE_URL}/Programs/governance`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getGovernanceAdvisoryDetail: async (id) => {
        const response = await fetch(`${API_BASE_URL}/Programs/governance/advisory/${id}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    
    processGovernanceAdvisory: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/Programs/governance/advisory/${id}/action`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(data)
        });
        return handleResponse(response);
    },
};

// Staff Service
export const staffService = {
    getProfile: async () => {
        const response = await fetch(`${API_BASE_URL}/Staff/profile`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    updateProfile: async (data) => {
        const response = await fetch(`${API_BASE_URL}/Staff/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    getTimesheets: async () => {
        const response = await fetch(`${API_BASE_URL}/Staff/timesheets`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getCurrentTimesheet: async () => {
        const response = await fetch(`${API_BASE_URL}/Staff/timesheets/current`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getLeaveBalance: async () => {
        const response = await fetch(`${API_BASE_URL}/Staff/leave/balance`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    getLeaveHistory: async () => {
        const response = await fetch(`${API_BASE_URL}/Staff/leave/history`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    applyForLeave: async (data) => {
        const response = await fetch(`${API_BASE_URL}/Staff/leave/apply`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    cancelLeave: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/Staff/leave/${id}/cancel`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data || {})
        });
        return handleResponse(response);
    },

    getOnboardingStatus: async () => {
        const response = await fetch(`${API_BASE_URL}/Staff/onboarding/status`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    saveOnboardingStep: async (data) => {
        const response = await fetch(`${API_BASE_URL}/Staff/onboarding/step`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    submitOnboarding: async (data) => {
        const response = await fetch(`${API_BASE_URL}/Staff/onboarding/submit`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    }
};

// Export all services as default
const api = {
    auth: authService,
    adHoc: adHocService,
    ecews: ecewsSupervisorService,
    gon: gonSupervisorService,
    contract: contractService,
    notification: notificationService,
    programs: programsService,
    staff: staffService
};

export default api;