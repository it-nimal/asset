import express from 'express';
import {
  // Asset controllers
  getAssets,
  getAssetById,
  getAvailableAssets,
  allocateAssets,
  acknowledgeAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetStats,
  assignAsset,
  returnAsset,
  transferAsset,
  returnFromMaintenance,
  retireAsset,
  bulkImportAssets,
  exportAssetsCSV,
  seedSampleMasterRow,
  getWarrantySummary,
  
  // Employee controllers
  getEmployees,
  getEmployeeById,
  createEmployee,
  bulkImportEmployees,
  updateEmployee,
  deleteEmployee,
  getEmployeeAssets,
  getEmployeeHistory,
  employeeExit,
  
  // Department controllers
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  
  // Location controllers
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  
  // Vendor controllers
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  
  // Software controllers
  getSoftware,
  getSoftwareById,
  createSoftware,
  updateSoftware,
  deleteSoftware,
  
  // Network device controllers
  getNetworkDevices,
  getNetworkDeviceById,
  createNetworkDevice,
  updateNetworkDevice,
  deleteNetworkDevice,
  
  // Maintenance controllers
  getMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  diagnoseMaintenance,
  startRepairMaintenance,
  qcMaintenance,
  completeMaintenance,
  cancelMaintenance,
  reportAssetIssue,
  getAssetMaintenanceHistory,
  getEmployeeMaintenanceHistory,
  resolveMaintenance,
  deleteMaintenance,
  
  // Inward controllers
  getInwards,
  getInwardById,
  createInward,
  updateInward,
  verifyInward,
  createAssetsFromInward,
  deleteInward,

  // Transfer controllers
  getTransfers,
  getTransferById,
  createTransfer,
  approveTransfer,
  handoverTransfer,
  acknowledgeTransfer,
  cancelTransfer,
  getAssetTransfers,
  getEmployeeTransfers,
  
  // Purchase Order controllers
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  
  // Invoice controllers
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  
  // User & Auth controllers
  loginUser,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  
  // Audit Log controllers
  getAuditLogs,
  createAuditLog,
  clearAuditLogs,
  
  // Notification controllers
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearNotifications,
  
  // Settings controllers
  getMasterSettings,
  updateMasterSettings,
  
  // System controllers
  clearAllData,
  seedDemoData,
  feedUserData,
} from '../controllers/assetController.js';

const router = express.Router();

// ----------------- SYSTEM SEEDING & PURGE ENDPOINTS -----------------
router.delete('/system/clear-all', clearAllData);
router.post('/seed/demo-data', seedDemoData);
router.post('/system/feed-user-data', feedUserData);

// ----------------- ASSET STATS & MASTER DATA SUMMARY -----------------
router.get('/stats/summary', getAssetStats);
router.get('/warranty/summary', getWarrantySummary);
router.route('/settings/master-data').get(getMasterSettings).put(updateMasterSettings);
router.post('/bulk-import', bulkImportAssets);
router.get('/export-master-csv', exportAssetsCSV);
router.post('/seed/sample-master-row', seedSampleMasterRow);

// ----------------- AUTHENTICATION & USER MANAGEMENT -----------------
router.post('/auth/login', loginUser);
router.route('/auth/users').get(getUsers).post(createUser);
router.route('/auth/users/:id').get(getUserById).put(updateUser).delete(deleteUser);

// ----------------- EMPLOYEES & ORGANIZATION -----------------
router.route('/employees').get(getEmployees).post(createEmployee);
router.post('/employees/bulk', bulkImportEmployees);
router.get('/employees/:id/assets', getEmployeeAssets);
router.get('/employees/:id/history', getEmployeeHistory);
router.post('/employees/:id/exit', employeeExit);
router.route('/employees/:id').get(getEmployeeById).put(updateEmployee).delete(deleteEmployee);

// ----------------- DEPARTMENTS -----------------
router.route('/departments').get(getDepartments).post(createDepartment);
router.route('/departments/:id').get(getDepartmentById).put(updateDepartment).delete(deleteDepartment);

// ----------------- LOCATIONS -----------------
router.route('/locations').get(getLocations).post(createLocation);
router.route('/locations/:id').get(getLocationById).put(updateLocation).delete(deleteLocation);

