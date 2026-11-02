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
  logoutUser,
  getMe,
  changePassword,
  resetUserPassword,
  getUserActivityStats,
  getRolePermissionMatrix,
  updateRolePermissionMatrix,
  getUserPermissionsHandler,
  updateUserPermissionsHandler,
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
} from '../controllers/index.js';
import {
  authenticateToken,
  requireSuperAdmin,
  requireAdmin,
} from '../middleware/auth.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// ----------------- SYSTEM SEEDING & PURGE ENDPOINTS (Super Admin only) -----------------
router.delete('/system/clear-all', authenticateToken, requireSuperAdmin, clearAllData);
router.post('/seed/demo-data', authenticateToken, requireSuperAdmin, seedDemoData);
router.post('/system/feed-user-data', authenticateToken, requireSuperAdmin, feedUserData);

// ----------------- ASSET STATS & MASTER DATA SUMMARY -----------------
router.get('/stats/summary', authenticateToken, getAssetStats);
router.get('/warranty/summary', authenticateToken, getWarrantySummary);
router.route('/settings/master-data')
  .get(authenticateToken, getMasterSettings)
  .put(authenticateToken, requireSuperAdmin, updateMasterSettings);
router.post('/bulk-import', authenticateToken, requireAdmin, checkPermission('Asset Master', 'IMPORT'), bulkImportAssets);
router.get('/export-master-csv', authenticateToken, requireAdmin, checkPermission('Asset Master', 'EXPORT'), exportAssetsCSV);
router.post('/seed/sample-master-row', authenticateToken, requireSuperAdmin, seedSampleMasterRow);

// ----------------- AUTHENTICATION & PROFILE -----------------
router.post('/auth/login', loginUser);
router.post('/auth/logout', authenticateToken, logoutUser);
router.get('/auth/me', authenticateToken, getMe);
router.route('/auth/change-password')
  .post(authenticateToken, changePassword)
  .put(authenticateToken, changePassword);
router.route('/auth/reset-password/:id')
  .post(authenticateToken, requireAdmin, resetUserPassword)
  .put(authenticateToken, requireAdmin, resetUserPassword);
router.get('/auth/users/:id/activity', authenticateToken, getUserActivityStats);

// ----------------- PERMISSION MATRIX & OVERRIDES (Super Admin) -----------------
router.route('/permissions/matrix')
  .get(authenticateToken, requireSuperAdmin, getRolePermissionMatrix)
  .put(authenticateToken, requireSuperAdmin, updateRolePermissionMatrix);

router.route('/auth/users/:id/permissions')
  .get(authenticateToken, getUserPermissionsHandler)
  .put(authenticateToken, requireSuperAdmin, updateUserPermissionsHandler);

// ----------------- USER MANAGEMENT (Admin creates/manages Users, Super Admin manages all) -----------------
router.route('/auth/users')
  .get(authenticateToken, requireAdmin, getUsers)
  .post(authenticateToken, requireAdmin, createUser);
router.route('/auth/users/:id')
  .get(authenticateToken, requireAdmin, getUserById)
  .put(authenticateToken, requireAdmin, updateUser)
  .delete(authenticateToken, requireSuperAdmin, deleteUser);

// ----------------- EMPLOYEES & ORGANIZATION -----------------
router.route('/employees')
  .get(authenticateToken, getEmployees)
  .post(authenticateToken, requireAdmin, createEmployee);
router.post('/employees/bulk', authenticateToken, requireAdmin, bulkImportEmployees);
router.get('/employees/:id/assets', authenticateToken, getEmployeeAssets);
router.get('/employees/:id/history', authenticateToken, getEmployeeHistory);
router.post('/employees/:id/exit', authenticateToken, requireAdmin, employeeExit);
router.route('/employees/:id')
  .get(authenticateToken, getEmployeeById)
  .put(authenticateToken, requireAdmin, updateEmployee)
  .delete(authenticateToken, requireAdmin, deleteEmployee);

// ----------------- DEPARTMENTS -----------------
router.route('/departments')
  .get(authenticateToken, getDepartments)
  .post(authenticateToken, requireAdmin, createDepartment);
