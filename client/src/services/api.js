const API_BASE = '/api';

export const api = {
  // Health check
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (err) {
      return { status: 'OFFLINE', database: { connected: false }, error: err.message };
    }
  },

  // Asset stats
  async getStats() {
    const res = await fetch(`${API_BASE}/assets/stats/summary`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  },

  async getStatsSummary() {
    return this.getStats();
  },

  // Get assets with search, status, and location filters
  async getAssets({ search = '', status = 'All', location = 'All' } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') params.append('status', status);
    if (location && location !== 'All') params.append('location', location);

    const res = await fetch(`${API_BASE}/assets?${params.toString()}`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to fetch assets');
    }
    return await res.json();
  },

  // Create asset (Inward entry)
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

  // Update asset (Allocation / Maintenance / Return to stock)
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

  // Assign Asset
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

  // Return Asset
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

  // Transfer Asset
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

  // Auth: Login
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

  // Employees & Organization
  async getEmployees() {
    const res = await fetch(`${API_BASE}/assets/employees`);
    const data = await res.json();
    return data.data || [];
  },

  async getDepartments() {
    const res = await fetch(`${API_BASE}/assets/departments`);
    const data = await res.json();
    return data.data || [];
  },

  async getLocations() {
    const res = await fetch(`${API_BASE}/assets/locations`);
    const data = await res.json();
    return data.data || [];
  },

  async getVendors() {
    const res = await fetch(`${API_BASE}/assets/vendors`);
    const data = await res.json();
    return data.data || [];
  },

  // Software & Licenses (SAM)
  async getSoftware() {
    const res = await fetch(`${API_BASE}/assets/software`);
    const data = await res.json();
    return data.data || [];
  },

  async createSoftware(item) {
    const res = await fetch(`${API_BASE}/assets/software`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return await res.json();
  },

  // Network Devices
  async getNetworkDevices() {
    const res = await fetch(`${API_BASE}/assets/network-devices`);
    const data = await res.json();
    return data.data || [];
  },

  async createNetworkDevice(item) {
    const res = await fetch(`${API_BASE}/assets/network-devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return await res.json();
  },

  // Maintenance Tickets
  async getMaintenance() {
    const res = await fetch(`${API_BASE}/assets/maintenance`);
    const data = await res.json();
    return data.data || [];
  },

  async createMaintenance(ticket) {
    const res = await fetch(`${API_BASE}/assets/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
    });
    return await res.json();
  },

  async resolveMaintenance(id, resolutionData) {
    const res = await fetch(`${API_BASE}/assets/maintenance/${id}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resolutionData),
    });
    return await res.json();
  },

  // Audit Logs & Notifications
  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/assets/audit-logs`);
    const data = await res.json();
    return data.data || [];
  },

  async getNotifications() {
    const res = await fetch(`${API_BASE}/assets/notifications`);
    const data = await res.json();
    return data.data || [];
  },

  async markNotificationRead(id) {
    await fetch(`${API_BASE}/assets/notifications/${id}/read`, { method: 'PUT' });
  },

  // Demo Seed Trigger
  async seedDemoData() {
    const res = await fetch(`${API_BASE}/assets/seed/demo-data`, { method: 'POST' });
    return await res.json();
  },

  // Clear All Data
  async clearAllData() {
    const res = await fetch(`${API_BASE}/assets/system/clear-all`, { method: 'DELETE' });
    return await res.json();
  },
};
