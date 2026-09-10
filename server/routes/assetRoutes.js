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
    let employees = await Employee.find().sort({ name: 1 });
    if (employees.length === 0) {
      // Auto-populate employees from existing asset custodians if collection is empty
      const assetsWithUsers = await Asset.find({ userName: { $nin: ['Unassigned', '', null] } });
      const seen = new Set();
      const newEmps = [];
      let idx = 1001;
      for (const a of assetsWithUsers) {
        const u = a.userName?.trim();
        if (u && !seen.has(u.toLowerCase())) {
          seen.add(u.toLowerCase());
          newEmps.push({
            employeeId: a.empCode || `VIT-${idx++}`,
            name: u.charAt(0).toUpperCase() + u.slice(1),
            email: a.mailId || `${u.toLowerCase().replace(/[^a-z0-9]/g, '')}@vitromed.com`,
            department: a.department || 'General',
            location: a.plant || '22Godam',
            designation: `${a.department || 'Operations'} Staff`,
            phone: `+91-98765${String(idx).padStart(5, '0').slice(-5)}`,
            status: 'Active',
          });
        }
      }
      if (newEmps.length > 0) {
        try {
          await Employee.insertMany(newEmps, { ordered: false });
        } catch {
          // ignore duplicate key errors if any
        }
        employees = await Employee.find().sort({ name: 1 });
      }
    }
    res.status(200).json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/employees', async (req, res) => {
  try {
    let { employeeId, name, email, department, location, designation, phone, status, actorName } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Employee name is required' });
    }

    // Auto-generate employeeId if not provided
    if (!employeeId?.trim()) {
      const highestEmp = await Employee.findOne({ employeeId: /^VIT-\d+$/ }).sort({ employeeId: -1 });
      let nextNum = 1001;
      if (highestEmp && highestEmp.employeeId) {
        const num = parseInt(highestEmp.employeeId.replace('VIT-', ''), 10);
        if (!isNaN(num)) nextNum = num + 1;
      }
      employeeId = `VIT-${nextNum}`;
    }

    // Check uniqueness of employeeId
    const existingId = await Employee.findOne({ employeeId: employeeId.trim() });
    if (existingId) {
      return res.status(400).json({ success: false, message: `Employee ID "${employeeId}" is already assigned to ${existingId.name}` });
    }

    // Check email uniqueness or generate default
    if (!email?.trim()) {
      email = `${name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@vitromed.com`;
    }
    const existingEmail = await Employee.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: `Email "${email}" is already registered` });
    }

    const employee = await Employee.create({
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department?.trim() || 'General',
      location: location?.trim() || '22Godam',
      designation: designation?.trim() || 'Associate',
      phone: phone?.trim() || '',
      status: status || 'Active',
    });

    await AuditLog.create({
      user: actorName || 'IT Admin',
      role: 'IT Admin',
      action: 'Employee Created',
      details: `Registered new employee "${employee.name}" with ID "${employee.employeeId}"`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({ success: true, data: employee, message: `Employee "${employee.name}" created with ID ${employee.employeeId}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const oldEmp = await Employee.findById(id);
    if (!oldEmp) {
      return res.status(404).json({ success: false, message: 'Employee record not found' });
    }

    const { employeeId, name, email, department, location, designation, phone, status, actorName } = req.body;

    const previousId = oldEmp.employeeId;
    const previousName = oldEmp.name;

    // Check if new employeeId is already taken by someone else
    if (employeeId && employeeId.trim() !== oldEmp.employeeId) {
      const existing = await Employee.findOne({ employeeId: employeeId.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ success: false, message: `Employee ID "${employeeId}" is already assigned to ${existing.name}` });
      }
    }

    // Check if new email is already taken
    if (email && email.trim().toLowerCase() !== oldEmp.email.toLowerCase()) {
      const existingEmail = await Employee.findOne({ email: email.trim().toLowerCase(), _id: { $ne: id } });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: `Email "${email}" is already registered to another staff member` });
      }
    }

    const updated = await Employee.findByIdAndUpdate(
      id,
      {
        employeeId: employeeId?.trim() || oldEmp.employeeId,
        name: name?.trim() || oldEmp.name,
        email: email ? email.trim().toLowerCase() : oldEmp.email,
        department: department?.trim() || oldEmp.department,
        location: location?.trim() || oldEmp.location,
        designation: designation?.trim() || oldEmp.designation,
        phone: phone?.trim() || oldEmp.phone,
        status: status || oldEmp.status,
      },
      { new: true, runValidators: true }
    );

    // Sync assets assigned to this employee if employeeId or name changed
    if ((employeeId && employeeId.trim() !== previousId) || (name && name.trim() !== previousName)) {
      const escapedPrevName = previousName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedPrevId = previousId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await Asset.updateMany(
        {
          $or: [
            { userName: { $regex: new RegExp(`^${escapedPrevName}$`, 'i') } },
            { empCode: { $regex: new RegExp(`^${escapedPrevId}$`, 'i') } }
          ]
        },
        {
          $set: {
            userName: updated.name,
            empCode: updated.employeeId,
            mailId: updated.email,
            department: updated.department,
            plant: updated.location,
          }
        }
      );
    }

    // Record audit log
    await AuditLog.create({
      user: actorName || 'IT Admin',
      role: 'IT Admin',
      action: 'Employee Updated',
      details: `Updated Employee "${updated.name}" (Assigned ID: "${updated.employeeId}", Dept: "${updated.department}")`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({ success: true, data: updated, message: `Employee ID & profile for ${updated.name} updated successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await Employee.findById(id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee record not found' });
    }

    // Check if employee has assigned assets
    const assignedCount = await Asset.countDocuments({
      $or: [
        { userName: emp.name },
        { empCode: emp.employeeId }
      ]
    });

    if (assignedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete employee "${emp.name}" because they have ${assignedCount} active hardware asset(s) assigned. Please return or transfer the assets first.`
      });
    }

    await Employee.findByIdAndDelete(id);

    await AuditLog.create({
      user: req.body?.actorName || 'IT Admin',
      role: 'IT Admin',
      action: 'Employee Deleted',
      details: `Deleted employee record "${emp.name}" (ID: ${emp.employeeId})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({ success: true, message: `Employee "${emp.name}" deleted successfully` });
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