router.route('/departments/:id')
  .get(authenticateToken, getDepartmentById)
  .put(authenticateToken, requireAdmin, updateDepartment)
  .delete(authenticateToken, requireAdmin, deleteDepartment);

// ----------------- LOCATIONS -----------------
router.route('/locations')
  .get(authenticateToken, getLocations)
  .post(authenticateToken, requireAdmin, createLocation);
router.route('/locations/:id')
  .get(authenticateToken, getLocationById)
  .put(authenticateToken, requireAdmin, updateLocation)
  .delete(authenticateToken, requireAdmin, deleteLocation);

// ----------------- VENDORS -----------------
router.route('/vendors')
  .get(authenticateToken, getVendors)
  .post(authenticateToken, requireAdmin, createVendor);
router.route('/vendors/:id')
  .get(authenticateToken, getVendorById)
  .put(authenticateToken, requireAdmin, updateVendor)
  .delete(authenticateToken, requireAdmin, deleteVendor);

// ----------------- SOFTWARE ASSET MANAGEMENT (SAM) -----------------
router.route('/software')
  .get(authenticateToken, getSoftware)
  .post(authenticateToken, requireAdmin, createSoftware);
router.route('/software/:id')
  .get(authenticateToken, getSoftwareById)
  .put(authenticateToken, requireAdmin, updateSoftware)
  .delete(authenticateToken, requireAdmin, deleteSoftware);

// ----------------- NETWORK INFRASTRUCTURE DEVICES -----------------
router.route('/network-devices')
  .get(authenticateToken, getNetworkDevices)
  .post(authenticateToken, requireAdmin, createNetworkDevice);
router.route('/network-devices/:id')
  .get(authenticateToken, getNetworkDeviceById)
  .put(authenticateToken, requireAdmin, updateNetworkDevice)
  .delete(authenticateToken, requireAdmin, deleteNetworkDevice);

// ----------------- MAINTENANCE TICKETS & REPAIRS -----------------
router.route('/maintenance')
  .get(authenticateToken, getMaintenance)
  .post(authenticateToken, requireAdmin, createMaintenance);
router.post('/maintenance/:id/diagnose', authenticateToken, requireAdmin, diagnoseMaintenance);
router.post('/maintenance/:id/start-repair', authenticateToken, requireAdmin, startRepairMaintenance);
router.post('/maintenance/:id/qc', authenticateToken, requireAdmin, qcMaintenance);
router.post('/maintenance/:id/complete', authenticateToken, requireAdmin, completeMaintenance);
router.post('/maintenance/:id/return', authenticateToken, requireAdmin, completeMaintenance);
router.post('/maintenance/:id/cancel', authenticateToken, requireAdmin, cancelMaintenance);
router.put('/maintenance/:id/resolve', authenticateToken, requireAdmin, resolveMaintenance);
router.route('/maintenance/:id')
  .get(authenticateToken, getMaintenanceById)
  .put(authenticateToken, requireAdmin, updateMaintenance)
  .delete(authenticateToken, requireAdmin, deleteMaintenance);

// ----------------- PROCUREMENT: PURCHASE ORDERS -----------------
router.route('/procurement/orders')
  .get(authenticateToken, getPurchaseOrders)
  .post(authenticateToken, requireAdmin, createPurchaseOrder);
router.route('/procurement/orders/:id')
  .get(authenticateToken, getPurchaseOrderById)
  .put(authenticateToken, requireAdmin, updatePurchaseOrder)
  .delete(authenticateToken, requireAdmin, deletePurchaseOrder);

// ----------------- PROCUREMENT: INVOICES -----------------
router.route('/procurement/invoices')
  .get(authenticateToken, getInvoices)
  .post(authenticateToken, requireAdmin, createInvoice);
router.route('/procurement/invoices/:id')
  .get(authenticateToken, getInvoiceById)
  .put(authenticateToken, requireAdmin, updateInvoice)
  .delete(authenticateToken, requireAdmin, deleteInvoice);

// ----------------- INWARD PROCUREMENT & RECEIVING -----------------
router.get('/inward', authenticateToken, getInwards);
router.get('/inwards', authenticateToken, getInwards);
router.post('/inward', authenticateToken, requireAdmin, createInward);
router.post('/inward/:id/verify', authenticateToken, requireAdmin, verifyInward);
router.post('/inward/:id/create-assets', authenticateToken, requireAdmin, createAssetsFromInward);
router.route('/inward/:id')
  .get(authenticateToken, getInwardById)
  .put(authenticateToken, requireAdmin, updateInward)
  .delete(authenticateToken, requireAdmin, deleteInward);

