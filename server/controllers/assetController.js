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
    const {
      userName,
      empCode,
      mailId,
      department,
      plant,
      floorCabin,
      assignedDate,
      expectedReturnDate,
      remarks,
      actorName,
      deviceType,
      accessories,
      monitorDetails,
      monitorSerialNo,
    } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    if (!userName || userName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Custodian name is required' });
    }

    const effectiveAssignedDate = assignedDate ? new Date(assignedDate) : new Date();
    const formattedDate = effectiveAssignedDate.toLocaleDateString('en-GB');

    asset.status = 'Assigned';
    asset.userName = userName.trim();
    asset.empCode = empCode || asset.empCode || '';
    asset.mailId = mailId || asset.mailId || '';
    asset.department = department || asset.department || 'General';
    asset.plant = plant || asset.plant || '22Godam';
    if (floorCabin) asset.floorCabin = floorCabin;
    asset.assignedDate = effectiveAssignedDate;
    if (expectedReturnDate) asset.expectedReturnDate = new Date(expectedReturnDate);
    if (remarks) asset.remarks = remarks;

    // Optional hardware & peripheral bundle options
    if (deviceType) asset.deviceType = deviceType;
    if (accessories !== undefined) asset.accessories = accessories;
    if (monitorDetails !== undefined) asset.monitorDetails = monitorDetails;
    if (monitorSerialNo !== undefined) asset.monitorSerialNo = monitorSerialNo;

    const peripheralSummary = asset.accessories ? ` | Peripherals: ${asset.accessories}` : '';

    asset.history.unshift({
      action: 'Assigned',
      date: effectiveAssignedDate,
      user: actorName || 'IT Admin',
      details: `Allocated to ${userName} (${empCode || 'N/A'}) - ${department || asset.department} on ${formattedDate}${peripheralSummary}${remarks ? ` (${remarks})` : ''}`,
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
    const { newUserName, newUserId, newEmpCode, newMailId, newDepartment, newLocation, transferDate, transferReason, remarks, actorName } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const targetUser = newUserName?.trim();
    if (!targetUser) {
      return res.status(400).json({ success: false, message: 'New custodian name is required' });
    }

    const effectiveTransferDate = transferDate ? new Date(transferDate) : (req.body.assignedDate ? new Date(req.body.assignedDate) : new Date());
    const formattedTransferDate = effectiveTransferDate.toLocaleDateString('en-GB');

    const prevOwner = `${asset.userName} (${asset.department} - ${asset.plant})`;
    const code = newEmpCode || newUserId || asset.empCode;
    const reason = transferReason || remarks || 'Departmental reorganization';

    asset.userName = targetUser;
    asset.empCode = code;
    if (newMailId) asset.mailId = newMailId;
    asset.department = newDepartment || asset.department;
    asset.plant = newLocation || asset.plant;
    asset.status = 'Assigned';
    asset.assignedDate = effectiveTransferDate;

    asset.history.unshift({
      action: 'Transferred',
      date: effectiveTransferDate,
      user: actorName || 'IT Admin',
      details: `Transferred on ${formattedTransferDate} from [${prevOwner}] to [${targetUser} - ${asset.department} - ${asset.plant}]. Reason: ${reason}`,
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
      details: `Transferred on ${formattedTransferDate}: ${prevOwner} -> ${targetUser} (${asset.department})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({ success: true, data: asset, message: 'Asset transferred successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Return asset from maintenance back to stock or custodian
// @route   POST /api/assets/:id/maintenance-return
export const returnFromMaintenance = async (req, res) => {
  try {
    const {
      returnDate,
      resolution,
      repairCost,
      workingCondition,
      serviceVendor,
      returnTo,
      notes,
      actorName,
    } = req.body;

    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const effectiveReturnDate = returnDate ? new Date(returnDate) : new Date();
    const formattedReturnDate = effectiveReturnDate.toLocaleDateString('en-GB');
    const cost = parseFloat(repairCost) || 0;
    const workDone = resolution || notes || 'Hardware servicing completed';
    const cond = workingCondition || 'Good';
    const vendor = serviceVendor || asset.serviceVendor || 'Authorized OEM Partner';

    // Calculate days in repair
    const durationDays = asset.maintenanceStartDate
      ? Math.max(0, Math.round((effectiveReturnDate - new Date(asset.maintenanceStartDate)) / (1000 * 60 * 60 * 24)))
      : 0;

    asset.maintenanceEndDate = effectiveReturnDate;
    asset.lastMaintenanceCost = cost;
    asset.lastMaintenanceResolution = workDone;
    asset.workingCondition = cond;

    if (returnTo === 'Custodian' && asset.userName && asset.userName !== 'Unassigned') {
      asset.status = 'Assigned';
    } else {
      asset.status = 'Available';
      asset.userName = 'Unassigned';
      asset.empCode = '';
      asset.mailId = '';
    }

    asset.history.unshift({
      action: 'Maintenance Completed',
      date: effectiveReturnDate,
      user: actorName || 'IT Admin',
      details: `Returned from maintenance on ${formattedReturnDate} (${durationDays} days in service). Work Done: ${workDone}. Cost: ₹${cost}. Condition: ${cond}. Vendor: ${vendor}`,
    });

    await asset.save();

    // Close open tickets in Maintenance model
    try {
      const { Maintenance, AuditLog } = await import('../models/Asset.js');
      await Maintenance.updateMany(
        {
          $or: [
            { assetId: asset._id, status: { $in: ['Open', 'In Progress'] } },
            { assetTag: asset.sr, status: { $in: ['Open', 'In Progress'] } },
            { assetTag: asset.assetNo, status: { $in: ['Open', 'In Progress'] } },
          ],
        },
        {
          $set: {
            status: 'Resolved',
            resolution: workDone,
            cost: cost,
            endDate: effectiveReturnDate,
          },
        }
      );

      await AuditLog.create({
        user: actorName || 'IT Admin',
        action: 'Maintenance Completed',
        assetTag: asset.sr || asset.assetNo,
        details: `Returned from repair on ${formattedReturnDate} (${durationDays}d). Cost: ₹${cost}`,
        ipAddress: req.ip || '127.0.0.1',
      });
    } catch {}

    res.status(200).json({
      success: true,
      data: asset,
      message: `Asset returned from maintenance successfully on ${formattedReturnDate}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Retire / Decommission an asset directly
// @route   POST /api/assets/:id/retire
export const retireAsset = async (req, res) => {
  try {
    const { retireDate, reason, workingCondition, actorName } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const effectiveDate = retireDate ? new Date(retireDate) : new Date();
    const formattedDate = effectiveDate.toLocaleDateString('en-GB');
    const retireReason = reason || 'Asset reached end of life / decommissioned';
    const cond = workingCondition || 'Fair';
    const prevCustodian = asset.userName || 'Unassigned';

    asset.status = 'Retired';
    asset.workingCondition = cond;
    asset.userName = 'Unassigned';
    asset.empCode = '';
    asset.mailId = '';
    asset.remarks = `Retired on ${formattedDate}: ${retireReason}`;

    asset.history.unshift({
      action: 'Retired',
      date: effectiveDate,
      user: actorName || 'IT Admin',
      details: `Decommissioned on ${formattedDate}. Previous Custodian: ${prevCustodian}. Reason: ${retireReason}. Condition: ${cond}`,
    });

    await asset.save();

    try {
      const { AuditLog } = await import('../models/Asset.js');
      await AuditLog.create({
        user: actorName || 'IT Admin',
        action: 'Asset Retired',
        assetTag: asset.sr || asset.assetNo,
        details: `Decommissioned ${asset.make} ${asset.model} on ${formattedDate}. Reason: ${retireReason}`,
        ipAddress: req.ip || '127.0.0.1',
      });
    } catch {}

    res.status(200).json({
      success: true,
      data: asset,
      message: `Asset "${asset.make} ${asset.model}" retired successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: Normalize keys in a row object
export const normalizeAssetRow = (row, index = 0) => {
  const getVal = (...keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
        return String(row[k]).trim();
      }
      // Also check case-insensitive / trimmed match
      const foundKey = Object.keys(row).find(
        (rk) => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
        return String(row[foundKey]).trim();
      }
    }
    return '';
  };

  const rawSn = getVal('S/N', 'sn', 's_n');
  const snNumber = rawSn ? parseInt(rawSn, 10) || null : (index + 1);
  const plant = getVal('Plant', 'plant', 'facility') || 'Vitromed';
  const assetNo = getVal('Assest No.', 'Asset No.', 'Assest No', 'assetNo', 'asset_no') || `AST-${String(snNumber || Date.now()).padStart(4, '0')}`;
  const userStatus = getVal('User Status', 'userStatus', 'user_status') || 'Active';
  const userName = getVal('User Name', 'userName', 'custodian', 'employee') || 'Unassigned';
  const empCode = getVal('Emp. Code', 'Emp Code', 'empCode', 'emp_code');
  const mailId = getVal("Mail Id's", 'Mail Ids', 'mailId', 'email', 'mail_id');
  const department = getVal('Department', 'department', 'dept') || 'IT';
  const officialNumber = getVal('Official Number', 'officialNumber', 'official_number', 'phone', 'mobile');
  const pcGroup = getVal('PC Group', 'pcGroup', 'pc_group', 'workgroup') || 'Workgroup';
  const hostName = getVal('Host-Name', 'Host Name', 'hostName', 'hostname');
  const ipAddress = getVal('IP Address', 'ipAddress', 'ip_address', 'ip');
  const escanPolicy = getVal('eScan Policy', 'escanPolicy', 'escan_policy', 'policy');
  const deviceType = getVal('System Type', 'deviceType', 'systemType', 'category') || 'Laptop';
  const make = getVal('System Brand', 'System Brand ', 'make', 'brand') || 'HP';
  const model = getVal('Model No.', 'Model No', 'model', 'modelNo') || 'Standard System';
  const sr = getVal('Serial Number', 'sr', 'serialNumber', 'serial_no') || `SR-VIT-${String(snNumber || Math.floor(Math.random()*100000)).padStart(5, '0')}`;
  const billCopyDate = getVal('Bill Copy & Date', 'billCopyDate', 'bill_copy_date', 'bill_no');
  const warrantyDetails = getVal('Warranty Details', 'warrantyDetails', 'warranty') || 'Standard';
  const osVersion = getVal('Windows', 'osVersion', 'os_version', 'windows') || 'Windows 10 Professional';
  const windowsType = getVal('Windows Type', 'windowsType', 'windows_type');
  const windowsKey = getVal('Windows License Keys', 'windowsKey', 'windowsLicenseKey', 'windows_key');
  const officeSoftware = getVal("Office Software's", "Office Software’s", 'Office Software', 'officeSoftware') || 'MS Office';
  const officeKey = getVal('Office License Keys', 'officeKey', 'officeLicenseKey', 'office_key');
  const mailSoftware = getVal('Mail Software', 'mailSoftware', 'mail_software');
  const sapId = getVal('SAP ID', 'sapId', 'sap_id');
  const loginUserName = getVal('User Name (Login)', 'Login User Name', 'loginUserName') || getVal('User Name_1', 'User Name 2') || '';
  const loginPassword = getVal('New ID/Login Password', 'Login Password', 'loginPassword', 'password');
  const antivirus = getVal('Antivirus', 'antivirus') || 'eScan';
  const otherSoftware = getVal('Other Software', 'otherSoftware', 'other_software');
  const processor = getVal("Processor Full Detail's", "Processor Full Details", 'processor', 'cpu') || 'Intel Core i5';
  const ramSize = getVal('RAM', 'ramSize', 'ram') || '8 GB';
  const storage = getVal('HDD', 'storage', 'hdd') || '512 GB SSD';
  const monitorDetails = getVal('LCD Screen', 'monitorDetails', 'lcdScreen', 'screen');
  const monitorSerialNo = getVal('LCD Sr. No', 'monitorSerialNo', 'lcdSerialNo');
  const dataBackup = getVal('Data Backup', 'dataBackup', 'data_backup');
  const accessories = getVal('Mobiles, Accessories & Other', 'accessories', 'peripherals');
  const remarks = getVal('Remark', 'remarks', 'remark', 'notes');

  const isAssigned = userName && userName.toLowerCase() !== 'unassigned' && userName.toLowerCase() !== 'n/a';
  const status = isAssigned ? 'Assigned' : 'Available';

  return {
    sn: snNumber,
    plant,
    assetNo,
    userStatus,
    userName,
    empCode,
    mailId,
    department,
    officialNumber,
    pcGroup,
    hostName,
    ipAddress,
    escanPolicy,
    deviceType,
    make,
    model,
    sr,
    billCopyDate,
    warrantyDetails,
    osVersion,
    windowsType,
    windowsKey,
    officeSoftware,
    officeKey,
    mailSoftware,
    sapId,
    loginUserName,
    loginPassword,
    antivirus,
    otherSoftware,
    processor,
    ramSize,
    storage,
    monitorDetails,
    monitorSerialNo,
    dataBackup,
    accessories,
    remarks,
    status,
    workingCondition: 'Good',
  };
};

// @desc    Bulk Import Asset Records (from 38-column Excel/CSV or JSON)
// @route   POST /api/assets/bulk-import
export const bulkImportAssets = async (req, res) => {
  try {
    const { items, overwrite = false, actorName = 'IT Admin' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No asset data provided for import.' });
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const normalized = normalizeAssetRow(items[i], i);

        // Find existing record by Hardware Serial Number (sr) or Asset Tag (assetNo)
        const filter = {
          $or: [
            { sr: normalized.sr },
            { assetNo: normalized.assetNo },
          ],
        };

        const existing = await Asset.findOne(filter);

        if (existing) {
          if (overwrite) {
            Object.assign(existing, normalized);
            existing.history.unshift({
              action: 'Bulk Updated',
              date: new Date(),
              user: actorName,
              details: `Updated via Master Excel/CSV Bulk Import (Row #${i + 1})`,
            });
            await existing.save();
            updatedCount++;
          } else {
            // Merge without overwriting existing critical fields if empty
            for (const key of Object.keys(normalized)) {
              if (normalized[key] && !existing[key]) {
                existing[key] = normalized[key];
              }
            }
            await existing.save();
            updatedCount++;
          }
        } else {
          // Create new record
          const newDoc = new Asset({
            ...normalized,
            history: [
              {
                action: 'Inwarded (Bulk Import)',
                date: new Date(),
                user: actorName,
                details: `Imported via Master Excel/CSV Roster (Row #${i + 1}, Tag: ${normalized.assetNo})`,
              },
            ],
          });
          await newDoc.save();
          insertedCount++;
        }
      } catch (rowErr) {
        errorCount++;
        errors.push(`Row ${i + 1}: ${rowErr.message}`);
      }
    }

    // Record Audit Log entry
    try {
      const { AuditLog } = await import('../models/Asset.js');
      await AuditLog.create({
        user: actorName,
        role: 'IT Admin',
        action: 'Master Bulk Import',
        assetTag: `Count: ${insertedCount + updatedCount}`,
        details: `Imported master roster: ${insertedCount} new created, ${updatedCount} updated, ${errorCount} errors.`,
        ipAddress: req.ip || '127.0.0.1',
      });
    } catch {}

    res.status(200).json({
      success: true,
      message: `Bulk import completed! Created: ${insertedCount}, Updated: ${updatedCount}, Errors: ${errorCount}`,
      summary: {
        total: items.length,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errorCount,
        errorDetails: errors.slice(0, 10),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export Assets into the Exact 38-Column CSV Format
// @route   GET /api/assets/export/csv
export const exportAssetsCSV = async (req, res) => {
  try {
    const assets = await Asset.find().sort({ sn: 1, createdAt: -1 });

    const headers = [
      'S/N',
      'Plant',
      'Assest No.',
      'User Status',
      'User Name',
      'Emp. Code',
      "Mail Id's",
      'Department',
      'Official Number',
      'PC Group',
      'Host-Name',
      'IP Address',
      'eScan Policy',
      'System Type',
      'System Brand',
      'Model No.',
      'Serial Number',
      'Bill Copy & Date',
      'Warranty Details',
      'Windows',
      'Windows Type',
      'Windows License Keys',
      "Office Software's",
      'Office License Keys',
      'Mail Software',
      'SAP ID',
      'User Name (Login)',
      'New ID/Login Password',
      'Antivirus',
      'Other Software',
      "Processor Full Detail's",
      'RAM',
      'HDD',
      'LCD Screen',
      'LCD Sr. No',
      'Data Backup',
      'Mobiles, Accessories & Other',
      'Remark',
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    const csvRows = [headers.join(',')];

    assets.forEach((a, idx) => {
      const row = [
        escapeCSV(a.sn || idx + 1),
        escapeCSV(a.plant || 'Vitromed'),
        escapeCSV(a.assetNo || ''),
        escapeCSV(a.userStatus || 'Active'),
        escapeCSV(a.userName || 'Unassigned'),
        escapeCSV(a.empCode || ''),
        escapeCSV(a.mailId || ''),
        escapeCSV(a.department || 'IT'),
        escapeCSV(a.officialNumber || ''),
        escapeCSV(a.pcGroup || 'Workgroup'),
        escapeCSV(a.hostName || ''),
        escapeCSV(a.ipAddress || ''),
        escapeCSV(a.escanPolicy || ''),
        escapeCSV(a.deviceType || 'Laptop'),
        escapeCSV(a.make || 'HP'),
        escapeCSV(a.model || ''),
        escapeCSV(a.sr || ''),
        escapeCSV(a.billCopyDate || a.billNo || 'N/A'),
        escapeCSV(a.warrantyDetails || ''),
        escapeCSV(a.osVersion || ''),
        escapeCSV(a.windowsType || ''),
        escapeCSV(a.windowsKey || ''),
        escapeCSV(a.officeSoftware || ''),
        escapeCSV(a.officeKey || ''),
        escapeCSV(a.mailSoftware || ''),
        escapeCSV(a.sapId || ''),
        escapeCSV(a.loginUserName || ''),
        escapeCSV(a.loginPassword || ''),
        escapeCSV(a.antivirus || 'eScan'),
        escapeCSV(a.otherSoftware || ''),
        escapeCSV(a.processor || ''),
        escapeCSV(a.ramSize || ''),
        escapeCSV(a.storage || ''),
        escapeCSV(a.monitorDetails || ''),
        escapeCSV(a.monitorSerialNo || ''),
        escapeCSV(a.dataBackup || ''),
        escapeCSV(a.accessories || ''),
        escapeCSV(a.remarks || ''),
      ];
      csvRows.push(row.join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Company_Asset_Master_38_Cols.csv"');
    res.status(200).send(csvRows.join('\r\n'));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seed the Exact Master Sample Row from the 9-Page PDF
// @route   POST /api/assets/seed/sample-row
export const seedSampleMasterRow = async (req, res) => {
  try {
    const sampleRecord = {
      sn: 109,
      plant: 'Vitromed',
      assetNo: '21',
      userStatus: 'Active',
      userName: 'CCTV / Mahendra Yadav / Rajnath Singh',
      empCode: 'OS1130',
      mailId: 'cctvit@vitromed.co.in',
      department: 'IT',
      officialNumber: '8000929236',
      pcGroup: 'Workgroup',
      hostName: 'CCTV',
      ipAddress: '192.168.8.123',
      escanPolicy: 'Profile',
      deviceType: 'Laptop',
      make: 'HP',
      model: 'HP Laptop 15-bs1xx',
      sr: 'CND744D8ZH',
      billCopyDate: 'N/A',
      warrantyDetails: '13-12-2017 to 10-02-2019',
      osVersion: 'Windows 10 Professional 64-bit',
      windowsType: 'OPEN OS',
      windowsKey: '9QN27-QC4RM-YQ3TD-MV6RH-KHJXM',
      officeSoftware: 'MS Office 2013 Std',
      officeKey: 'XWNTF-9DHKH-B48X3-PJ4C2-27GYG',
      mailSoftware: 'Online WPA',
      sapId: 'N/A',
      loginUserName: 'Vitromed',
      loginPassword: 'Vitromed / CCTV@121',
      antivirus: 'eScan',
      otherSoftware: 'N/A',
      processor: '8th Gen Intel(R) Core(TM) i5-8250 CPU @ 1.60GHz 1.80 GHz',
      ramSize: '8 GB',
      storage: '120 GB M.2 SSD + 1 TB HDD',
      monitorDetails: '22 inch',
      monitorSerialNo: '',
      dataBackup: 'Daily Backup',
      accessories: 'UPS, Wireless K/B & Mouse,',
      remarks: '',
      status: 'Assigned',
      workingCondition: 'Good',
      history: [
        {
          action: 'Master Sample Seeded',
          date: new Date(),
          user: 'System Admin',
          details: 'Populated from exact 9-page company master roster PDF',
        },
      ],
    };

    const saved = await Asset.findOneAndUpdate(
      { sr: sampleRecord.sr },
      { $set: sampleRecord },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Exact sample record (S/N 109 - CCTV / HP Laptop 15-bs1xx) successfully seeded!',
      data: saved,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


