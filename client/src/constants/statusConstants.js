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
