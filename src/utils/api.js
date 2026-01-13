const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sp-city-backend.onrender.com/api';

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Only set Content-Type for non-FormData requests
  if (config.body && !(config.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

// Auth APIs
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  }),
  
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: userData,
  }),
  
  getProfile: () => apiRequest('/auth/me'),
  
  updateProfile: (profileData) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: profileData,
  }),
  
  changePassword: (passwordData) => apiRequest('/auth/change-password', {
    method: 'PUT',
    body: passwordData,
  }),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => apiRequest('/dashboard/stats'),
  getChartData: () => apiRequest('/dashboard/charts'),
  getLeadsTrend: (period = '180') => apiRequest(`/dashboard/charts/leads-trend?period=${period}`),
  getRevenueTrend: (period = '180') => apiRequest(`/dashboard/charts/revenue-trend?period=${period}`),
  getProjectStatus: () => apiRequest('/dashboard/charts/project-status'),
};

// Associates APIs
export const associatesAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/associates${query ? `?${query}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/associates/${id}`),
  
  create: (associateData) => apiRequest('/associates', {
    method: 'POST',
    body: associateData,
  }),
  
  update: (id, associateData) => apiRequest(`/associates/${id}`, {
    method: 'PUT',
    body: associateData,
  }),
  
  changePassword: (id, passwordData) => apiRequest(`/associates/${id}/password`, {
    method: 'PUT',
    body: passwordData,
  }),
  
  delete: (id) => apiRequest(`/associates/${id}`, {
    method: 'DELETE',
  }),
  
  updateStatus: (id, status) => apiRequest(`/associates/${id}/status`, {
    method: 'PUT',
    body: { status },
  }),
  
  // Associate profile APIs
  getProfile: () => apiRequest('/associates/profile'),
  
  updateProfile: (profileData) => apiRequest('/associates/profile', {
    method: 'PUT',
    body: profileData,
  }),
};

// Leads APIs
export const leadsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/leads${query ? `?${query}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/leads/${id}`),
  
  create: (leadData) => apiRequest('/leads', {
    method: 'POST',
    body: leadData,
  }),
  
  update: (id, leadData) => apiRequest(`/leads/${id}`, {
    method: 'PUT',
    body: leadData,
  }),
  
  delete: (id) => apiRequest(`/leads/${id}`, {
    method: 'DELETE',
  }),
  
  updateStatus: (id, status) => apiRequest(`/leads/${id}/status`, {
    method: 'PUT',
    body: { status },
  }),
  
  assignToAssociate: (id, associateId) => apiRequest(`/leads/${id}/assign`, {
    method: 'PUT',
    body: { associateId },
  }),
};

// Projects APIs
export const projectsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/projects${query ? `?${query}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/projects/${id}`),
  
  create: (projectData) => apiRequest('/projects', {
    method: 'POST',
    body: projectData,
  }),
  
  update: (id, projectData) => apiRequest(`/projects/${id}`, {
    method: 'PUT',
    body: projectData,
  }),
  
  delete: (id) => apiRequest(`/projects/${id}`, {
    method: 'DELETE',
  }),
  
  updateStatus: (id, status) => apiRequest(`/projects/${id}/status`, {
    method: 'PUT',
    body: { status },
  }),
  
  completeProject: (id) => apiRequest(`/projects/${id}/complete`, {
    method: 'PUT',
  }),
};

// Sites APIs
export const sitesAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/sites${query ? `?${query}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/sites/${id}`),
  
  create: (siteData) => apiRequest('/sites', {
    method: 'POST',
    body: siteData,
  }),
  
  update: (id, siteData) => apiRequest(`/sites/${id}`, {
    method: 'PUT',
    body: siteData,
  }),
  
  delete: (id) => apiRequest(`/sites/${id}`, {
    method: 'DELETE',
  }),
};

// Payments APIs
export const paymentsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/payments${query ? `?${query}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/payments/${id}`),
  
  create: (paymentData) => apiRequest('/payments', {
    method: 'POST',
    body: paymentData,
  }),
  
  update: (id, paymentData) => apiRequest(`/payments/${id}`, {
    method: 'PUT',
    body: paymentData,
  }),
  
  delete: (id) => apiRequest(`/payments/${id}`, {
    method: 'DELETE',
  }),
  
  updateStatus: (id, status) => apiRequest(`/payments/${id}/status`, {
    method: 'PUT',
    body: { status },
  }),
};

// Site Visits APIs
export const siteVisitsAPI = {
  getAll: () => apiRequest('/site-visits'),
  
  create: (visitData) => apiRequest('/site-visits', {
    method: 'POST',
    body: visitData,
  }),
  
  update: (id, visitData) => apiRequest(`/site-visits/${id}`, {
    method: 'PUT',
    body: visitData,
  }),
  
  delete: (id) => apiRequest(`/site-visits/${id}`, {
    method: 'DELETE',
  }),
};

// Commission APIs
export const commissionsAPI = {
  getAll: () => apiRequest('/commissions'),
  
  getStats: () => apiRequest('/commissions/stats'),
  
  getWithdrawals: () => apiRequest('/commissions/withdrawals'),
  
  requestWithdrawal: (withdrawalData) => apiRequest('/commissions/withdrawals', {
    method: 'POST',
    body: withdrawalData,
  }),
  
  // Admin APIs
  getDashboardStats: () => apiRequest('/commissions/admin/dashboard'),
  
  getAllWithdrawals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/commissions/admin/withdrawals${query ? `?${query}` : ''}`);
  },
  
  processWithdrawal: (id, data) => apiRequest(`/commissions/admin/withdrawals/${id}`, {
    method: 'PUT',
    body: data,
  }),
  
  generateCommission: (paymentId) => apiRequest(`/commissions/generate/${paymentId}`, {
    method: 'POST',
  }),
  
  approveProject: (projectId) => apiRequest(`/commissions/approve-project/${projectId}`, {
    method: 'PUT',
  }),
};