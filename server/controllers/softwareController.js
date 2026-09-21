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
// SOFTWARECONTROLLER
// ==========================================

export const getSoftware = async (req, res) => {
  try {
    const softwareList = await Software.find().sort({ softwareName: 1 });
    res.status(200).json({ success: true, data: softwareList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSoftwareById = async (req, res) => {
  try {
    const software = await Software.findById(req.params.id);
    if (!software) return res.status(404).json({ success: false, message: 'Software license not found' });
    res.status(200).json({ success: true, data: software });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createSoftware = async (req, res) => {
  try {
    const software = await Software.create(req.body);
    res.status(201).json({ success: true, data: software, message: 'Software license created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateSoftware = async (req, res) => {
  try {
    const software = await Software.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!software) return res.status(404).json({ success: false, message: 'Software license not found' });
    res.status(200).json({ success: true, data: software, message: 'Software license updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteSoftware = async (req, res) => {
  try {
    const software = await Software.findByIdAndDelete(req.params.id);
    if (!software) return res.status(404).json({ success: false, message: 'Software license not found' });
    res.status(200).json({ success: true, message: `Software "${software.softwareName}" deleted successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 7. NETWORK INFRASTRUCTURE CONTROLLERS
// ==========================================

export const getNetworkDevices = async (req, res) => {
  try {
    const devices = await NetworkDevice.find().sort({ hostname: 1 });
    res.status(200).json({ success: true, data: devices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNetworkDeviceById = async (req, res) => {
  try {
    const device = await NetworkDevice.findById(req.params.id);
    if (!device) return res.status(404).json({ success: false, message: 'Network device not found' });
    res.status(200).json({ success: true, data: device });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createNetworkDevice = async (req, res) => {
  try {
    const device = await NetworkDevice.create(req.body);
    res.status(201).json({ success: true, data: device, message: 'Network device registered successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateNetworkDevice = async (req, res) => {
  try {
    const device = await NetworkDevice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!device) return res.status(404).json({ success: false, message: 'Network device not found' });
    res.status(200).json({ success: true, data: device, message: 'Network device updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteNetworkDevice = async (req, res) => {
  try {
    const device = await NetworkDevice.findByIdAndDelete(req.params.id);
    if (!device) return res.status(404).json({ success: false, message: 'Network device not found' });
    res.status(200).json({ success: true, message: `Network node "${device.hostname}" removed successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 8. MAINTENANCE & REPAIR CONTROLLERS
// ==========================================

