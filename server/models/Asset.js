import mongoose from 'mongoose';

mongoose.set('autoIndex', false);

const assetSchema = new mongoose.Schema(
  {
    // 1. Plant & Identification
    sn: {
      type: Number,
      default: null,
    },
    plant: {
      type: String,
      default: 'Vitromed',
      trim: true,
    },
    assetNo: {
      type: String,
      trim: true,
    },

    // 2. User & Allocation Details
    userStatus: {
      type: String,
      default: 'Active',
      trim: true,
    },
    userName: {
      type: String,
      default: 'Unassigned',
      trim: true,
    },
    empCode: {
      type: String,
      trim: true,
    },
    mailId: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      default: 'IT',
      trim: true,
    },
    officialNumber: {
      type: String,
      trim: true,
    },
    sapId: {
      type: String,
      trim: true,
    },
    floorCabin: {
      type: String,
      default: 'Main Floor',
      trim: true,
    },

    // 3. Hardware Specifications
    deviceType: {
      type: String,
      default: 'Laptop',
      trim: true,
    },
    vncPassword: {
      type: String,
      trim: true,
    },
    make: {
      type: String,
      required: [true, 'Make is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    sr: {
      type: String,
      required: [true, 'Serial number (SR) is required'],
      unique: true,
      trim: true,
    },
    processor: {
      type: String,
      default: 'Intel Core i5',
      trim: true,
    },
    ramSize: {
      type: String,
      default: '16 GB',
      trim: true,
    },
    storage: {
      type: String,
      default: '512 GB SSD',
      trim: true,
    },
    monitorDetails: {
      type: String,
      trim: true,
    },
    monitorSerialNo: {
      type: String,
      trim: true,
    },
    dataBackup: {
      type: String,
      trim: true,
    },
    accessories: {
      type: String,
      trim: true,
    },

    // 4. Software & Licenses
    osVersion: {
      type: String,
      default: 'Windows 11 Pro',
      trim: true,
    },
    windowsType: {
      type: String,
      trim: true,
    },
    windowsKey: {
      type: String,
      trim: true,
    },
    officeSoftware: {
      type: String,
      default: 'MS Office 2021',
      trim: true,
    },
    officeKey: {
      type: String,
      trim: true,
    },
    mailSoftware: {
      type: String,
      trim: true,
    },
    loginUserName: {
      type: String,
      trim: true,
    },
    loginPassword: {
      type: String,
      trim: true,
    },
    antivirus: {
      type: String,
      default: 'eScan',
      trim: true,
    },
    otherSoftware: {
      type: String,
      trim: true,
    },

    // 5. Network & System Identity
    hostName: {
      type: String,
      trim: true,
    },
    pcGroup: {
      type: String,
      default: 'Workgroup',
      trim: true,
    },
    escanPolicy: {
      type: String,
      trim: true,
    },
    macAddress: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },

    // 6. Procurement, Inward & Invoice Details
    indentNo: {
      type: String,
      trim: true,
    },
    po: {
      type: String,
      trim: true,
    },
    billNo: {
      type: String,
      trim: true,
    },
    billCopyDate: {
      type: String,
      trim: true,
    },
    inwardNumber: {
      type: String,
      trim: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
      default: Date.now,
    },
    vendorName: {
      type: String,
      trim: true,
    },
    warrantyDetails: {
      type: String,
      default: '3 Years On-Site',
      trim: true,
    },
    invoiceImage: {
      type: String, // Base64 data URL (e.g. data:image/jpeg;base64,...)
    },

    category: {
      type: String,
      default: 'computing',
      trim: true,
    },
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
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
    managementIp: {
      type: String,
      trim: true,
    },
    managementVlan: {
      type: String,
      trim: true,
    },

    // 7. Status & Condition
    status: {
      type: String,
      enum: ['Available', 'Assigned', 'In Stock', 'Reserved', 'Under Maintenance', 'Under QC', 'Damaged', 'Lost', 'Stolen', 'Retired', 'Disposed'],
      default: 'Available',
    },
    workingCondition: {
      type: String,
      default: 'Good',
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    receiptAcknowledged: {
      type: Boolean,
      default: false,
    },
    receiptAcknowledgedAt: {
      type: Date,
    },
    acknowledgementNotes: {
      type: String,
      default: '',
      trim: true,
    },


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
        action: { type: String, required: true }, // e.g., Created, Inwarded, Assigned, Returned, Transferred, Maintenance, Retired, Disposed
        date: { type: Date, default: Date.now },
        user: { type: String, default: 'System Admin' },
        details: { type: String },
      }
    ],
  },
  {
    timestamps: true,
    autoIndex: false,
    strict: false,
  }
);

