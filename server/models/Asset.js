import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    // 1. Plant & Identification
    sn: { type: Number, default: null },
    plant: { type: String, default: 'Vitromed', trim: true },
    assetNo: { type: String, trim: true },

    // 2. User & Allocation Details (Snapshot + Optional Relational Links)
    assignedEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
    userStatus: { type: String, default: 'Active', trim: true },
    userName: { type: String, default: 'Unassigned', trim: true },
    empCode: { type: String, trim: true },
    mailId: { type: String, trim: true },
    department: { type: String, default: 'IT', trim: true },
    officialNumber: { type: String, trim: true },
    sapId: { type: String, trim: true },
    floorCabin: { type: String, default: 'Main Floor', trim: true },

    // 3. Hardware Specifications
    deviceType: { type: String, default: 'Laptop', trim: true },
    vncPassword: { type: String, trim: true },
    make: { type: String, required: [true, 'Make is required'], trim: true },
    model: { type: String, required: [true, 'Model is required'], trim: true },
    sr: {
      type: String,
      required: [true, 'Serial number (SR) is required'],
      unique: true,
      trim: true,
    },
    processor: { type: String, trim: true },
    ramSize: { type: String, trim: true },
    storage: { type: String, trim: true },
    monitorDetails: { type: String, trim: true },
    monitorSerialNo: { type: String, trim: true },
    dataBackup: { type: String, trim: true },
    accessories: { type: String, trim: true },

    // 4. Software & Licenses
    osVersion: { type: String, trim: true },
    windowsType: { type: String, trim: true },
    windowsKey: { type: String, trim: true },
    officeSoftware: { type: String, trim: true },
    officeKey: { type: String, trim: true },
    mailSoftware: { type: String, trim: true },
    loginUserName: { type: String, trim: true },
    loginPassword: { type: String, trim: true },
    antivirus: { type: String, trim: true },
    otherSoftware: { type: String, trim: true },

    // 5. Network & System Identity
    hostName: { type: String, trim: true },
    pcGroup: { type: String, default: 'Workgroup', trim: true },
    escanPolicy: { type: String, trim: true },
    macAddress: { type: String, trim: true },
    ipAddress: { type: String, trim: true },

    // 6. Procurement, Inward & Invoice Details
    indentNo: { type: String, trim: true },
    po: { type: String, trim: true },
    billNo: { type: String, trim: true },
    billCopyDate: { type: String, trim: true },
    inwardNumber: { type: String, trim: true },
    purchaseDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date, default: Date.now },
    vendorName: { type: String, trim: true },
    warrantyDetails: { type: String, default: '3 Years On-Site', trim: true },
    invoiceImage: { type: String },

    category: { type: String, default: 'computing', trim: true },
    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
    peripheralsList: [
      {
        id: { type: String, trim: true },
        type: { type: String, trim: true },
        name: { type: String, trim: true },
        make: { type: String, trim: true },
        model: { type: String, trim: true },
        serialNo: { type: String, trim: true },
        assetTag: { type: String, trim: true },
        warranty: { type: String, trim: true },
        invoiceNo: { type: String, trim: true },
        condition: { type: String, default: 'Good', trim: true },
        specifications: { type: String, trim: true },
      },
    ],
    managementIp: { type: String, trim: true },
    managementVlan: { type: String, trim: true },

    // 7. Status & Condition
    status: {
      type: String,
      enum: [
        'Available',
        'Assigned',
        'In Stock',
        'Reserved',
        'Under Maintenance',
        'Under QC',
        'Damaged',
        'Lost',
        'Stolen',
        'Retired',
        'Disposed',
      ],
      default: 'Available',
    },
    workingCondition: { type: String, default: 'Good', trim: true },
    remarks: { type: String, trim: true },
    receiptAcknowledged: { type: Boolean, default: false },
    receiptAcknowledgedAt: { type: Date },
    acknowledgementNotes: { type: String, default: '', trim: true },

    // 8. Financial & Lifecycle
    purchasePrice: { type: Number, default: 0 },
    currentValue: { type: Number, default: 0 },
    warrantyStartDate: { type: Date, default: Date.now },
    warrantyEndDate: { type: Date },
    assignedDate: { type: Date },
    expectedReturnDate: { type: Date },
    maintenanceStartDate: { type: Date, default: Date.now },
    maintenanceEndDate: { type: Date },
    lastMaintenanceCost: { type: Number, default: 0 },
    lastMaintenanceResolution: { type: String, trim: true },
    serviceVendor: { type: String, trim: true },
    maintenanceNotes: { type: String, trim: true },

    // 9. Detailed Timeline History
    history: [
      {
        action: { type: String, required: true },
        date: { type: Date, default: Date.now },
        user: { type: String, default: 'System Admin' },
        details: { type: String },
      },
    ],
  },
  {
    timestamps: true,
    autoIndex: false,
    strict: false,
  }
);

// Performance & Filtering Compound Indexes
assetSchema.index({ assetNo: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ category: 1 });
assetSchema.index({ deviceType: 1 });
assetSchema.index({ plant: 1 });
assetSchema.index({ department: 1 });
assetSchema.index({ userName: 1 });
assetSchema.index({ empCode: 1 });
assetSchema.index({ assignedEmployeeId: 1 });
assetSchema.index({ warrantyEndDate: 1 });

export const Asset = mongoose.models.Asset || mongoose.model('Asset', assetSchema);
export default Asset;

// Re-export all domain models for 100% backward compatibility
export { User } from './User.js';
export { Department } from './Department.js';
export { Location } from './Location.js';
export { Employee } from './Employee.js';
export { Vendor } from './Vendor.js';
export { Software } from './Software.js';
export { NetworkDevice } from './NetworkDevice.js';
export { Maintenance } from './Maintenance.js';
export { AuditLog } from './AuditLog.js';
export { Notification } from './Notification.js';
export { PurchaseOrder, Invoice } from './Procurement.js';
export { MasterSetting } from './MasterSetting.js';
export { Inward } from './Inward.js';
export { Transfer } from './Transfer.js';
