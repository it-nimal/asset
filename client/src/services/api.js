/**
 * Streamlined Enterprise REST Client for IT Asset Management System
 * Standardized HTTP handler with 100% backward-compatible function signatures
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const { params, body, headers = {}, ...customConfig } = options;
  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        searchParams.append(key, val);
      }
    });
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const config = {
    method: options.method || 'GET',
    headers: {
      ...(body && typeof body === 'object' && !(body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...headers,
    },
    ...customConfig,
  };

  if (body) {
    config.body = typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(body) : body;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorMsg = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (err) {
    throw err;
  }
}

const http = {
  get: (url, params, config) => request(url, { method: 'GET', params, ...config }),
  post: (url, body, config) => request(url, { method: 'POST', body, ...config }),
  put: (url, body, config) => request(url, { method: 'PUT', body, ...config }),
  delete: (url, config) => request(url, { method: 'DELETE', ...config }),
};

export const api = {
  // 1. Health & System Seeding
  async getHealth() {
    try {
      return await http.get('/health');
    } catch (err) {
      return { status: 'OFFLINE', database: { connected: false }, error: err.message };
    }
  },
  clearAllData: () => http.delete('/assets/system/clear-all'),
  seedDemoData: () => http.post('/assets/seed/demo-data'),
  feedUserData: () => http.post('/assets/system/feed-user-data'),

  // 2. Assets & Hardware Master
  getStats: () => http.get('/assets/stats/summary'),
  getStatsSummary() {
    return this.getStats();
  },
  async getWarrantySummary() {
    const res = await http.get('/warranty/summary');
    return res.data || {};
  },
  getAssets: (params) => http.get('/assets', params),
  async getAssetById(id) {
    const res = await http.get(`/assets/${id}`);
    return res.data || res;
  },
  createAsset: (data) => http.post('/assets', data),
  updateAsset: (id, data) => http.put(`/assets/${id}`, data),
  deleteAsset: (id, actorName = 'IT Admin') => http.delete(`/assets/${id}`, { params: { actorName } }),
  getAvailableAssets: (params) => http.get('/assets/available', params),
  allocateAssets: (data) => http.post('/assets/allocate', data),
  assignAsset: (id, data) => http.post(`/assets/${id}/assign`, data),
  returnAsset: (id, data) => http.post(`/assets/${id}/return`, data),
  transferAsset: (id, data) => http.post(`/assets/${id}/transfer`, data),
  returnFromMaintenance: (id, data) => http.post(`/assets/${id}/maintenance-return`, data),
  retireAsset: (id, data) => http.post(`/assets/${id}/retire`, data),
  acknowledgeAssetReceipt: (id, data) => http.post(`/assets/${id}/acknowledge`, data),
  bulkImportAssets: (items, overwrite = false, actor = 'IT Admin') =>
    http.post('/assets/bulk-import', { items, overwrite, actor }),
  seedSampleMasterRow: () => http.post('/assets/seed/sample-master-row'),

  // 3. Organization & Employees
  getEmployees: () => http.get('/employees'),
  async getEmployeeById(id) {
    const res = await http.get(`/employees/${id}`);
    return res.data || res;
  },
  createEmployee: (data) => http.post('/employees', data),
  createEmployeesBulk: (employees, options = {}) => http.post('/employees/bulk', { employees, ...options }),
  updateEmployee: (id, data) => http.put(`/employees/${id}`, data),
  deleteEmployee: (id) => http.delete(`/employees/${id}`),
  async getEmployeeAssets(id) {
    const res = await http.get(`/employees/${id}/assets`);
    return res.data || [];
  },
  async getEmployeeHistory(id) {
    const res = await http.get(`/employees/${id}/history`);
    return res.data || [];
  },
  offboardEmployee: (id, data) => http.post(`/employees/${id}/exit`, data),

  // 4. Departments, Locations & Vendors
  getDepartments: () => http.get('/departments'),
  createDepartment: (data) => http.post('/departments', data),
  updateDepartment: (id, data) => http.put(`/departments/${id}`, data),
  deleteDepartment: (id) => http.delete(`/departments/${id}`),

  getLocations: () => http.get('/locations'),
  createLocation: (data) => http.post('/locations', data),
  updateLocation: (id, data) => http.put(`/locations/${id}`, data),
  deleteLocation: (id) => http.delete(`/locations/${id}`),

  getVendors: () => http.get('/vendors'),
  createVendor: (data) => http.post('/vendors', data),
  updateVendor: (id, data) => http.put(`/vendors/${id}`, data),
  deleteVendor: (id) => http.delete(`/vendors/${id}`),

  // 5. Software Asset Management (SAM)
  getSoftware: () => http.get('/software'),
  async getSoftwareById(id) {
    const res = await http.get(`/software/${id}`);
    return res.data || res;
  },
  createSoftware: (data) => http.post('/software', data),
  updateSoftware: (id, data) => http.put(`/software/${id}`, data),
  deleteSoftware: (id) => http.delete(`/software/${id}`),

  // 6. Network Infrastructure Devices
  getNetworkDevices: () => http.get('/network-devices'),
  async getNetworkDeviceById(id) {
    const res = await http.get(`/network-devices/${id}`);
    return res.data || res;
  },
  createNetworkDevice: (data) => http.post('/network-devices', data),
  updateNetworkDevice: (id, data) => http.put(`/network-devices/${id}`, data),
  deleteNetworkDevice: (id) => http.delete(`/network-devices/${id}`),

  // 7. Maintenance & Repairs
  getMaintenance: (params) => http.get('/maintenance', params),
  async getMaintenanceById(id) {
    const res = await http.get(`/maintenance/${id}`);
    return res.data || res;
  },
  createMaintenance: (data) => http.post('/maintenance', data),
  updateMaintenance: (id, data) => http.put(`/maintenance/${id}`, data),
  diagnoseMaintenance: (id, data) => http.post(`/maintenance/${id}/diagnose`, data),
  startRepairMaintenance: (id, data) => http.post(`/maintenance/${id}/start-repair`, data),
  qcMaintenance: (id, data) => http.post(`/maintenance/${id}/qc`, data),
  completeMaintenance: (id, data) => http.post(`/maintenance/${id}/complete`, data),
  cancelMaintenance: (id, data) => http.post(`/maintenance/${id}/cancel`, data),
  reportAssetIssue: (id, data) => http.post(`/assets/${id}/report-issue`, data),
  async getAssetMaintenanceHistory(id) {
    const res = await http.get(`/assets/${id}/maintenance`);
    return res.data || [];
  },
  async getEmployeeMaintenanceHistory(id) {
    const res = await http.get(`/maintenance/employee/${id}`);
    return res.data || [];
  },
  resolveMaintenance: (id, data) => http.put(`/maintenance/${id}/resolve`, data),
  deleteMaintenance: (id) => http.delete(`/maintenance/${id}`),

  // 8. Inward Procurement & Receiving
  getInwards: (params) => http.get('/inward', params),
  async getInwardById(id) {
    const res = await http.get(`/inward/${id}`);
    return res.data || res;
  },
  createInward: (data) => http.post('/inward', data),
  updateInward: (id, data) => http.put(`/inward/${id}`, data),
  verifyInwardAssets: (id, data) => http.post(`/inward/${id}/verify`, data),
  createAssetsFromInward: (id, data) => http.post(`/inward/${id}/create-assets`, data),
  deleteInward: (id) => http.delete(`/inward/${id}`),

  // 9. Asset Transfers & Custodian Handovers
  getTransfers: (params) => http.get('/transfers', params),
  async getTransferById(id) {
    const res = await http.get(`/transfers/${id}`);
    return res.data || res;
  },
  createTransfer: (data) => http.post('/transfers', data),
  approveTransfer: (id, data) => http.post(`/transfers/${id}/approve`, data),
  handoverTransfer: (id, data) => http.post(`/transfers/${id}/handover`, data),
  acknowledgeTransfer: (id, data) => http.post(`/transfers/${id}/acknowledge`, data),
  cancelTransfer: (id, data) => http.post(`/transfers/${id}/cancel`, data),
  async getAssetTransfers(id) {
    const res = await http.get(`/assets/${id}/transfers`);
    return res.data || [];
  },
  async getEmployeeTransfers(id) {
    const res = await http.get(`/transfers/employee/${id}`);
    return res.data || [];
  },

  // 10. Procurement (PO & Invoices)
  getPurchaseOrders: () => http.get('/procurement/orders'),
  createPurchaseOrder: (data) => http.post('/procurement/orders', data),
  updatePurchaseOrder: (id, data) => http.put(`/procurement/orders/${id}`, data),
  deletePurchaseOrder: (id) => http.delete(`/procurement/orders/${id}`),

  getInvoices: () => http.get('/procurement/invoices'),
  createInvoice: (data) => http.post('/procurement/invoices', data),
  updateInvoice: (id, data) => http.put(`/procurement/invoices/${id}`, data),
  deleteInvoice: (id) => http.delete(`/procurement/invoices/${id}`),

  // 11. Audit Logs
  async getAuditLogs() {
    const res = await http.get('/assets/audit-logs');
    return res.data || [];
  },
  createAuditLog: (data) => http.post('/assets/audit-logs', data),
  clearAuditLogs: () => http.delete('/assets/audit-logs/clear'),

  // 12. Notifications
  async getNotifications() {
    const res = await http.get('/assets/notifications');
    return res.data || [];
  },
  createNotification: (data) => http.post('/assets/notifications', data),
  markNotificationRead: (id) => http.put(`/assets/notifications/${id}/read`),
  markAllNotificationsRead: () => http.put('/assets/notifications/read-all'),
  deleteNotification: (id) => http.delete(`/assets/notifications/${id}`),
  clearNotifications: () => http.delete('/assets/notifications/clear-all'),

  // 13. Settings & Master Config
  async getMasterSettings() {
    const res = await http.get('/settings/master-data');
    return res.data || {};
  },
  updateMasterSettings: (data) => http.put('/settings/master-data', data),

  // 14. Authentication & User Management
  login: (email, password) => http.post('/auth/login', { email, password }),
  getUsers: () => http.get('/auth/users'),
  createUser: (data) => http.post('/auth/users', data),

  // Aliases for seamless legacy usage
  acknowledgeAsset(id, data) { return this.acknowledgeAssetReceipt(id, data); },
  bulkImport(items, overwrite, actor) { return this.bulkImportAssets(items, overwrite, actor); },
  seedSampleMaster() { return this.seedSampleMasterRow(); },
  bulkImportEmployees(employees, options) { return this.createEmployeesBulk(employees, options); },
  employeeExit(id, exitData) { return this.offboardEmployee(id, exitData); },
  verifyInward(id, data) { return this.verifyInwardAssets(id, data); },
};

// Domain API Wrappers for direct modular import
export const assetApi = {
  getStats: (...args) => api.getStats(...args),
  getStatsSummary: (...args) => api.getStatsSummary(...args),
  getWarrantySummary: (...args) => api.getWarrantySummary(...args),
  getAssets: (...args) => api.getAssets(...args),
  getAssetById: (...args) => api.getAssetById(...args),
  createAsset: (...args) => api.createAsset(...args),
  updateAsset: (...args) => api.updateAsset(...args),
  deleteAsset: (...args) => api.deleteAsset(...args),
  getAvailableAssets: (...args) => api.getAvailableAssets(...args),
  allocateAssets: (...args) => api.allocateAssets(...args),
  assignAsset: (...args) => api.assignAsset(...args),
  returnAsset: (...args) => api.returnAsset(...args),
  retireAsset: (...args) => api.retireAsset(...args),
  acknowledgeAsset: (...args) => api.acknowledgeAssetReceipt(...args),
  bulkImport: (...args) => api.bulkImportAssets(...args),
  seedSampleMaster: (...args) => api.seedSampleMasterRow(...args),
};

export const employeeApi = {
  getEmployees: (...args) => api.getEmployees(...args),
  getEmployeeById: (...args) => api.getEmployeeById(...args),
  createEmployee: (...args) => api.createEmployee(...args),
  bulkImportEmployees: (...args) => api.createEmployeesBulk(...args),
  updateEmployee: (...args) => api.updateEmployee(...args),
  deleteEmployee: (...args) => api.deleteEmployee(...args),
  getEmployeeAssets: (...args) => api.getEmployeeAssets(...args),
  getEmployeeHistory: (...args) => api.getEmployeeHistory(...args),
  employeeExit: (...args) => api.offboardEmployee(...args),
};

export const transferApi = {
  getTransfers: (...args) => api.getTransfers(...args),
  getTransferById: (...args) => api.getTransferById(...args),
  createTransfer: (...args) => api.createTransfer(...args),
  approveTransfer: (...args) => api.approveTransfer(...args),
  handoverTransfer: (...args) => api.handoverTransfer(...args),
  acknowledgeTransfer: (...args) => api.acknowledgeTransfer(...args),
  cancelTransfer: (...args) => api.cancelTransfer(...args),
  getAssetTransfers: (...args) => api.getAssetTransfers(...args),
  getEmployeeTransfers: (...args) => api.getEmployeeTransfers(...args),
};

export const maintenanceApi = {
  getMaintenance: (...args) => api.getMaintenance(...args),
  getMaintenanceById: (...args) => api.getMaintenanceById(...args),
  createMaintenance: (...args) => api.createMaintenance(...args),
  updateMaintenance: (...args) => api.updateMaintenance(...args),
  diagnoseMaintenance: (...args) => api.diagnoseMaintenance(...args),
  startRepairMaintenance: (...args) => api.startRepairMaintenance(...args),
  qcMaintenance: (...args) => api.qcMaintenance(...args),
  completeMaintenance: (...args) => api.completeMaintenance(...args),
  cancelMaintenance: (...args) => api.cancelMaintenance(...args),
  reportAssetIssue: (...args) => api.reportAssetIssue(...args),
  getAssetMaintenanceHistory: (...args) => api.getAssetMaintenanceHistory(...args),
  getEmployeeMaintenanceHistory: (...args) => api.getEmployeeMaintenanceHistory(...args),
  resolveMaintenance: (...args) => api.resolveMaintenance(...args),
  deleteMaintenance: (...args) => api.deleteMaintenance(...args),
};

export const inwardApi = {
  getInwards: (...args) => api.getInwards(...args),
  getInwardById: (...args) => api.getInwardById(...args),
  createInward: (...args) => api.createInward(...args),
  updateInward: (...args) => api.updateInward(...args),
  verifyInward: (...args) => api.verifyInwardAssets(...args),
  createAssetsFromInward: (...args) => api.createAssetsFromInward(...args),
  deleteInward: (...args) => api.deleteInward(...args),
};

export const orgApi = {
  getDepartments: (...args) => api.getDepartments(...args),
  createDepartment: (...args) => api.createDepartment(...args),
  updateDepartment: (...args) => api.updateDepartment(...args),
  deleteDepartment: (...args) => api.deleteDepartment(...args),
  getLocations: (...args) => api.getLocations(...args),
  createLocation: (...args) => api.createLocation(...args),
  updateLocation: (...args) => api.updateLocation(...args),
  deleteLocation: (...args) => api.deleteLocation(...args),
  getVendors: (...args) => api.getVendors(...args),
  createVendor: (...args) => api.createVendor(...args),
  updateVendor: (...args) => api.updateVendor(...args),
  deleteVendor: (...args) => api.deleteVendor(...args),
};

export const softwareApi = {
  getSoftware: (...args) => api.getSoftware(...args),
  createSoftware: (...args) => api.createSoftware(...args),
  updateSoftware: (...args) => api.updateSoftware(...args),
  deleteSoftware: (...args) => api.deleteSoftware(...args),
  getNetworkDevices: (...args) => api.getNetworkDevices(...args),
  createNetworkDevice: (...args) => api.createNetworkDevice(...args),
  updateNetworkDevice: (...args) => api.updateNetworkDevice(...args),
  deleteNetworkDevice: (...args) => api.deleteNetworkDevice(...args),
};

export const procurementApi = {
  getPurchaseOrders: (...args) => api.getPurchaseOrders(...args),
  createPurchaseOrder: (...args) => api.createPurchaseOrder(...args),
  updatePurchaseOrder: (...args) => api.updatePurchaseOrder(...args),
  deletePurchaseOrder: (...args) => api.deletePurchaseOrder(...args),
  getInvoices: (...args) => api.getInvoices(...args),
  createInvoice: (...args) => api.createInvoice(...args),
  updateInvoice: (...args) => api.updateInvoice(...args),
  deleteInvoice: (...args) => api.deleteInvoice(...args),
};

export const systemApi = {
  getHealth: (...args) => api.getHealth(...args),
  getAuditLogs: (...args) => api.getAuditLogs(...args),
  createAuditLog: (...args) => api.createAuditLog(...args),
  clearAuditLogs: (...args) => api.clearAuditLogs(...args),
  getNotifications: (...args) => api.getNotifications(...args),
  createNotification: (...args) => api.createNotification(...args),
  markNotificationRead: (...args) => api.markNotificationRead(...args),
  markAllNotificationsRead: (...args) => api.markAllNotificationsRead(...args),
  deleteNotification: (...args) => api.deleteNotification(...args),
  clearNotifications: (...args) => api.clearNotifications(...args),
  getMasterSettings: (...args) => api.getMasterSettings(...args),
  updateMasterSettings: (...args) => api.updateMasterSettings(...args),
  clearAllData: (...args) => api.clearAllData(...args),
  seedDemoData: (...args) => api.seedDemoData(...args),
  feedUserData: (...args) => api.feedUserData(...args),
};

export default api;