assetSchema.index({ assetNo: 1 });
assetSchema.index({ sr: 1 });
assetSchema.index({ status: 1 });
assetSchema.index({ category: 1 });
assetSchema.index({ deviceType: 1 });
assetSchema.index({ plant: 1 });
assetSchema.index({ department: 1 });
assetSchema.index({ userName: 1 });
assetSchema.index({ empCode: 1 });
assetSchema.index({ warrantyEndDate: 1 });

export const Asset = mongoose.model('Asset', assetSchema);

// User & Auth Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Super Admin', 'IT Admin', 'IT Technician', 'Manager', 'Employee'],
    default: 'Employee',
  },
  department: { type: String, default: 'IT' },
  avatar: { type: String },
  active: { type: Boolean, default: true },
}, { timestamps: true, autoIndex: false });

export const User = mongoose.model('User', userSchema);

// Department Model
const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  manager: { type: String, default: 'Head of Department' },
  location: { type: String, default: 'Vitromed' },
}, { timestamps: true, autoIndex: false });

export const Department = mongoose.model('Department', departmentSchema);

// Location Model
const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  building: { type: String, default: 'Tower A' },
  floor: { type: String, default: '1st Floor' },
  room: { type: String, default: 'Room 101' },
  address: { type: String },
}, { timestamps: true, autoIndex: false });

export const Location = mongoose.model('Location', locationSchema);

// Employee Model
const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  department: { type: String, required: true },
  designation: { type: String, default: 'Associate' },
  location: { type: String, default: 'Vitromed' },
  joiningDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'On Leave', 'Resigned'], default: 'Active' },
}, { timestamps: true, autoIndex: false });

export const Employee = mongoose.model('Employee', employeeSchema);

// Vendor Model
const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  contactPerson: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  category: { type: String, default: 'Hardware & IT Equipment' },
}, { timestamps: true, autoIndex: false });

export const Vendor = mongoose.model('Vendor', vendorSchema);