// ----------------- ASSET TRANSFERS & HANDOVERS -----------------
router.route('/transfers')
  .get(authenticateToken, getTransfers)
  .post(authenticateToken, requireAdmin, createTransfer);
router.post('/transfers/:id/approve', authenticateToken, requireAdmin, approveTransfer);
router.post('/transfers/:id/handover', authenticateToken, requireAdmin, handoverTransfer);
router.post('/transfers/:id/acknowledge', authenticateToken, acknowledgeTransfer);
router.post('/transfers/:id/cancel', authenticateToken, requireAdmin, cancelTransfer);
router.route('/transfers/:id').get(authenticateToken, getTransferById);
router.get('/employees/:id/transfers', authenticateToken, getEmployeeTransfers);

// ----------------- AUDIT LOGS (Admin / Super Admin view all, User views own activity, immutable append-only) -----------------
router.route('/audit-logs')
  .get(authenticateToken, getAuditLogs)
  .post(authenticateToken, createAuditLog);
router.delete(['/audit-logs', '/audit-logs/clear'], authenticateToken, clearAuditLogs);

// ----------------- NOTIFICATIONS -----------------
router.route('/notifications')
  .get(authenticateToken, getNotifications)
  .post(authenticateToken, createNotification);
router.put('/notifications/read-all', authenticateToken, markAllNotificationsRead);
router.delete('/notifications/clear-all', authenticateToken, clearNotifications);
router.put('/notifications/:id/read', authenticateToken, markNotificationRead);
router.delete('/notifications/:id', authenticateToken, deleteNotification);

// ----------------- ASSETS ROOT COLLECTION & LIFECYCLE -----------------
router.get(['/available', '/assets/available'], authenticateToken, getAvailableAssets);
router.post(['/allocate', '/assets/allocate'], authenticateToken, requireAdmin, allocateAssets);
router.get(['/stats/summary', '/assets/stats/summary'], authenticateToken, getAssetStats);
router.post(['/bulk-import', '/assets/bulk-import'], authenticateToken, requireAdmin, bulkImportAssets);
router.get(['/export-master-csv', '/assets/export-master-csv'], authenticateToken, requireAdmin, exportAssetsCSV);
router.post(['/seed/sample-master-row', '/assets/seed/sample-master-row'], authenticateToken, requireSuperAdmin, seedSampleMasterRow);

// Sub-actions on Assets
router.post(['/:id/acknowledge', '/assets/:id/acknowledge'], authenticateToken, acknowledgeAsset);
router.post(['/:id/report-issue', '/assets/:id/report-issue'], authenticateToken, reportAssetIssue);
router.get(['/:id/maintenance', '/assets/:id/maintenance'], authenticateToken, getAssetMaintenanceHistory);
router.get(['/:id/transfers', '/assets/:id/transfers'], authenticateToken, getAssetTransfers);
router.post(['/:id/assign', '/assets/:id/assign'], authenticateToken, requireAdmin, assignAsset);
router.post(['/:id/return', '/assets/:id/return'], authenticateToken, requireAdmin, returnAsset);
router.post(['/:id/transfer', '/assets/:id/transfer'], authenticateToken, requireAdmin, transferAsset);
router.post(['/:id/maintenance-return', '/assets/:id/maintenance-return'], authenticateToken, requireAdmin, returnFromMaintenance);
router.post(['/:id/retire', '/assets/:id/retire'], authenticateToken, requireAdmin, retireAsset);

// Root Asset Resource
router.route(['/', '/assets'])
  .get(authenticateToken, getAssets)
  .post(authenticateToken, requireAdmin, createAsset);
router.route(['/:id', '/assets/:id'])
  .get(authenticateToken, getAssetById)
  .put(authenticateToken, requireAdmin, updateAsset)
  .delete(authenticateToken, requireAdmin, deleteAsset);

export { COMPANY_DEPARTMENTS } from '../controllers/index.js';

export default router;
