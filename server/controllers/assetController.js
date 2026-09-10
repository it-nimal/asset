import { Asset } from '../models/Asset.js';
import { isDBConnected } from '../config/db.js';

// @desc    Get all assets (with multi-field search and filters)
// @route   GET /api/assets
export const getAssets = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Please verify MongoDB Atlas connection.',
        data: [],
      });
    }

    const { search, status, plant } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { sr: { $regex: search, $options: 'i' } },
        { assetNo: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { empCode: { $regex: search, $options: 'i' } },
        { mailId: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { plant: { $regex: search, $options: 'i' } },
        { hostName: { $regex: search, $options: 'i' } },
        { macAddress: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
        { billNo: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (plant && plant !== 'All') {
      query.plant = plant;
    }

    const assets = await Asset.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single asset by ID
// @route   GET /api/assets/:id
export const getAssetById = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected' });
    }

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new asset (Inward entry)
// @route   POST /api/assets
export const createAsset = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Please verify MongoDB Atlas connection.',
      });
    }

    const assetData = { ...req.body };
    const actor = req.body.actorName || 'IT Admin';

    // Auto-populate initial history entry if not provided
    if (!assetData.history || assetData.history.length === 0) {
      const isAssigned = assetData.status === 'Assigned' && assetData.userName && assetData.userName !== 'Unassigned';
      assetData.history = [
        {
          action: 'Inwarded',
          date: new Date(),
          user: actor,
          details: isAssigned
            ? `Inwarded and directly allocated to ${assetData.userName} (${assetData.empCode || 'No Code'})`
            : `Inwarded as ${assetData.status || 'Available'} into ${assetData.plant || '22Godam'} inventory stock`,
        },
      ];
    }

    const asset = await Asset.create(assetData);

    // Audit log
    try {
      const { AuditLog } = await import('../models/Asset.js');
      await AuditLog.create({
        user: actor,
        role: 'IT Admin',
        action: 'Asset Inwarded',
        assetTag: asset.assetNo || asset.sr,
        details: `Inwarded ${asset.make} ${asset.model} (${asset.deviceType}) into ${asset.plant}`,
        ipAddress: req.ip || '127.0.0.1',
      });
    } catch {}

    // If directly assigned on inward, sync employee record
    if (asset.userName && asset.userName !== 'Unassigned') {
      try {
        const { Employee } = await import('../models/Asset.js');
        const email = asset.mailId || `${asset.userName.toLowerCase().replace(/[^a-z0-9]/g, '')}@vitromed.com`;
        const code = asset.empCode || `VIT-${Math.floor(1000 + Math.random() * 9000)}`;
        await Employee.findOneAndUpdate(
          { $or: [{ name: asset.userName }, { email }] },
          {
            $setOnInsert: {
              employeeId: code,
              name: asset.userName,
              email,
              department: asset.department || 'General',
              location: asset.plant || '22Godam',
              status: 'Active',
            },
          },
          { upsert: true }
        );
      } catch {}
    }

    res.status(201).json({
      success: true,
      data: asset,
      message: `Asset "${asset.make} ${asset.model}" recorded in database successfully`,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `An asset with Serial Number (SR) "${req.body.sr}" already exists!`,
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update asset (User allocation, specs, licenses, or status)
// @route   PUT /api/assets/:id
export const updateAsset = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected' });
    }

    const existing = await Asset.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const updates = { ...req.body };
    const changedFields = Object.keys(updates).filter(
      (k) => k !== 'history' && updates[k] !== undefined && String(updates[k]) !== String(existing[k])
    );

    // If custodian changed, auto-update employee record and add history entry
    if (updates.userName && updates.userName !== existing.userName) {
      if (!existing.history) existing.history = [];
      existing.history.unshift({
        action: 'Custodian Changed',
        date: new Date(),
        user: req.body.actorName || 'IT Admin',
        details: `Custodian updated from [${existing.userName}] to [${updates.userName}]`,
      });
      // Auto-upsert employee
      try {
        const { Employee } = await import('../models/Asset.js');
        const code = updates.empCode || existing.empCode || `VIT-${Math.floor(1000 + Math.random() * 9000)}`;
        const email = updates.mailId || `${updates.userName.toLowerCase().replace(/[^a-z0-9]/g, '')}@vitromed.com`;
        await Employee.findOneAndUpdate(
          { $or: [{ name: updates.userName }, { email }] },
          {
            $setOnInsert: {
              employeeId: code,
              name: updates.userName,
              email,
              department: updates.department || existing.department,
              location: updates.plant || existing.plant,
              status: 'Active',
            },
          },
          { upsert: true }
        );
      } catch {}
    } else if (changedFields.length > 0) {
      if (!existing.history) existing.history = [];
      existing.history.unshift({
        action: 'Updated',
        date: new Date(),
        user: req.body.actorName || 'IT Admin',
        details: `Updated attributes: ${changedFields.slice(0, 4).join(', ')}${changedFields.length > 4 ? ` (+${changedFields.length - 4} more)` : ''}`,
      });
    }

    // Apply all updates
    Object.assign(existing, updates);
    await existing.save();

    // Audit log
    try {
      const { AuditLog } = await import('../models/Asset.js');
      await AuditLog.create({
        user: req.body.actorName || 'IT Admin',
        action: 'Asset Updated',
        assetTag: existing.sr || existing.assetNo || 'AST-N/A',
        details: `Updated ${changedFields.length} attributes on ${existing.make} ${existing.model}`,
        ipAddress: req.ip || '127.0.0.1',
      });
    } catch {}

    res.status(200).json({
      success: true,
      data: existing,
      message: 'Asset updated successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
export const deleteAsset = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected' });
    }

    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard metrics & stats summary
// @route   GET /api/assets/stats/summary
export const getAssetStats = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(200).json({
        success: true,
        data: {
          total: 0,
          available: 0,
          inUse: 0,
          maintenance: 0,
          plantCounts: {},
          dbConnected: false,
        },
      });
    }

    const total = await Asset.countDocuments();
    const available = await Asset.countDocuments({ status: { $in: ['Available', 'In Stock'] } });
    const assigned = await Asset.countDocuments({ status: 'Assigned' });
    const maintenance = await Asset.countDocuments({ status: 'Under Maintenance' });
    const retired = await Asset.countDocuments({ status: 'Retired' });
    const lost = await Asset.countDocuments({ status: { $in: ['Lost', 'Stolen'] } });

    // 30 days from now for warranty and license checks
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const warrantyExpiringSoon = await Asset.countDocuments({
      warrantyEndDate: { $gte: now, $lte: in30Days },
    });

    // Breakdown by Category / Device Type
    const categoryAgg = await Asset.aggregate([
      { $group: { _id: '$deviceType', count: { $sum: 1 }, totalValue: { $sum: '$purchasePrice' } } },
      { $sort: { count: -1 } },
    ]);

    // Breakdown by Department
    const deptAgg = await Asset.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Breakdown by Location / Plant
    const plantAgg = await Asset.aggregate([
      { $group: { _id: '$plant', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Status Distribution
    const statusAgg = await Asset.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Recent Audit Logs / Activities
    const { AuditLog, Notification } = await import('../models/Asset.js');
    const recentActivities = await AuditLog.find().sort({ createdAt: -1 }).limit(10);
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(8);

    res.status(200).json({
      success: true,
      data: {
        total,
        assigned,
        available,
        inUse: assigned,
        maintenance,
        retired,
        lost,
        warrantyExpiringSoon,
        categoryBreakdown: categoryAgg.map(c => ({ name: c._id || 'Other', count: c.count, value: c.totalValue })),
        departmentBreakdown: deptAgg.map(d => ({ name: d._id || 'Unassigned', count: d.count })),
        locationBreakdown: plantAgg.map(p => ({ name: p._id || 'HQ', count: p.count })),
        statusDistribution: statusAgg.map(s => ({ name: s._id || 'Unknown', count: s.count })),
        recentActivities,
        notifications,
        dbConnected: true,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign asset to employee
// @route   POST /api/assets/:id/assign
// @desc    Assign asset to employee
// @route   POST /api/assets/:id/assign
export const assignAsset = async (req, res) => {
  try {
    const { userName, empCode, mailId, department, plant, floorCabin, expectedReturnDate, remarks, actorName } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (!userName || userName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Custodian name is required' });
    }

    asset.status = 'Assigned';
    asset.userName = userName.trim();
    asset.empCode = empCode || asset.empCode || '';
    asset.mailId = mailId || asset.mailId || '';
    asset.department = department || asset.department || 'General';
    asset.plant = plant || asset.plant || '22Godam';
    if (floorCabin) asset.floorCabin = floorCabin;
    asset.assignedDate = new Date();
    if (expectedReturnDate) asset.expectedReturnDate = new Date(expectedReturnDate);
    if (remarks) asset.remarks = remarks;

    asset.history.unshift({
      action: 'Assigned',
      date: new Date(),
      user: actorName || 'IT Admin',
      details: `Allocated to ${userName} (${empCode || 'N/A'}) - ${department || asset.department}`,
    });

    await asset.save();

    // Auto-upsert employee record in background
    try {
      const { Employee } = await import('../models/Asset.js');
      const email = mailId || `${userName.toLowerCase().replace(/[^a-z0-9]/g, '')}@vitromed.com`;
      const code = empCode || `VIT-${Math.floor(1000 + Math.random() * 9000)}`;
      await Employee.findOneAndUpdate(
        { $or: [{ name: userName }, { email }] },
        {
          $setOnInsert: {
            employeeId: code,
            name: userName,
            email,
            department: asset.department,
            location: asset.plant,
            status: 'Active',
          },
        },
        { upsert: true }
      );
    } catch {}

    const { AuditLog } = await import('../models/Asset.js');
    await AuditLog.create({
      user: actorName || 'IT Admin',
      action: 'Asset Assigned',
      assetTag: asset.sr || asset.assetNo,
      details: `Assigned to ${userName} (${department || asset.department})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({ success: true, data: asset, message: `Asset assigned to ${userName} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Return asset from employee back to stock
// @route   POST /api/assets/:id/return
export const returnAsset = async (req, res) => {
  try {
    const { returnCondition, workingCondition, damageDetails, notes, remarks, actorName } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const prevUser = asset.userName;
    const cond = returnCondition || workingCondition || 'Good';
    const noteText = notes || remarks || '';

    asset.status = 'Available';
    asset.userName = 'Unassigned';
    asset.empCode = '';
    asset.mailId = '';
    asset.workingCondition = cond;
    asset.assignedDate = null;
    asset.expectedReturnDate = null;
    if (noteText) asset.remarks = noteText;

    asset.history.unshift({
      action: 'Returned',
      date: new Date(),
      user: actorName || 'IT Admin',
      details: `Returned from ${prevUser}. Condition: ${cond}. ${damageDetails ? 'Damage note: ' + damageDetails : ''}`,
    });

    await asset.save();

    const { AuditLog } = await import('../models/Asset.js');
    await AuditLog.create({
      user: actorName || 'IT Admin',
      action: 'Asset Returned',
      assetTag: asset.sr || asset.assetNo,
      details: `Returned by ${prevUser} -> Stock (${cond})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({ success: true, data: asset, message: 'Asset returned to stock successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Transfer asset between employees, departments, or locations
// @route   POST /api/assets/:id/transfer
export const transferAsset = async (req, res) => {
  try {
    const { newUserName, newUserId, newEmpCode, newMailId, newDepartment, newLocation, transferReason, remarks, actorName } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const targetUser = newUserName?.trim();
    if (!targetUser) {
      return res.status(400).json({ success: false, message: 'New custodian name is required' });
    }

    const prevOwner = `${asset.userName} (${asset.department} - ${asset.plant})`;
    const code = newEmpCode || newUserId || asset.empCode;
    const reason = transferReason || remarks || 'Departmental reorganization';

    asset.userName = targetUser;
    asset.empCode = code;
    if (newMailId) asset.mailId = newMailId;
    asset.department = newDepartment || asset.department;
    asset.plant = newLocation || asset.plant;
    asset.status = 'Assigned';

    asset.history.unshift({
      action: 'Transferred',
      date: new Date(),
      user: actorName || 'IT Admin',
      details: `Transferred from [${prevOwner}] to [${targetUser} - ${asset.department} - ${asset.plant}]. Reason: ${reason}`,
    });

    await asset.save();

    // Auto-upsert employee record in background
    try {
      const { Employee } = await import('../models/Asset.js');
      const email = newMailId || `${targetUser.toLowerCase().replace(/[^a-z0-9]/g, '')}@vitromed.com`;
      await Employee.findOneAndUpdate(
        { $or: [{ name: targetUser }, { email }] },
        {
          $setOnInsert: {
            employeeId: code || `VIT-${Math.floor(1000 + Math.random() * 9000)}`,
            name: targetUser,
            email,
            department: asset.department,
            location: asset.plant,
            status: 'Active',
          },
        },
        { upsert: true }
      );
    } catch {}

    const { AuditLog } = await import('../models/Asset.js');
    await AuditLog.create({
      user: actorName || 'IT Admin',
      action: 'Asset Transferred',
      assetTag: asset.sr || asset.assetNo,
      details: `Transferred: ${prevOwner} -> ${targetUser} (${asset.department})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({ success: true, data: asset, message: 'Asset transferred successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

