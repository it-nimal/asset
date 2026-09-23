/**
 * Centralized Status Constants across the application
 */

export const ASSET_STATUS = {
  AVAILABLE: 'Available',
  ASSIGNED: 'Assigned',
  MAINTENANCE: 'Under Maintenance',
  RESERVED: 'Reserved',
  LOST: 'Lost',
  STOLEN: 'Stolen',
  RETIRED: 'Retired',
  DISPOSED: 'Disposed',
};

export const MAINTENANCE_STATUS = {
  REPORTED: 'Reported',
  UNDER_DIAGNOSIS: 'Under Diagnosis',
  IN_REPAIR: 'In Repair',
  AWAITING_PARTS: 'Awaiting Parts',
  AWAITING_VENDOR: 'Awaiting Vendor',
  QC_TESTING: 'QC Testing',
  QC_FAILED: 'QC Failed',
  READY: 'Ready',
  RETURNED: 'Returned',
  CANCELLED: 'Cancelled',
};

export const TRANSFER_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  HANDOVER_IN_PROGRESS: 'Handover in Progress',
  ACKNOWLEDGEMENT_PENDING: 'Acknowledgement Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const INWARD_STATUS = {
  DRAFT: 'Draft',
  VERIFIED: 'Verified',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const EMPLOYEE_STATUS = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On Leave',
  NOTICE_PERIOD: 'Notice Period',
  EXITED: 'Exited',
};

export const STATUS_COLORS = {
  Available: { text: '#166534', bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a' },
  Assigned: { text: '#1e40af', bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb' },
  'In Stock': { text: '#166534', bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a' },
  'Under Maintenance': { text: '#374151', bg: '#f3f4f6', border: '#e5e7eb', accent: '#6b7280' },
  'Under QC': { text: '#92400e', bg: '#fffbeb', border: '#fde68a', accent: '#d97706' },
  'QC Testing': { text: '#92400e', bg: '#fffbeb', border: '#fde68a', accent: '#d97706' },
  'In Repair': { text: '#374151', bg: '#f3f4f6', border: '#e5e7eb', accent: '#6b7280' },
  'Under Diagnosis': { text: '#374151', bg: '#f3f4f6', border: '#e5e7eb', accent: '#6b7280' },
  'Awaiting Parts': { text: '#92400e', bg: '#fffbeb', border: '#fde68a', accent: '#d97706' },
  'Awaiting Vendor': { text: '#92400e', bg: '#fffbeb', border: '#fde68a', accent: '#d97706' },
  'QC Pass': { text: '#166534', bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a' },
  'QC Fail': { text: '#991b1b', bg: '#fef2f2', border: '#fecaca', accent: '#dc2626' },
  Ready: { text: '#166534', bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a' },
  Returned: { text: '#166534', bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a' },
  Pending: { text: '#92400e', bg: '#fffbeb', border: '#fde68a', accent: '#d97706' },
  Approved: { text: '#166534', bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a' },
  Completed: { text: '#166534', bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a' },
  Verified: { text: '#166534', bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a' },
  'Asset Created': { text: '#166534', bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a' },
  'Verified & Created': { text: '#166534', bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a' },
  'Handover in Progress': { text: '#1e40af', bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb' },
  'Acknowledgement Pending': { text: '#92400e', bg: '#fffbeb', border: '#fde68a', accent: '#d97706' },
  Reserved: { text: '#1e40af', bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb' },
  Lost: { text: '#991b1b', bg: '#fef2f2', border: '#fecaca', accent: '#dc2626' },
  Stolen: { text: '#991b1b', bg: '#fef2f2', border: '#fecaca', accent: '#dc2626' },
  Damaged: { text: '#991b1b', bg: '#fef2f2', border: '#fecaca', accent: '#dc2626' },
  Retired: { text: '#475569', bg: '#f1f5f9', border: '#cbd5e1', accent: '#64748b' },
  Disposed: { text: '#475569', bg: '#f1f5f9', border: '#cbd5e1', accent: '#64748b' },
  Cancelled: { text: '#475569', bg: '#f1f5f9', border: '#cbd5e1', accent: '#64748b' },
  Rejected: { text: '#991b1b', bg: '#fef2f2', border: '#fecaca', accent: '#dc2626' },
};

export const getStatusStyle = (status) => {
  return STATUS_COLORS[status] || {
    text: '#475569',
    bg: '#f1f5f9',
    border: '#cbd5e1',
    accent: '#64748b',
  };
};