// Software Model
const softwareSchema = new mongoose.Schema({
  softwareName: { type: String, required: true },
  version: { type: String, default: '1.0' },
  vendor: { type: String, default: 'Microsoft' },
  licenseType: { type: String, enum: ['Volume', 'Perpetual', 'Subscription / Cloud', 'Open Source', 'OEM'], default: 'Subscription / Cloud' },
  licenseKey: { type: String },
  licenseCount: { type: Number, default: 10 },
  usedLicenses: { type: Number, default: 0 },
  purchaseDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  cost: { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true, autoIndex: false });

export const Software = mongoose.model('Software', softwareSchema);

// Network Device Model
const networkDeviceSchema = new mongoose.Schema({
  hostname: { type: String, required: true },
  deviceType: { type: String, enum: ['Switch', 'Router', 'Firewall', 'Access Point', 'Wireless Controller', 'Server'], default: 'Switch' },
  ipAddress: { type: String, required: true },
  managementIp: { type: String },
  macAddress: { type: String },
  serialNumber: { type: String, unique: true },
  vendor: { type: String, default: 'Cisco' },
  model: { type: String, default: 'Catalyst 2960' },
  firmwareVersion: { type: String, default: 'v15.2' },
  location: { type: String, default: 'Vitromed HQ - Server Room' },
  rack: { type: String, default: 'Rack-01' },
  uPosition: { type: String, default: 'U12' },
  status: { type: String, enum: ['Online', 'Offline', 'Maintenance', 'Decommissioned'], default: 'Online' },
}, { timestamps: true, autoIndex: false });

export const NetworkDevice = mongoose.model('NetworkDevice', networkDeviceSchema);

// Maintenance Ticket Model
const maintenanceSchema = new mongoose.Schema({
  maintenanceId: { type: String, required: true, unique: true }, // MNT-VIT-XXXXXX
  ticketId: { type: String }, // For backwards compatibility
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  assetTag: { type: String },
  assetCategory: { type: String },
  assetMake: { type: String },
  assetModel: { type: String },
  assetSerial: { type: String },

  employeeId: { type: String },
  employeeName: { type: String },
  empCode: { type: String },
  department: { type: String },

  reportedBy: { type: String, default: 'IT Staff' },
  reportedDate: { type: Date, default: Date.now },

  issueCategory: {
    type: String,
    enum: ['Hardware', 'Software', 'Network', 'Power', 'Physical Damage', 'Performance', 'Other'],
    default: 'Hardware',
  },
  issueDescription: { type: String, required: true },
  issue: { type: String }, // alias
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },

  status: {
    type: String,
    enum: [
      'Reported',
      'Under Diagnosis',
      'In Repair',
      'Awaiting Vendor',
      'Awaiting Parts',
      'QC Pending',
      'Ready',
      'Returned',
      'Cancelled',
      'Open',
      'In Progress',
      'Resolved',
      'Closed',
    ],
    default: 'Reported',
  },

  diagnosis: { type: String, default: '' },
  rootCause: { type: String, default: '' },
  recommendedAction: { type: String, default: '' },
  diagnosedBy: { type: String, default: '' },
  diagnosisDate: { type: Date },

  repairType: {
    type: String,
    enum: ['Internal IT Repair', 'Vendor Repair', 'Warranty Repair', 'Replacement', ''],
    default: '',
  },
  vendor: { type: String, default: '' },
  serviceVendor: { type: String, default: '' },
  warrantyStatus: {
    type: String,
    enum: ['In Warranty', 'Out of Warranty', 'Unknown', ''],
    default: '',
  },
  sentDate: { type: Date },
  expectedReturnDate: { type: Date },
  completedDate: { type: Date },
  partsReplaced: { type: String, default: '' },
  serviceNotes: { type: String, default: '' },
  repairCost: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },

  qcResult: { type: String, enum: ['Passed', 'Failed', 'Pending', ''], default: '' },
  qcNotes: { type: String, default: '' },
  qcBy: { type: String, default: '' },
  qcDate: { type: Date },

  finalDisposition: {
    type: String,
    enum: ['Return to Employee', 'Return to Stock', 'Retire', ''],
    default: '',
  },
  returnedDate: { type: Date },
  attachments: [
    {
      fileName: String,
      fileUrl: String,
      fileType: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  technician: { type: String, default: 'IT Support' },
  resolution: { type: String, default: '' },
  history: [
    {
      date: { type: Date, default: Date.now },
      action: String,
      performedBy: String,
      details: String,
    },
  ],
  createdBy: { type: String, default: 'IT Admin' },
  updatedBy: { type: String, default: 'IT Admin' },
}, { timestamps: true, autoIndex: false });

export const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

// Audit Log Model
const auditLogSchema = new mongoose.Schema({
  user: { type: String, required: true, default: 'System Admin' },
  role: { type: String, default: 'IT Admin' },
  action: { type: String, required: true },
  assetTag: { type: String },
  details: { type: String },
  ipAddress: { type: String, default: '127.0.0.1' },
}, { timestamps: true, autoIndex: false });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// Notification Model
const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['warranty', 'license', 'maintenance', 'assignment', 'alert'], default: 'alert' },
  read: { type: Boolean, default: false },
  link: { type: String },
}, { timestamps: true, autoIndex: false });

export const Notification = mongoose.model('Notification', notificationSchema);

// Purchase Order Model
const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true, trim: true },
  vendorName: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
  expectedDeliveryDate: { type: Date },
  status: { type: String, enum: ['Draft', 'Ordered', 'Partially Received', 'Received', 'Cancelled'], default: 'Ordered' },
  totalAmount: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  items: [
    {
      itemDescription: { type: String, required: true },
      category: { type: String, default: 'computing' },
      quantity: { type: Number, default: 1 },
      unitPrice: { type: Number, default: 0 },
      receivedQuantity: { type: Number, default: 0 },
    }
  ],
  notes: { type: String },
}, { timestamps: true, autoIndex: false });

