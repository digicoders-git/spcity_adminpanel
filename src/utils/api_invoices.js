
// Invoices APIs
export const invoicesAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/invoices${query ? `?${query}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/invoices/${id}`),
  
  create: (invoiceData) => apiRequest('/invoices', {
    method: 'POST',
    body: invoiceData,
  }),
  
  update: (id, invoiceData) => apiRequest(`/invoices/${id}`, {
    method: 'PUT',
    body: invoiceData,
  }),
  
  delete: (id) => apiRequest(`/invoices/${id}`, {
    method: 'DELETE',
  }),

  updateStatus: (id, status) => apiRequest(`/invoices/${id}/status`, {
    method: 'PUT',
    body: { status },
  }),

  getStats: () => apiRequest('/invoices/stats'),
};
