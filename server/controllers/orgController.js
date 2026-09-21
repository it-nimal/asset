import {
  Asset,
  User,
  Employee,
  Department,
  Location,
  Vendor,
  Software,
  NetworkDevice,
  Maintenance,
  AuditLog,
  Notification,
  PurchaseOrder,
  Invoice,
  MasterSetting,
  Inward,
  Transfer,
} from '../models/Asset.js';
import { isDBConnected } from '../config/db.js';

// ==========================================
// ORGCONTROLLER
// ==========================================

export const COMPANY_DEPARTMENTS = [
  'Vitromed Baisgodam 3rd Floor',
  'Vitromed Baisgodam 2nd Floor',
  'Accounts',
  'Production',
  'Vitromed Baisgodam 1st Floor',
  'JPPL',
  'Quality Lab',
  'HRD',
  'ETO & Dispatch',
  'Tool Room',
  'Maintenance',
  'Purchase',
  'Moulding',
  'IT',
  'Admin',
  'Avacara',
  'Audit',
  'Store (Main Store)',
  'OPEX',
  'Tubing',
  'Store (Component)',
  'Store (Metal gate)',
  'Trocar',
  'Marketing',
  'Store (Duplex & MFG)',
];

export const getDepartments = async (req, res) => {
  try {
    const existingCount = await Department.countDocuments();
    if (existingCount < 25) {
      for (let i = 0; i < COMPANY_DEPARTMENTS.length; i++) {
        const name = COMPANY_DEPARTMENTS[i];
        await Department.findOneAndUpdate(
          { name },
          { name, code: `DEPT-${String(i + 1).padStart(2, '0')}`, location: 'Vitromed' },
          { upsert: true }
        );
      }
    }
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, data: dept });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, manager, location, code } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }
    const cleanName = name.trim();
    const cleanCode = code?.trim() || `DEPT-${Math.floor(100 + Math.random() * 900)}`;
    const dept = await Department.findOneAndUpdate(
      { name: cleanName },
      { name: cleanName, manager: manager || 'Head of Department', location: location || 'Vitromed', code: cleanCode },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true, data: dept, message: 'Department saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, data: dept, message: 'Department updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, message: `Department "${dept.name}" deleted successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 4. LOCATION CONTROLLERS
// ==========================================

export const getLocations = async (req, res) => {
  try {
    const count = await Location.countDocuments();
    if (count === 0) {
      await Location.create({
        name: 'Vitromed',
        address: 'Vitromed Manufacturing & Operations Facility, Jaipur',
        building: 'Main Facility',
      });
    }
    const locations = await Location.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.status(200).json({ success: true, data: location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createLocation = async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json({ success: true, data: location, message: 'Location added successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.status(200).json({ success: true, data: location, message: 'Location updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.status(200).json({ success: true, message: `Location "${location.name}" deleted successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 5. VENDOR CONTROLLERS
// ==========================================

export const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: vendors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.status(200).json({ success: true, data: vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);
    res.status(201).json({ success: true, data: vendor, message: 'Vendor registered successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.status(200).json({ success: true, data: vendor, message: 'Vendor updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.status(200).json({ success: true, message: `Vendor "${vendor.name}" deleted successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 6. SOFTWARE (SAM) CONTROLLERS
// ==========================================