export const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

// Invoice / Bill Document Model
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, trim: true },
  poNumber: { type: String, trim: true },
  vendorName: { type: String, required: true },
  invoiceDate: { type: Date, default: Date.now },
  amount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Partially Paid', 'Cancelled'], default: 'Paid' },
  attachmentUrl: { type: String },
  notes: { type: String },
}, { timestamps: true, autoIndex: false });

export const Invoice = mongoose.model('Invoice', invoiceSchema);

// Master Data Settings Model (Configurable Categories, Makes, Plants, Depts, Statuses)
const masterSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. 'master_config'
  categories: [{ id: String, name: String, icon: String, badgeColor: String, defaultType: String, types: [String], popularMakes: [String] }],
  plants: [{ name: String, code: String, address: String }],
  departments: [{ name: String, code: String, manager: String, location: String }],
  locations: [{ name: String, building: String, floor: String, room: String }],
  vendors: [{ name: String, contactPerson: String, email: String, phone: String, category: String }],
  statuses: [{ name: String, color: String, description: String }],
  roles: [{ name: String, description: String, permissions: [String] }],
}, { timestamps: true, autoIndex: false });

export const MasterSetting = mongoose.model('MasterSetting', masterSettingSchema);

// Inward Receiving & Verification Model
const inwardItemSchema = new mongoose.Schema({
  category: { type: String, trim: true },
  deviceType: { type: String, trim: true },
  manufacturer: { type: String, default: '', trim: true },
  model: { type: String, default: '', trim: true },
  quantity: { type: Number, default: 1 },
  specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
  accessories: { type: mongoose.Schema.Types.Mixed, default: {} },
  otherAccessories: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, default: 1 },
    },
  ],
  verifiedAssets: [
    {
      serialNumber: { type: String, default: '', trim: true },
      assetTag: { type: String, default: '', trim: true },
      condition: { type: String, default: 'Good' },
      status: { type: String, default: 'Pending' }, // 'Pending' | 'Created'
      specOverrides: { type: mongoose.Schema.Types.Mixed, default: {} },
      assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
    },
  ],
});

