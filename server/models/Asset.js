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

    // 7. Status & Condition
    status: {
      type: String,
      enum: ['Available', 'Assigned', 'In Stock', 'Under Maintenance', 'Reserved', 'Lost', 'Stolen', 'Retired', 'Disposed'],
      default: 'Available',
    },
    workingCondition: {
      type: String,
      enum: ['New', 'Excellent', 'Good', 'Fair', 'Damaged', 'Needs Repair'],
      default: 'Good',
      trim: true,
    },
    remarks: {
      type: String,
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
        action: { type: String, required: true }, // e.g., Created, Assigned, Returned, Transferred, Maintenance
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
  ticketId: { type: String, required: true, unique: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
  assetTag: { type: String },
  assetName: { type: String },
  technician: { type: String, required: true },
  issue: { type: String, required: true },
  diagnosis: { type: String },
  resolution: { type: String },
  cost: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  nextMaintenanceDate: { type: Date },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
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