// ----------------- VENDORS -----------------
router.route('/vendors').get(getVendors).post(createVendor);
router.route('/vendors/:id').get(getVendorById).put(updateVendor).delete(deleteVendor);

// ----------------- SOFTWARE ASSET MANAGEMENT (SAM) -----------------
router.route('/software').get(getSoftware).post(createSoftware);
router.route('/software/:id').get(getSoftwareById).put(updateSoftware).delete(deleteSoftware);

// ----------------- NETWORK INFRASTRUCTURE DEVICES -----------------
router.route('/network-devices').get(getNetworkDevices).post(createNetworkDevice);
router.route('/network-devices/:id').get(getNetworkDeviceById).put(updateNetworkDevice).delete(deleteNetworkDevice);

// ----------------- MAINTENANCE TICKETS & REPAIRS -----------------
router.route('/maintenance').get(getMaintenance).post(createMaintenance);
router.post('/maintenance/:id/diagnose', diagnoseMaintenance);
router.post('/maintenance/:id/start-repair', startRepairMaintenance);
router.post('/maintenance/:id/qc', qcMaintenance);
router.post('/maintenance/:id/complete', completeMaintenance);
router.post('/maintenance/:id/return', completeMaintenance);
router.post('/maintenance/:id/cancel', cancelMaintenance);
router.put('/maintenance/:id/resolve', resolveMaintenance);
router.route('/maintenance/:id').get(getMaintenanceById).put(updateMaintenance).delete(deleteMaintenance);

// ----------------- PROCUREMENT: PURCHASE ORDERS -----------------
router.route('/procurement/orders').get(getPurchaseOrders).post(createPurchaseOrder);
router.route('/procurement/orders/:id').get(getPurchaseOrderById).put(updatePurchaseOrder).delete(deletePurchaseOrder);

// ----------------- PROCUREMENT: INVOICES -----------------
router.route('/procurement/invoices').get(getInvoices).post(createInvoice);
router.route('/procurement/invoices/:id').get(getInvoiceById).put(updateInvoice).delete(deleteInvoice);

// ----------------- INWARD PROCUREMENT & RECEIVING -----------------
router.get('/inward', getInwards);
router.get('/inwards', getInwards);
router.post('/inward', createInward);
router.post('/inward/:id/verify', verifyInward);
router.post('/inward/:id/create-assets', createAssetsFromInward);
router.route('/inward/:id').get(getInwardById).put(updateInward).delete(deleteInward);

// ----------------- ASSET TRANSFERS & HANDOVERS -----------------
router.route('/transfers').get(getTransfers).post(createTransfer);
router.post('/transfers/:id/approve', approveTransfer);
router.post('/transfers/:id/handover', handoverTransfer);
router.post('/transfers/:id/acknowledge', acknowledgeTransfer);
router.post('/transfers/:id/cancel', cancelTransfer);
router.route('/transfers/:id').get(getTransferById);
router.get('/employees/:id/transfers', getEmployeeTransfers);

// ----------------- AUDIT LOGS -----------------
router.route('/audit-logs').get(getAuditLogs).post(createAuditLog);
router.delete('/audit-logs/clear', clearAuditLogs);

// ----------------- NOTIFICATIONS -----------------
router.route('/notifications').get(getNotifications).post(createNotification);
router.put('/notifications/read-all', markAllNotificationsRead);
router.delete('/notifications/clear-all', clearNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.delete('/notifications/:id', deleteNotification);

// ----------------- ASSETS ROOT COLLECTION & LIFECYCLE -----------------
router.get('/available', getAvailableAssets);
router.post('/allocate', allocateAssets);
router.route('/').get(getAssets).post(createAsset);
router.post('/:id/acknowledge', acknowledgeAsset);
router.post('/:id/report-issue', reportAssetIssue);
router.get('/:id/maintenance', getAssetMaintenanceHistory);
router.get('/:id/transfers', getAssetTransfers);
router.post('/:id/assign', assignAsset);
router.post('/:id/return', returnAsset);
router.post('/:id/transfer', transferAsset);
router.post('/:id/maintenance-return', returnFromMaintenance);
router.post('/:id/retire', retireAsset);
router.route('/:id').get(getAssetById).put(updateAsset).delete(deleteAsset);

export { COMPANY_DEPARTMENTS } from '../controllers/assetController.js';

export default router;
