const API_BASE = '/api';

export const api = {
  // ==========================================
  // 1. HEALTH & SYSTEM
  // ==========================================
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (err) {
      return { status: 'OFFLINE', database: { connected: false }, error: err.message };
    }
  },

  async clearAllData() {
    const res = await fetch(`${API_BASE}/assets/system/clear-all`, { method: 'DELETE' });
    return await res.json();
  },

  async seedDemoData() {
    const res = await fetch(`${API_BASE}/assets/seed/demo-data`, { method: 'POST' });
    return await res.json();
  },

  async feedUserData() {
    const res = await fetch(`${API_BASE}/assets/system/feed-user-data`, { method: 'POST' });
    return await res.json();
  },

  // ==========================================
  // 2. ASSETS
  // ==========================================
  async getStats() {
    const res = await fetch(`${API_BASE}/assets/stats/summary`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  },

  async getStatsSummary() {
    return this.getStats();
  },

  async getWarrantySummary() {
    const res = await fetch(`${API_BASE}/warranty/summary`);
    const data = await res.json();
    return data.data || {};
  },

  async getAssets({ search = '', status = 'All', location = 'All', plant = '', category = '', deviceType = '', department = '', vendor = '' } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') params.append('status', status);
    if (location && location !== 'All') params.append('plant', location);
    if (plant && plant !== 'All') params.append('plant', plant);
    if (category && category !== 'All') params.append('category', category);
    if (deviceType && deviceType !== 'All') params.append('deviceType', deviceType);
    if (department && department !== 'All') params.append('department', department);
    if (vendor && vendor !== 'All') params.append('vendor', vendor);

    const res = await fetch(`${API_BASE}/assets?${params.toString()}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch assets');
    }
    return await res.json();
  },

  async getAssetById(id) {
    const res = await fetch(`${API_BASE}/assets/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch asset');
    return data.data || data;
  },

  async createAsset(assetData) {
    const res = await fetch(`${API_BASE}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create asset');
    return data;
  },

  async updateAsset(id, assetData) {
    const res = await fetch(`${API_BASE}/assets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update asset');
    return data;
  },

  async deleteAsset(id, actorName = 'IT Admin') {
    const res = await fetch(`${API_BASE}/assets/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete asset');
    return data;
  },

  async getAvailableAssets({ search = '', category = '', deviceType = '', location = '' } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);
    if (deviceType && deviceType !== 'All') params.append('deviceType', deviceType);
    if (location && location !== 'All') params.append('location', location);

    const res = await fetch(`${API_BASE}/assets/available?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch available assets');
    return data.data || [];
  },

  async allocateAssets(payload) {
    const res = await fetch(`${API_BASE}/assets/allocate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to allocate asset(s)');
    return data;
  },

  async assignAsset(id, data) {
    const res = await fetch(`${API_BASE}/assets/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Failed to assign asset');
    return resData;
  },

  async returnAsset(id, data) {
    const res = await fetch(`${API_BASE}/assets/${id}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Failed to return asset');
    return resData;
  },

  async transferAsset(id, data) {
    const res = await fetch(`${API_BASE}/assets/${id}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Failed to transfer asset');
    return resData;
  },

  async returnFromMaintenance(id, data) {
    const res = await fetch(`${API_BASE}/assets/${id}/maintenance-return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Failed to return asset from maintenance');
    return resData;
  },

  async retireAsset(id, data) {
    const res = await fetch(`${API_BASE}/assets/${id}/retire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Failed to retire asset');
    return resData;
  },

  async bulkImportAssets(items, overwrite = false, actorName = 'IT Admin') {
    const res = await fetch(`${API_BASE}/assets/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, overwrite, actorName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Bulk import failed');
    return data;
  },

  async seedSampleMasterRow() {
    const res = await fetch(`${API_BASE}/assets/seed/sample-master-row`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to seed sample master row');
    return data;
  },

  getExportMasterCSVUrl() {
    return `${API_BASE}/assets/export-master-csv`;
  },

  // ==========================================
  // 3. AUTHENTICATION & USERS
  // ==========================================
  async login(email, password) {
    const res = await fetch(`${API_BASE}/assets/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/assets/auth/users`);
    const data = await res.json();
    return data.data || [];
  },

  async getUserById(id) {
    const res = await fetch(`${API_BASE}/assets/auth/users/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'User not found');
    return data.data;
  },

  async createUser(userData) {
    const res = await fetch(`${API_BASE}/assets/auth/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create user');
    return data;
  },

  async updateUser(id, userData) {
    const res = await fetch(`${API_BASE}/assets/auth/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update user');
    return data;
  },

  async deleteUser(id) {
    const res = await fetch(`${API_BASE}/assets/auth/users/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete user');
    return data;
  },

  // ==========================================
  // 4. EMPLOYEES & ORGANIZATION
  // ==========================================
  async getEmployees() {
    const res = await fetch(`${API_BASE}/assets/employees`);
    const data = await res.json();
    return data.data || [];
  },

  async getEmployeeById(id) {
    const res = await fetch(`${API_BASE}/assets/employees/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Employee not found');
    return data.data;
  },

  async createEmployee(empData) {
    const res = await fetch(`${API_BASE}/assets/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create employee');
    return data;
  },

  async createEmployeesBulk(employees, options = {}) {
    const res = await fetch(`${API_BASE}/assets/employees/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employees,
        actorName: options.actorName || 'IT Admin',
        updateExisting: Boolean(options.updateExisting),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to bulk import employees');
    return data;
  },

  async updateEmployee(id, empData) {
    const res = await fetch(`${API_BASE}/assets/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update employee');
    return data;
  },

  async deleteEmployee(id, actorName = 'IT Admin') {
    const res = await fetch(`${API_BASE}/assets/employees/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete employee');
    return data;
  },

  async getEmployeeAssets(id) {
    const res = await fetch(`${API_BASE}/assets/employees/${id}/assets`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch employee assets');
    return data.data || [];
  },

  async getEmployeeHistory(id) {
    const res = await fetch(`${API_BASE}/assets/employees/${id}/history`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch employee history');
    return data.data || [];
  },

  async offboardEmployee(id, exitData) {
    const res = await fetch(`${API_BASE}/assets/employees/${id}/exit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exitData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to offboard employee');
    return data;
  },

  async acknowledgeAssetReceipt(assetId, data = {}) {
    return this.updateAsset(assetId, {
      receiptAcknowledged: true,
      receiptAcknowledgedAt: new Date(),
      acknowledgementNotes: data.notes || 'Asset received in good working condition',
      actorName: data.actorName || 'Employee',
    });
  },

  // ==========================================
  // MAINTENANCE & REPAIRS
  // ==========================================
  async getMaintenance({ status = 'All', search = '', assetId = '', employeeId = '', priority = 'All', issueCategory = 'All' } = {}) {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);
    if (assetId) params.append('assetId', assetId);
    if (employeeId) params.append('employeeId', employeeId);
    if (priority && priority !== 'All') params.append('priority', priority);
    if (issueCategory && issueCategory !== 'All') params.append('issueCategory', issueCategory);

    const res = await fetch(`${API_BASE}/assets/maintenance?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch maintenance records');
    return data.data || [];
  },

  async getMaintenanceById(id) {
    const res = await fetch(`${API_BASE}/assets/maintenance/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch maintenance record');
    return data.data || data;
  },

  async createMaintenance(payload) {
    const res = await fetch(`${API_BASE}/assets/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create maintenance request');
    return data;
  },

  async updateMaintenance(id, payload) {
    const res = await fetch(`${API_BASE}/assets/maintenance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update maintenance record');
    return data;
  },

  async diagnoseMaintenance(id, payload) {
    const res = await fetch(`${API_BASE}/assets/maintenance/${id}/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to record diagnosis');
    return data;
  },

  async startRepairMaintenance(id, payload) {
    const res = await fetch(`${API_BASE}/assets/maintenance/${id}/start-repair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update repair status');
    return data;
  },

  async qcMaintenance(id, payload) {
    const res = await fetch(`${API_BASE}/assets/maintenance/${id}/qc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to record QC evaluation');
    return data;
  },

  async completeMaintenance(id, payload) {
    const res = await fetch(`${API_BASE}/assets/maintenance/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to complete maintenance');
    return data;
  },

  async cancelMaintenance(id, payload = {}) {
    const res = await fetch(`${API_BASE}/assets/maintenance/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to cancel maintenance request');
    return data;
  },

  async reportAssetIssue(assetId, issueData = {}) {
    const res = await fetch(`${API_BASE}/assets/${assetId}/report-issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issueData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to report asset issue');
    return data;
  },

  async getAssetMaintenanceHistory(assetId) {
    const res = await fetch(`${API_BASE}/assets/${assetId}/maintenance`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch asset maintenance history');
    return data.data || [];
  },

  async getEmployeeMaintenanceHistory(employeeId) {
    const res = await fetch(`${API_BASE}/assets/employees/${employeeId}/maintenance`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch employee maintenance history');
    return data.data || [];
  },

  // ==========================================
  // ASSET TRANSFERS & HANDOVERS
  // ==========================================
  async getTransfers({ status = 'All', search = '', assetId = '', employeeId = '', fromEmployeeId = '', toEmployeeId = '' } = {}) {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);
    if (assetId) params.append('assetId', assetId);
    if (employeeId) params.append('employeeId', employeeId);
    if (fromEmployeeId) params.append('fromEmployeeId', fromEmployeeId);
    if (toEmployeeId) params.append('toEmployeeId', toEmployeeId);

    const res = await fetch(`${API_BASE}/transfers?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch transfers');
    return data.data || [];
  },

  async getTransferById(id) {
    const res = await fetch(`${API_BASE}/transfers/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch transfer record');
    return data.data || data;
  },

  async createTransfer(payload) {
    const res = await fetch(`${API_BASE}/transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create transfer request');
    return data;
  },

  async approveTransfer(id, payload = {}) {
    const res = await fetch(`${API_BASE}/transfers/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to approve transfer');
    return data;
  },

  async handoverTransfer(id, payload = {}) {
    const res = await fetch(`${API_BASE}/transfers/${id}/handover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to confirm handover');
    return data;
  },

  async acknowledgeTransfer(id, payload = {}) {
    const res = await fetch(`${API_BASE}/transfers/${id}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to acknowledge transfer');
    return data;
  },

  async cancelTransfer(id, payload = {}) {
    const res = await fetch(`${API_BASE}/transfers/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to cancel transfer');
    return data;
  },

  async getAssetTransfers(assetId) {
    const res = await fetch(`${API_BASE}/assets/${assetId}/transfers`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch asset transfer history');
    return data.data || [];
  },

  async getEmployeeTransfers(employeeId) {
    const res = await fetch(`${API_BASE}/employees/${employeeId}/transfers`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch employee transfer history');
    return data.data || [];
  },

  // ==========================================
  // 5. DEPARTMENTS
  // ==========================================
  async getDepartments() {
    const res = await fetch(`${API_BASE}/assets/departments`);
    const data = await res.json();
    return data.data || [];
  },

  async getDepartmentById(id) {
    const res = await fetch(`${API_BASE}/assets/departments/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Department not found');
    return data.data;
  },

  async createDepartment(deptData) {
    const res = await fetch(`${API_BASE}/assets/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deptData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create department');
    return data;
  },

  async updateDepartment(id, deptData) {
    const res = await fetch(`${API_BASE}/assets/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deptData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update department');
    return data;
  },

  async deleteDepartment(id) {
    const res = await fetch(`${API_BASE}/assets/departments/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete department');
    return data;
  },

  // ==========================================
  // 6. LOCATIONS
  // ==========================================
  async getLocations() {
    const res = await fetch(`${API_BASE}/assets/locations`);
    const data = await res.json();
    return data.data || [];
  },

  async getLocationById(id) {
    const res = await fetch(`${API_BASE}/assets/locations/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Location not found');
    return data.data;
  },

  async createLocation(locationData) {
    const res = await fetch(`${API_BASE}/assets/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locationData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create location');
    return data;
  },

  async updateLocation(id, locationData) {
    const res = await fetch(`${API_BASE}/assets/locations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locationData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update location');
    return data;
  },

  async deleteLocation(id) {
    const res = await fetch(`${API_BASE}/assets/locations/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete location');
    return data;
  },

  // ==========================================
  // 7. VENDORS
  // ==========================================
  async getVendors() {
    const res = await fetch(`${API_BASE}/assets/vendors`);
    const data = await res.json();
    return data.data || [];
  },

  async getVendorById(id) {
    const res = await fetch(`${API_BASE}/assets/vendors/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Vendor not found');
    return data.data;
  },

  async createVendor(vendorData) {
    const res = await fetch(`${API_BASE}/assets/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendorData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create vendor');
    return data;
  },

  async updateVendor(id, vendorData) {
    const res = await fetch(`${API_BASE}/assets/vendors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendorData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update vendor');
    return data;
  },

  async deleteVendor(id) {
    const res = await fetch(`${API_BASE}/assets/vendors/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete vendor');
    return data;
  },

  // ==========================================
  // 8. SOFTWARE ASSET MANAGEMENT (SAM)
  // ==========================================
  async getSoftware() {
    const res = await fetch(`${API_BASE}/assets/software`);
    const data = await res.json();
    return data.data || [];
  },

  async getSoftwareById(id) {
    const res = await fetch(`${API_BASE}/assets/software/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Software not found');
    return data.data;
  },

  async createSoftware(item) {
    const res = await fetch(`${API_BASE}/assets/software`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create software license');
    return data;
  },

  async updateSoftware(id, item) {
    const res = await fetch(`${API_BASE}/assets/software/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update software license');
    return data;
  },

  async deleteSoftware(id) {
    const res = await fetch(`${API_BASE}/assets/software/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete software license');
    return data;
  },

  // ==========================================
  // 9. NETWORK INFRASTRUCTURE DEVICES
  // ==========================================
  async getNetworkDevices() {
    const res = await fetch(`${API_BASE}/assets/network-devices`);
    const data = await res.json();
    return data.data || [];
  },

  async getNetworkDeviceById(id) {
    const res = await fetch(`${API_BASE}/assets/network-devices/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Network device not found');
    return data.data;
  },

  async createNetworkDevice(item) {
    const res = await fetch(`${API_BASE}/assets/network-devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create network device');
    return data;
  },

  async updateNetworkDevice(id, item) {
    const res = await fetch(`${API_BASE}/assets/network-devices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update network device');
    return data;
  },

  async deleteNetworkDevice(id) {
    const res = await fetch(`${API_BASE}/assets/network-devices/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete network device');
    return data;
  },

  async resolveMaintenance(id, resolutionData) {
    const res = await fetch(`${API_BASE}/assets/maintenance/${id}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resolutionData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to resolve maintenance ticket');
    return data;
  },

  async deleteMaintenance(id) {
    const res = await fetch(`${API_BASE}/assets/maintenance/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete maintenance ticket');
    return data;
  },


  // ==========================================
  // 11. INWARD PROCUREMENT & VERIFICATION
  // ==========================================
  async getInwards(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.vendor) params.append('vendor', filters.vendor);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/assets/inward${qs}`);
    const data = await res.json();
    return data.data || [];
  },

  async getInwardById(id) {
    const res = await fetch(`${API_BASE}/assets/inward/${id}`);
    const data = await res.json();
    return data.data || null;
  },

  async createInward(inwardData) {
    const res = await fetch(`${API_BASE}/assets/inward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inwardData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to save Inward record');
    return data;
  },

  async updateInward(id, inwardData) {
    const res = await fetch(`${API_BASE}/assets/inward/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inwardData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update Inward');
    return data;
  },

  async verifyInwardAssets(id, verificationData) {
    const res = await fetch(`${API_BASE}/assets/inward/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verificationData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to save asset verification');
    return data;
  },

  async createAssetsFromInward(id, data = {}) {
    const res = await fetch(`${API_BASE}/assets/inward/${id}/create-assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Failed to create assets from Inward');
    return resData;
  },

  async deleteInward(id) {
    const res = await fetch(`${API_BASE}/assets/inward/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete Inward');
    return data;
  },

  // ==========================================
  // 12. PURCHASE ORDERS & INVOICES
  // ==========================================
  async getPurchaseOrders() {
    const res = await fetch(`${API_BASE}/procurement/orders`);
    const data = await res.json();
    return data.data || [];
  },

  async getPurchaseOrderById(id) {
    const res = await fetch(`${API_BASE}/procurement/orders/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Purchase order not found');
    return data.data;
  },

  async createPurchaseOrder(poData) {
    const res = await fetch(`${API_BASE}/procurement/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(poData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create purchase order');
    return data;
  },

  async updatePurchaseOrder(id, poData) {
    const res = await fetch(`${API_BASE}/procurement/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(poData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update purchase order');
    return data;
  },

  async deletePurchaseOrder(id) {
    const res = await fetch(`${API_BASE}/procurement/orders/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete purchase order');
    return data;
  },

  async getInvoices() {
    const res = await fetch(`${API_BASE}/procurement/invoices`);
    const data = await res.json();
    return data.data || [];
  },

  async getInvoiceById(id) {
    const res = await fetch(`${API_BASE}/procurement/invoices/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invoice not found');
    return data.data;
  },

  async createInvoice(invoiceData) {
    const res = await fetch(`${API_BASE}/procurement/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create invoice');
    return data;
  },

  async updateInvoice(id, invoiceData) {
    const res = await fetch(`${API_BASE}/procurement/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update invoice');
    return data;
  },

  async deleteInvoice(id) {
    const res = await fetch(`${API_BASE}/procurement/invoices/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete invoice');
    return data;
  },

  // ==========================================
  // 13. AUDIT LOGS
  // ==========================================
  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/assets/audit-logs`);
    const data = await res.json();
    return data.data || [];
  },

  async createAuditLog(logData) {
    const res = await fetch(`${API_BASE}/assets/audit-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create audit log');
    return data;
  },

  async clearAuditLogs() {
    const res = await fetch(`${API_BASE}/assets/audit-logs/clear`, {
      method: 'DELETE',
    });
    return await res.json();
  },

  // ==========================================
  // 14. NOTIFICATIONS
  // ==========================================
  async getNotifications() {
    const res = await fetch(`${API_BASE}/assets/notifications`);
    const data = await res.json();
    return data.data || [];
  },

  async createNotification(notifData) {
    const res = await fetch(`${API_BASE}/assets/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notifData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create notification');
    return data;
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/assets/notifications/${id}/read`, { method: 'PUT' });
    return await res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/assets/notifications/read-all`, { method: 'PUT' });
    return await res.json();
  },

  async deleteNotification(id) {
    const res = await fetch(`${API_BASE}/assets/notifications/${id}`, { method: 'DELETE' });
    return await res.json();
  },

  async clearNotifications() {
    const res = await fetch(`${API_BASE}/assets/notifications/clear-all`, { method: 'DELETE' });
    return await res.json();
  },

  // ==========================================
  // 15. MASTER SETTINGS
  // ==========================================
  async getMasterSettings() {
    const res = await fetch(`${API_BASE}/settings/master-data`);
    const data = await res.json();
    return data.data || {};
  },

  async updateMasterSettings(settingsData) {
    const res = await fetch(`${API_BASE}/settings/master-data`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update settings');
    return data;
  },

  // Aliases for clean interface consistency
  acknowledgeAsset(id, data) {
    return this.acknowledgeAssetReceipt(id, data);
  },
  bulkImport(items, overwrite, actor) {
    return this.bulkImportAssets(items, overwrite, actor);
  },
  seedSampleMaster() {
    return this.seedSampleMasterRow();
  },
  bulkImportEmployees(employees, options) {
    return this.createEmployeesBulk(employees, options);
  },
  employeeExit(id, exitData) {
    return this.offboardEmployee(id, exitData);
  },
  verifyInward(id, data) {
    return this.verifyInwardAssets(id, data);
  },
};

// Domain-specific sub-API groupings for clean modular consumption
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
  getDepartmentById: (...args) => api.getDepartmentById(...args),
  createDepartment: (...args) => api.createDepartment(...args),
  updateDepartment: (...args) => api.updateDepartment(...args),
  deleteDepartment: (...args) => api.deleteDepartment(...args),
  getLocations: (...args) => api.getLocations(...args),
  getLocationById: (...args) => api.getLocationById(...args),
  createLocation: (...args) => api.createLocation(...args),
  updateLocation: (...args) => api.updateLocation(...args),
  deleteLocation: (...args) => api.deleteLocation(...args),
  getVendors: (...args) => api.getVendors(...args),
  getVendorById: (...args) => api.getVendorById(...args),
  createVendor: (...args) => api.createVendor(...args),
  updateVendor: (...args) => api.updateVendor(...args),
  deleteVendor: (...args) => api.deleteVendor(...args),
};

export const softwareApi = {
  getSoftware: (...args) => api.getSoftware(...args),
  getSoftwareById: (...args) => api.getSoftwareById(...args),
  createSoftware: (...args) => api.createSoftware(...args),
  updateSoftware: (...args) => api.updateSoftware(...args),
  deleteSoftware: (...args) => api.deleteSoftware(...args),
  getNetworkDevices: (...args) => api.getNetworkDevices(...args),
  getNetworkDeviceById: (...args) => api.getNetworkDeviceById(...args),
  createNetworkDevice: (...args) => api.createNetworkDevice(...args),
  updateNetworkDevice: (...args) => api.updateNetworkDevice(...args),
  deleteNetworkDevice: (...args) => api.deleteNetworkDevice(...args),
};

export const procurementApi = {
  getPurchaseOrders: (...args) => api.getPurchaseOrders(...args),
  getPurchaseOrderById: (...args) => api.getPurchaseOrderById(...args),
  createPurchaseOrder: (...args) => api.createPurchaseOrder(...args),
  updatePurchaseOrder: (...args) => api.updatePurchaseOrder(...args),
  deletePurchaseOrder: (...args) => api.deletePurchaseOrder(...args),
  getInvoices: (...args) => api.getInvoices(...args),
  getInvoiceById: (...args) => api.getInvoiceById(...args),
  createInvoice: (...args) => api.createInvoice(...args),
  updateInvoice: (...args) => api.updateInvoice(...args),
  deleteInvoice: (...args) => api.deleteInvoice(...args),
};

export const systemApi = {
  getHealth: (...args) => api.getHealth(...args),
  getUsers: (...args) => api.getUsers(...args),
  getUserById: (...args) => api.getUserById(...args),
  createUser: (...args) => api.createUser(...args),
  updateUser: (...args) => api.updateUser(...args),
  deleteUser: (...args) => api.deleteUser(...args),
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


