import express from 'express';
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetStats,
  assignAsset,
  returnAsset,
  transferAsset,
} from '../controllers/assetController.js';
import {
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
  Asset,
} from '../models/Asset.js';

const router = express.Router();

// ----------------- SYSTEM SEEDING & PURGE ENDPOINTS -----------------
router.delete('/system/clear-all', async (req, res) => {
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
    ]);
    res.status(200).json({ success: true, message: 'All dummy data removed cleanly from the system.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/seed/demo-data', async (req, res) => {
  try {
    const { seedComprehensiveITAMData } = await import('../seed/demoSeed.js');
    const result = await seedComprehensiveITAMData();
    res.status(200).json({ success: true, message: 'Demo data successfully populated', result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/system/feed-user-data', async (req, res) => {
  try {
    const { feedRealUserData } = await import('../seed/feedUserData.js');
    const count = await feedRealUserData();
    res.status(200).json({ success: true, message: `Successfully fed ${count} real user systems!`, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------- ASSET STATS & COLLECTION ROUTES -----------------
router.get('/stats/summary', getAssetStats);
router.route('/').get(getAssets).post(createAsset);

// ----------------- AUTHENTICATION -----------------
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    // Token simulation / session object
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
});

router.get('/auth/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------- EMPLOYEES & ORG -----------------
router.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/employees', async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/locations', async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/vendors', async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: vendors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------- SOFTWARE ASSET MANAGEMENT (SAM) -----------------
router.get('/software', async (req, res) => {
  try {
    const softwareList = await Software.find().sort({ softwareName: 1 });
    res.status(200).json({ success: true, data: softwareList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/software', async (req, res) => {
  try {
    const software = await Software.create(req.body);
    res.status(201).json({ success: true, data: software });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------- NETWORK DEVICES -----------------
router.get('/network-devices', async (req, res) => {
  try {
    const devices = await NetworkDevice.find().sort({ hostname: 1 });
    res.status(200).json({ success: true, data: devices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/network-devices', async (req, res) => {
  try {
    const device = await NetworkDevice.create(req.body);
    res.status(201).json({ success: true, data: device });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------- MAINTENANCE TICKETS -----------------
router.get('/maintenance', async (req, res) => {
  try {
    const tickets = await Maintenance.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/maintenance', async (req, res) => {
  try {
    const ticket = await Maintenance.create(req.body);
    // If ticket is open/in progress, optionally flag asset as Under Maintenance
    if (ticket.assetTag) {
      await Asset.findOneAndUpdate(
        { $or: [{ sr: ticket.assetTag }, { assetNo: ticket.assetTag }] },
        { status: 'Under Maintenance' }
      );
    }
    await AuditLog.create({
      user: ticket.technician || 'IT Technician',
      action: 'Maintenance Created',
      assetTag: ticket.assetTag,
      details: `Ticket ${ticket.ticketId}: ${ticket.issue}`,
      ipAddress: req.ip || '127.0.0.1',
    });
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/maintenance/:id/resolve', async (req, res) => {
  try {
    const { resolution, cost } = req.body;
    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    ticket.status = 'Resolved';
    ticket.resolution = resolution || 'Completed repairs';
    if (cost) ticket.cost = cost;
    ticket.endDate = new Date();
    await ticket.save();

    if (ticket.assetTag) {
      await Asset.findOneAndUpdate(
        { $or: [{ sr: ticket.assetTag }, { assetNo: ticket.assetTag }] },
        { status: 'Available' }
      );
    }
    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------- AUDIT LOGS & NOTIFICATIONS -----------------
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ----------------- PARAMETERIZED ASSET ID ROUTES (Catch-all for IDs) -----------------
router.route('/:id').get(getAssetById).put(updateAsset).delete(deleteAsset);
router.post('/:id/assign', assignAsset);
router.post('/:id/return', returnAsset);
router.post('/:id/transfer', transferAsset);

export default router;
