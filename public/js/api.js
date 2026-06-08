// Common API Fetch Handlers for Edushield
const API = {
  // Base request handler with JSON parsing and common errors checks
  request: async (url, options = {}) => {
    // Default headers to JSON
    if (options.body && !(options.body instanceof FormData)) {
      options.headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };
      if (typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
      }
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error(`API Request Failed [${url}]:`, error.message);
      throw error;
    }
  },

  // Auth requests
  login: (instituteId, password) => 
    API.request('/api/auth/login', { method: 'POST', body: { instituteId, password } }),
  
  logout: () => 
    API.request('/api/auth/logout', { method: 'POST' }),
  
  getMe: () => 
    API.request('/api/auth/me'),

  sendOTP: (identifier, type) => 
    API.request('/api/auth/send-otp', { method: 'POST', body: { identifier, type } }),
  
  verifyOTP: (identifier, code, type) => 
    API.request('/api/auth/verify-otp', { method: 'POST', body: { identifier, code, type } }),
  
  resetPassword: (token, newPassword) => 
    API.request('/api/auth/reset-password', { method: 'POST', body: { token, newPassword } }),

  // Institute requests
  getInstituteMe: () => 
    API.request('/api/institutes/me'),
  
  getAdminInstitutes: () => 
    API.request('/api/institutes/admin'),
  
  getPublicInstitutes: () => 
    API.request('/api/institutes/public'),
  
  registerInstitute: (formData) => 
    API.request('/api/institutes/register', { method: 'POST', body: formData }),

  updateCompliance: (complianceData) => 
    API.request('/api/institutes/compliance', { method: 'PUT', body: complianceData }),

  updateSettings: (settingsData) => 
    API.request('/api/institutes/settings', { method: 'PUT', body: settingsData }),

  // Pending registries (admin only)
  getPendingInstitutes: () => 
    API.request('/api/admin/pending-institutes'),
  
  updatePendingInstitute: (id, action) => 
    API.request('/api/admin/pending-institutes', { method: 'PUT', body: { id, action } }),

  // Pincode lookup
  lookupPincode: (pincode) => 
    API.request(`/api/pincode/${pincode}`),

  // Student requests
  getStudentsList: () => 
    API.request('/api/students/list'),
  
  registerStudent: (studentData) => 
    API.request('/api/students/register', { method: 'POST', body: studentData }),

  // Complaints
  submitComplaint: (complaintData) => 
    API.request('/api/complaints', { method: 'POST', body: complaintData }),

  // Public directory lookup
  queryPublicInstitutes: (pincode = '') => 
    API.request(`/api/public/institutes?pincode=${pincode}`),

  // File Upload
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return API.request('/api/upload', {
      method: 'POST',
      body: formData
    });
  },

  // OCR Document parse
  scanOCR: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return API.request('/api/ocr', {
      method: 'POST',
      body: formData
    });
  }
};
