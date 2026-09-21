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
// SYSTEMCONTROLLER
// ==========================================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email: email?.toLowerCase() });
    if (!user && email?.toLowerCase() === 'admin@vitromed.com' && password === 'admin123') {
      user = await User.create({
        name: 'IT Administrator',
        email: 'admin@vitromed.com',
        password: 'admin123',
        role: 'IT Admin',
        department: 'IT',
      });
    }
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = `jwt-${user._id}-${Date.now()}`;
    await AuditLog.create({
      user: user.name,
      role: user.role,
      action: 'User Login',
      details: `${user.name} logged into ITAM dashboard`,
      ipAddress: req.ip || '127.0.0.1',
    });
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Email "${email}" is already registered` });
    }
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Employee',
      department: department || 'IT',
    });
    res.status(201).json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department },
      message: `User ${user.name} created successfully`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.email) updateData.email = updateData.email.toLowerCase();
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user, message: 'User profile updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: `User account "${user.name}" deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 13. AUDIT LOG CONTROLLERS
// ==========================================

export const getAuditLogs = async (req, res) => {
  try {
    let logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);

    if (!logs || logs.length === 0) {
      const existingAssets = await Asset.find().limit(35);
      const seedAuditEntries = [];

      for (const a of existingAssets) {
        if (a.userName) {
          seedAuditEntries.push({
            user: 'IT Admin',
            role: 'IT Admin',
            action: 'Asset Assigned',
            assetTag: a.assetNo || a.sr,
            details: `Issued ${a.make} ${a.model} to ${a.userName} (${a.department || 'Vitromed'})`,
            ipAddress: a.ipAddress || '192.168.1.100',
            createdAt: a.updatedAt || new Date(),
          });
        }
        seedAuditEntries.push({
          user: 'System Admin',
          role: 'IT Admin',
          action: 'Asset Inwarded',
          assetTag: a.assetNo || a.sr,
          details: `Inwarded ${a.make} ${a.model} (${a.deviceType}) into Vitromed active inventory`,
          ipAddress: '127.0.0.1',
          createdAt: a.createdAt || new Date(Date.now() - 86400000 * 2),
        });
      }

      if (seedAuditEntries.length > 0) {
        await AuditLog.insertMany(seedAuditEntries.slice(0, 30));
        logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
      }
    }

    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.create({
      ...req.body,
      ipAddress: req.ip || req.body.ipAddress || '127.0.0.1',
    });
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const clearAuditLogs = async (req, res) => {
  try {
    await AuditLog.deleteMany({});
    res.status(200).json({ success: true, message: 'Audit logs cleared successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 14. NOTIFICATION CONTROLLERS
// ==========================================

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const notif = await Notification.create(req.body);
    res.status(201).json({ success: true, data: notif });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { $set: { read: true } });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.status(200).json({ success: true, message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 15. MASTER SETTINGS CONTROLLERS
// ==========================================

export const getMasterSettings = async (req, res) => {
  try {
    let setting = await MasterSetting.findOne({ key: 'master_config' });
    if (!setting) {
      setting = await MasterSetting.create({
        key: 'master_config',
        plants: [
          { name: 'Vitromed', code: 'VIT', address: '22 Godam Industrial Area, Jaipur' },
          { name: 'JPPL', code: 'JPL', address: 'Jaipur Poly Plast, Sitapura' },
          { name: 'Avacara', code: 'AVC', address: 'Avacara Health, Mahindra World City' },
        ],
        departments: [
          { name: 'Vitromed Baisgodam 3rd Floor', code: 'V3F' },
          { name: 'Vitromed Baisgodam 2nd Floor', code: 'V2F' },
          { name: 'Vitromed Baisgodam 1st Floor', code: 'V1F' },
          { name: 'Accounts', code: 'ACC' },
          { name: 'Production', code: 'PROD' },
          { name: 'Quality Lab', code: 'QC' },
          { name: 'HR', code: 'HR' },
          { name: 'IT', code: 'IT' },
          { name: 'Admin', code: 'ADM' },
          { name: 'Purchase', code: 'PUR' },
          { name: 'Store (Main Store)', code: 'STR' },
          { name: 'Maintenance', code: 'MNT' },
        ],
        statuses: [
          { name: 'Available', color: '#10b981', description: 'In stock ready for deployment' },
          { name: 'Assigned', color: '#0284c7', description: 'Allocated to active employee' },
          { name: 'Reserved', color: '#8b5cf6', description: 'Reserved for upcoming project' },
          { name: 'Under Maintenance', color: '#f59e0b', description: 'Sent for hardware repair' },
          { name: 'Under QC', color: '#06b6d4', description: 'Quality inspection testing' },
          { name: 'Damaged', color: '#ef4444', description: 'Physical damage reported' },
          { name: 'Retired', color: '#64748b', description: 'End of lifecycle decommission' },
          { name: 'Disposed', color: '#475569', description: 'Safely scrapped/recycled' },
        ],
      });
    }
    res.status(200).json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMasterSettings = async (req, res) => {
  try {
    const updated = await MasterSetting.findOneAndUpdate(
      { key: 'master_config' },
      { $set: req.body },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true, data: updated, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 16. SYSTEM & ALLOCATION CONTROLLERS
// ==========================================

export const clearAllData = async (req, res) => {
  try {
    await Promise.all([
      Asset.deleteMany({}),
      Employee.deleteMany({}),
      Department.deleteMany({}),
      Location.deleteMany({}),
      Vendor.deleteMany({}),
      Software.deleteMany({}),
      NetworkDevice.deleteMany({}),
      Maintenance.deleteMany({}),
      AuditLog.deleteMany({}),
      Notification.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      Invoice.deleteMany({}),
      Inward.deleteMany({}),
    ]);
    res.status(200).json({ success: true, message: 'All system data removed cleanly.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const seedDemoData = async (req, res) => {
  try {
    const { seedComprehensiveITAMData } = await import('../seed/demoSeed.js');
    const result = await seedComprehensiveITAMData();
    res.status(200).json({ success: true, message: 'Demo data successfully populated', result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const feedUserData = async (req, res) => {
  try {
    const { feedRealUserData } = await import('../seed/feedUserData.js');
    const count = await feedRealUserData();
    res.status(200).json({ success: true, message: `Successfully fed ${count} real user systems!`, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().sort({ orderDate: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Purchase order not found' });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    let { poNumber } = req.body;
    if (!poNumber) {
      const year = new Date().getFullYear();
      const count = await PurchaseOrder.countDocuments();
      poNumber = `PO-VIT-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    const order = await PurchaseOrder.create({ ...req.body, poNumber });
    res.status(201).json({ success: true, data: order, message: 'Purchase Order created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Purchase order not found' });
    res.status(200).json({ success: true, data: order, message: 'Purchase order updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Purchase order not found' });
    res.status(200).json({ success: true, message: `Purchase order ${order.poNumber} deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 11. INVOICE CONTROLLERS
// ==========================================

export const getInvoices = async (req, res) => {
  try {
    const invs = await Invoice.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: invs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.status(200).json({ success: true, data: inv });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const inv = await Invoice.create(req.body);
    res.status(201).json({ success: true, data: inv, message: 'Invoice created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const inv = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.status(200).json({ success: true, data: inv, message: 'Invoice updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const inv = await Invoice.findByIdAndDelete(req.params.id);
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.status(200).json({ success: true, message: `Invoice ${inv.invoiceNumber} deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 12. AUTH & USER CONTROLLERS
// ==========================================