const inwardSchema = new mongoose.Schema(
  {
    inwardNumber: { type: String, required: true, unique: true, trim: true },
    receivedDate: { type: Date, default: Date.now },
    inwardDate: { type: Date, default: Date.now },
    vendor: { type: String, required: true, trim: true },
    invoiceNumber: { type: String, default: '', trim: true },
    purchaseOrderNumber: { type: String, default: '', trim: true },
    poNumber: { type: String, default: '', trim: true },
    invoiceDate: { type: Date },
    receivedAt: { type: String, default: 'Vitromed', trim: true },

    // Primary Received Item Fields
    category: { type: String, default: 'Computers & Laptops', trim: true },
    deviceType: { type: String, default: 'Laptop', trim: true },
    quantity: { type: Number, default: 1, min: 1 },
    manufacturer: { type: String, default: '', trim: true },
    model: { type: String, default: '', trim: true },

    // Dynamic Specifications Key-Values
    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Simple Yes/No Accessories Checklist with Description
    accessories: {
      monitor: { received: { type: Boolean, default: false }, description: { type: String, default: '' } },
      keyboard: { received: { type: Boolean, default: false }, description: { type: String, default: '' } },
      mouse: { received: { type: Boolean, default: false }, description: { type: String, default: '' } },
      powerAdapter: { received: { type: Boolean, default: false }, description: { type: String, default: '' } },
      cables: { received: { type: Boolean, default: false }, description: { type: String, default: '' } },
      other: { received: { type: Boolean, default: false }, description: { type: String, default: '' } },
    },

    // File Attachments
    attachments: [
      {
        fileName: { type: String },
        fileUrl: { type: String },
        fileType: { type: String, default: 'Invoice' }, // 'Invoice', 'Delivery Challan', 'Warranty', 'Other'
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    documents: [
      {
        docType: { type: String, default: 'Invoice' },
        fileName: { type: String },
        fileUrl: { type: String },
        fileSize: { type: Number },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    notes: { type: String, default: '', trim: true },
    remarks: { type: String, default: '', trim: true },

    // Status Lifecycle: Received -> Verification Pending -> Verified / Discrepancy -> Asset Created
    status: {
      type: String,
      enum: [
        'Received',
        'Verification Pending',
        'Verified',
        'Discrepancy',
        'Asset Created',
        'Draft',
        'Pending Asset Verification',
        'Verified & Created',
        'Cancelled',
      ],
      default: 'Received',
    },

    // Verification Details
    verificationDetails: {
      verifiedBy: { type: String, default: '' },
      verifiedAt: { type: Date },
      verificationNotes: { type: String, default: '' },
      hasDiscrepancy: { type: Boolean, default: false },
      discrepancyReason: { type: String, default: '' },
    },

    // Created Asset Master References
    createdAssets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
      },
    ],

    // Multi-item optional collection
    items: [inwardItemSchema],

    createdBy: { type: String, default: 'IT Admin' },
  },
  { timestamps: true, autoIndex: false }
);

export const Inward = mongoose.model('Inward', inwardSchema);

// Asset Transfer & Handover Model
const transferSchema = new mongoose.Schema(
  {
    transferId: { type: String, required: true, unique: true, trim: true }, // TRF-VIT-XXXXXX
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    assetTag: { type: String, trim: true },
    assetCategory: { type: String, trim: true },
    assetMake: { type: String, trim: true },
    assetModel: { type: String, trim: true },
    assetSerial: { type: String, trim: true },

    // Previous Custodian Snapshot
    fromEmployeeId: { type: String, trim: true },
    fromEmployeeName: { type: String, trim: true },
    fromEmpCode: { type: String, trim: true },
    fromDepartment: { type: String, trim: true },
    fromLocation: { type: String, trim: true },
    fromDesignation: { type: String, trim: true },
    fromEmail: { type: String, trim: true },

    // Destination Custodian Snapshot
    toEmployeeId: { type: String, required: true, trim: true },
    toEmployeeName: { type: String, required: true, trim: true },
    toEmpCode: { type: String, trim: true },
    toDepartment: { type: String, trim: true },
    toLocation: { type: String, trim: true },
    toDesignation: { type: String, trim: true },
    toEmail: { type: String, trim: true },

    transferDate: { type: Date, default: Date.now },
    reason: {
      type: String,
      enum: [
        'Employee Transfer',
        'Department Change',
        'Role Change',
        'Replacement',
        'Project Assignment',
        'Location Change',
        'Management Decision',
        'Other',
      ],
      default: 'Employee Transfer',
    },
    destinationLocation: { type: String, default: '', trim: true },
    remarks: { type: String, default: '', trim: true },

    // Condition & Accessories Snapshot
    assetCondition: {
      type: String,
      enum: ['Good', 'Minor Wear', 'Damaged'],
      default: 'Good',
    },
    accessoriesTransferred: { type: Boolean, default: true },
    accessoryNotes: { type: String, default: '', trim: true },

    // Workflow Status Lifecycle
    status: {
      type: String,
      enum: [
        'Pending',
        'Approved',
        'Handover Pending',
        'Acknowledgement Pending',
        'Completed',
        'Cancelled',
      ],
      default: 'Pending',
    },

    // Approval Metadata
    approvedBy: { type: String, default: '' },
    approvedDate: { type: Date },

    // Handover Metadata
    handedOverBy: { type: String, default: '' },
    handoverDate: { type: Date },

    // Employee Acknowledgement Metadata
    acknowledgedBy: { type: String, default: '' },
    acknowledgementDate: { type: Date },
    acknowledgementNotes: { type: String, default: '' },

    // Cancellation Metadata
    cancelledBy: { type: String, default: '' },
    cancelledDate: { type: Date },
    cancellationReason: { type: String, default: '' },

    // Timeline Audit History
    history: [
      {
        date: { type: Date, default: Date.now },
        action: { type: String, required: true },
        performedBy: { type: String, default: 'IT Admin' },
        details: { type: String, default: '' },
      },
    ],

    createdBy: { type: String, default: 'IT Admin' },
    updatedBy: { type: String, default: 'IT Admin' },
  },
  { timestamps: true, autoIndex: false }
);

export const Transfer = mongoose.model('Transfer', transferSchema);
