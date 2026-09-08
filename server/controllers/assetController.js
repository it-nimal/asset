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

    const asset = await Asset.create(req.body);
    res.status(201).json({
      success: true,
      data: asset,
      message: 'Asset recorded in MongoDB Atlas successfully',
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

    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.status(200).json({
      success: true,
      data: asset,
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
export const assignAsset = async (req, res) => {
  try {
    const { userName, empCode, mailId, department, plant, floorCabin, expectedReturnDate, remarks, actorName } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    asset.status = 'Assigned';
    asset.userName = userName;
    asset.empCode = empCode;
    asset.mailId = mailId;
    asset.department = department || asset.department;
    asset.plant = plant || asset.plant;
    asset.floorCabin = floorCabin || asset.floorCabin;
    asset.assignedDate = new Date();
    if (expectedReturnDate) asset.expectedReturnDate = new Date(expectedReturnDate);
    if (remarks) asset.remarks = remarks;

    asset.history.unshift({
      action: 'Assigned',
      date: new Date(),
      user: actorName || 'IT Admin',
      details: `Allocated to ${userName} (${empCode || 'N/A'}) - ${department}`,
    });

    await asset.save();

    const { AuditLog } = await import('../models/Asset.js');
    await AuditLog.create({
      user: actorName || 'IT Admin',
      action: 'Asset Assigned',
      assetTag: asset.sr || asset.assetNo,
      details: `Assigned to ${userName} (${department})`,
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
    const { returnCondition, damageDetails, notes, actorName } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const prevUser = asset.userName;
    asset.status = 'Available';
    asset.userName = 'Unassigned';
    asset.workingCondition = returnCondition || asset.workingCondition || 'Good';
    asset.assignedDate = null;
    asset.expectedReturnDate = null;
    if (notes) asset.remarks = notes;

    asset.history.unshift({
      action: 'Returned',
      date: new Date(),
      user: actorName || 'IT Admin',
      details: `Returned from ${prevUser}. Condition: ${returnCondition || 'Good'}. ${damageDetails ? 'Damage note: ' + damageDetails : ''}`,
    });

    await asset.save();

    const { AuditLog } = await import('../models/Asset.js');
    await AuditLog.create({
      user: actorName || 'IT Admin',
      action: 'Asset Returned',
      assetTag: asset.sr || asset.assetNo,
      details: `Returned by ${prevUser} -> Stock (${returnCondition || 'Good'})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({ success: true, data: asset, message: 'Asset returned to stock' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Transfer asset between employees, departments, or locations
// @route   POST /api/assets/:id/transfer
export const transferAsset = async (req, res) => {
  try {
    const { newUserName, newEmpCode, newMailId, newDepartment, newLocation, transferReason, actorName } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const prevOwner = `${asset.userName} (${asset.department} - ${asset.plant})`;
    asset.userName = newUserName || asset.userName;
    asset.empCode = newEmpCode || asset.empCode;
    asset.mailId = newMailId || asset.mailId;
    asset.department = newDepartment || asset.department;
    asset.plant = newLocation || asset.plant;
    asset.status = 'Assigned';

    asset.history.unshift({
      action: 'Transferred',
      date: new Date(),
      user: actorName || 'IT Admin',
      details: `Transferred from [${prevOwner}] to [${newUserName} - ${newDepartment} - ${newLocation}]. Reason: ${transferReason || 'Departmental reorganization'}`,
    });

    await asset.save();

    const { AuditLog } = await import('../models/Asset.js');
    await AuditLog.create({
      user: actorName || 'IT Admin',
      action: 'Asset Transferred',
      assetTag: asset.sr || asset.assetNo,
      details: `Transferred: ${prevOwner} -> ${newUserName} (${newDepartment})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({ success: true, data: asset, message: 'Asset transferred successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

