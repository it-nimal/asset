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
// ASSETINVENTORYCONTROLLER
// ==========================================

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

    const { search, status, plant, category, deviceType, department, vendor } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { assetNo: { $regex: search, $options: 'i' } },
        { sr: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { empCode: { $regex: search, $options: 'i' } },
        { mailId: { $regex: search, $options: 'i' } },
        { hostName: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { plant: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (plant && plant !== 'All') {
      query.plant = plant;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (deviceType && deviceType !== 'All') {
      query.deviceType = deviceType;
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (vendor && vendor !== 'All') {
      query.vendorName = vendor;
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const isPaginated = !isNaN(page) && !isNaN(limit) && page > 0 && limit > 0;

    const total = await Asset.countDocuments(query);
    let assetQuery = Asset.find(query).sort({ sn: 1, createdAt: -1 });

    if (isPaginated) {
      assetQuery = assetQuery.skip((page - 1) * limit).limit(limit);
    }

    const assets = await assetQuery;

    res.status(200).json({
      success: true,
      count: assets.length,
      data: assets,
      pagination: isPaginated
        ? {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
          }
        : {
            total,
            page: 1,
            limit: total,
            totalPages: 1,
            hasMore: false,
          },
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
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new asset
// @route   POST /api/assets
export const createAsset = async (req, res) => {
  try {
    const assetData = { ...req.body };
    if (!assetData.sn) {
      const highest = await Asset.findOne().sort({ sn: -1 });
      assetData.sn = (highest?.sn || 0) + 1;
    }

    if (!assetData.history || assetData.history.length === 0) {
      assetData.history = [
        {
          action: 'Created',
          date: new Date(),
          user: req.body.actorName || 'System Admin',
          details: `Initial asset inward created in ${assetData.plant || 'Vitromed'}`,
        },
      ];
    }

    const asset = await Asset.create(assetData);

    try {
      await AuditLog.create({
        user: req.body.actorName || 'IT Admin',
        role: 'IT Admin',
        action: 'Asset Created',
        assetTag: asset.assetNo || asset.sr,
        details: `Created ${asset.make} ${asset.model} (S/N: ${asset.sr})`,
        ipAddress: req.ip || '127.0.0.1',
      });
    } catch {}

    res.status(201).json({ success: true, data: asset, message: 'Asset created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
export const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const updated = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updated, message: 'Asset updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.status(200).json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign asset to user/custodian
// @route   POST /api/assets/:id/assign
export const assignAsset = async (req, res) => {
  try {
    const { userName, empCode, mailId, department, plant, assignedDate, expectedReturnDate, remarks, actorName } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    asset.status = 'Assigned';
    asset.userName = userName || asset.userName;
    asset.empCode = empCode || asset.empCode;
    asset.mailId = mailId || asset.mailId;
    asset.department = department || asset.department;
    asset.plant = plant || asset.plant;
    asset.assignedDate = assignedDate ? new Date(assignedDate) : new Date();
    asset.expectedReturnDate = expectedReturnDate ? new Date(expectedReturnDate) : null;
    if (remarks) asset.remarks = remarks;

    asset.history.unshift({
      action: 'Assigned',
      date: new Date(),
      user: actorName || 'IT Admin',
      details: `Assigned to ${asset.userName} (${asset.empCode || 'N/A'}) in ${asset.department}`,
    });

    await asset.save();

    await AuditLog.create({
      user: actorName || 'IT Admin',
      role: 'IT Admin',
      action: 'Asset Assigned',
      assetTag: asset.assetNo || asset.sr,
      details: `Issued to ${asset.userName} (${asset.department})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({ success: true, data: asset, message: `Asset assigned to ${asset.userName}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Return asset to available stock
// @route   POST /api/assets/:id/return
export const returnAsset = async (req, res) => {
  try {
    const { returnDate, returnCondition, remarks, actorName } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const prevUser = asset.userName;
    asset.status = 'Available';
    asset.userName = 'Unassigned';
    asset.empCode = '';
    asset.mailId = '';
    asset.workingCondition = returnCondition || asset.workingCondition || 'Good';
    asset.assignedDate = null;
    asset.expectedReturnDate = null;
    if (remarks) asset.remarks = remarks;

    asset.history.unshift({
      action: 'Returned',
      date: returnDate ? new Date(returnDate) : new Date(),
      user: actorName || 'IT Admin',
      details: `Returned from ${prevUser} to Available inventory stock. Condition: ${asset.workingCondition}`,
    });

    await asset.save();

    await AuditLog.create({
      user: actorName || 'IT Admin',
      role: 'IT Admin',
      action: 'Asset Returned',
      assetTag: asset.assetNo || asset.sr,
      details: `Returned by ${prevUser} to central stock`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({ success: true, data: asset, message: 'Asset returned to available inventory' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Transfer asset to new custodian / department
// @route   POST /api/assets/:id/transfer
export const transferAsset = async (req, res) => {
  try {
    const { newUserName, newEmpCode, newMailId, newDepartment, newPlant, remarks, actorName } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const oldUser = asset.userName;
    const oldDept = asset.department;

    asset.userName = newUserName;
    asset.empCode = newEmpCode || '';
    asset.mailId = newMailId || '';
    asset.department = newDepartment || asset.department;
    asset.plant = newPlant || asset.plant;
    asset.status = 'Assigned';
    asset.assignedDate = new Date();
    if (remarks) asset.remarks = remarks;

    asset.history.unshift({
      action: 'Transferred',
      date: new Date(),
      user: actorName || 'IT Admin',
      details: `Transferred from ${oldUser} (${oldDept}) to ${newUserName} (${asset.department})`,
    });

    await asset.save();

    await AuditLog.create({
      user: actorName || 'IT Admin',
      role: 'IT Admin',
      action: 'Asset Transferred',
      assetTag: asset.assetNo || asset.sr,
      details: `Transferred from ${oldUser} to ${newUserName}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({ success: true, data: asset, message: `Asset transferred to ${newUserName}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Return asset from maintenance (legacy route)
// @route   POST /api/assets/:id/maintenance-return
export const returnFromMaintenance = async (req, res) => {
  try {
    const { maintenanceEndDate, lastMaintenanceCost, lastMaintenanceResolution, serviceVendor, actorName } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    asset.status = asset.userName && asset.userName !== 'Unassigned' ? 'Assigned' : 'Available';
    asset.maintenanceEndDate = maintenanceEndDate ? new Date(maintenanceEndDate) : new Date();
    if (lastMaintenanceCost !== undefined) asset.lastMaintenanceCost = Number(lastMaintenanceCost) || 0;
    if (lastMaintenanceResolution) asset.lastMaintenanceResolution = lastMaintenanceResolution;
    if (serviceVendor) asset.serviceVendor = serviceVendor;

    asset.history.unshift({
      action: 'Maintenance Returned',
      date: new Date(),
      user: actorName || 'IT Admin',
      details: `Returned from service partner ${serviceVendor || 'OEM'}. Resolution: ${lastMaintenanceResolution || 'Repairs completed'}`,
    });

    await asset.save();

    res.status(200).json({ success: true, data: asset, message: 'Asset returned from maintenance successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Retire / Decommission asset
// @route   POST /api/assets/:id/retire
export const retireAsset = async (req, res) => {
  try {
    const { retireReason, actorName } = req.body;
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    asset.status = 'Retired';
    asset.userName = 'Unassigned';
    asset.empCode = '';
    asset.mailId = '';
    asset.remarks = `Retired on ${new Date().toLocaleDateString('en-GB')}: ${retireReason || 'End of Lifecycle'}`;

    asset.history.unshift({
      action: 'Retired',
      date: new Date(),
      user: actorName || 'IT Admin',
      details: `Asset decommissioned/retired: ${retireReason || 'End of useful life'}`,
    });

    await asset.save();

    res.status(200).json({ success: true, data: asset, message: 'Asset retired successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get asset stats summary
// @route   GET /api/assets/stats/summary
export const getAssetStats = async (req, res) => {
  try {
    const totalAssets = await Asset.countDocuments();
    const assignedAssets = await Asset.countDocuments({ status: 'Assigned' });
    const availableAssets = await Asset.countDocuments({ status: 'Available' });
    const maintenanceAssets = await Asset.countDocuments({ status: 'Under Maintenance' });
    const retiredAssets = await Asset.countDocuments({ status: 'Retired' });
    const totalEmployees = await Employee.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        assignedAssets,
        availableAssets,
        maintenanceAssets,
        retiredAssets,
        totalEmployees,
        dbConnected: isDBConnected(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk Import Assets
// @route   POST /api/assets/bulk-import
export const bulkImportAssets = async (req, res) => {
  try {
    const { items = [], overwrite = false, actorName = 'IT Admin' } = req.body;
    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const serial = (item.sr || item.serialNumber || `SR-IMP-${Math.floor(100000 + Math.random() * 900000)}`).trim();
        const existing = await Asset.findOne({ sr: serial });

        if (existing) {
          if (overwrite) {
            await Asset.findByIdAndUpdate(existing._id, item, { new: true });
            updatedCount++;
          }
        } else {
          await Asset.create({ ...item, sr: serial });
          insertedCount++;
        }
      } catch (rowErr) {
        errorCount++;
        errors.push(`Row ${i + 1}: ${rowErr.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk import completed! Created: ${insertedCount}, Updated: ${updatedCount}, Errors: ${errorCount}`,
      summary: { total: items.length, inserted: insertedCount, updated: updatedCount, errors: errorCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export Assets into CSV
// @route   GET /api/assets/export-master-csv
export const exportAssetsCSV = async (req, res) => {
  try {
    const assets = await Asset.find().sort({ sn: 1, createdAt: -1 });
    const headers = ['S/N', 'Plant', 'Asset No', 'User Name', 'Emp Code', 'Dept', 'Make', 'Model', 'Serial No', 'Status'];
    const escapeCSV = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
    const rows = [headers.join(',')];

    assets.forEach((a, idx) => {
      rows.push([
        escapeCSV(a.sn || idx + 1),
        escapeCSV(a.plant),
        escapeCSV(a.assetNo),
        escapeCSV(a.userName),
        escapeCSV(a.empCode),
        escapeCSV(a.department),
        escapeCSV(a.make),
        escapeCSV(a.model),
        escapeCSV(a.sr),
        escapeCSV(a.status),
      ].join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Company_Asset_Master.csv"');
    res.status(200).send(rows.join('\r\n'));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seed the Exact Master Sample Row
// @route   POST /api/assets/seed/sample-master-row
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
      deviceType: 'Laptop',
      make: 'HP',
      model: 'HP Laptop 15-bs1xx',
      sr: 'CND744D8ZH',
      status: 'Assigned',
      workingCondition: 'Good',
    };

    const saved = await Asset.findOneAndUpdate(
      { sr: sampleRecord.sr },
      { $set: sampleRecord },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: saved, message: 'Sample master row seeded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get warranty analytics summary
// @route   GET /api/assets/warranty/summary
export const getWarrantySummary = async (req, res) => {
  try {
    const assets = await Asset.find();
    const now = new Date();
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    let active = 0;
    let expiringSoon = 0;
    let expired = 0;
    let unknown = 0;

    assets.forEach((a) => {
      if (!a.warrantyEndDate) {
        unknown++;
      } else {
        const end = new Date(a.warrantyEndDate);
        if (end < now) {
          expired++;
        } else if (end <= in90Days) {
          expiringSoon++;
          active++;
        } else {
          active++;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: { total: assets.length, active, expiringSoon, expired, unknown },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. EMPLOYEE & USER DIRECTORY CONTROLLERS
// ==========================================

export const getAvailableAssets = async (req, res) => {
  try {
    const { search, category, deviceType, location } = req.query;
    const filter = { status: 'Available' };

    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }
    if (deviceType && deviceType !== 'All') {
      filter.deviceType = new RegExp(`^${deviceType}$`, 'i');
    }
    if (location && location !== 'All') {
      filter.plant = new RegExp(`^${location}$`, 'i');
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { assetNo: { $regex: q, $options: 'i' } },
        { sr: { $regex: q, $options: 'i' } },
        { make: { $regex: q, $options: 'i' } },
        { model: { $regex: q, $options: 'i' } },
        { deviceType: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    const availableAssets = await Asset.find(filter).sort({ assetNo: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: availableAssets.length,
      data: availableAssets,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const allocateAssets = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      employeeCode,
      email,
      department,
      location,
      plant,
      assetIds = [],
      assetId,
      allocationDate,
      assignedDate,
      purpose,
      expectedReturnDate,
      remarks,
      actorName,
    } = req.body;

    const targetAssetIds = Array.isArray(assetIds) && assetIds.length > 0 
      ? assetIds 
      : (assetId ? [assetId] : []);

    if (targetAssetIds.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one asset must be selected for allocation' });
    }

    let targetEmployee = null;
    if (employeeId) {
      targetEmployee = await Employee.findOne({
        $or: [
          { _id: employeeId.toString().match(/^[0-9a-fA-F]{24}$/) ? employeeId : null },
          { employeeId: employeeId },
          { email: employeeId }
        ].filter(Boolean)
      });
    }

    if (!targetEmployee && employeeCode) {
      targetEmployee = await Employee.findOne({ employeeId: employeeCode });
    }

    if (!targetEmployee && employeeName) {
      targetEmployee = await Employee.findOne({ name: employeeName });
    }

    const finalName = targetEmployee?.name || employeeName?.trim();
    const finalCode = targetEmployee?.employeeId || employeeCode?.trim() || '';
    const finalEmail = targetEmployee?.email || email?.trim() || '';
    const finalDept = targetEmployee?.department || department?.trim() || 'General';
    const finalLocation = targetEmployee?.location || location?.trim() || plant?.trim() || 'Vitromed';

    if (!finalName) {
      return res.status(400).json({ success: false, message: 'Valid employee name or ID is required' });
    }

    if (targetEmployee && ['Resigned', 'Inactive', 'Terminated'].includes(targetEmployee.status)) {
      return res.status(400).json({
        success: false,
        message: `Employee "${finalName}" is marked as ${targetEmployee.status} and cannot receive new equipment allocations.`,
      });
    }

    const requestedAssets = await Asset.find({ _id: { $in: targetAssetIds } });
    if (requestedAssets.length !== targetAssetIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more selected asset records could not be found in inventory.',
      });
    }

    const unavailableAssets = requestedAssets.filter((a) => a.status !== 'Available');
    if (unavailableAssets.length > 0) {
      const busyList = unavailableAssets.map((a) => `${a.assetNo || a.sr} (${a.status})`).join(', ');
      return res.status(400).json({
        success: false,
        message: `The following asset(s) are no longer available for allocation: ${busyList}. Please refresh inventory.`,
      });
    }

    const effectiveDate = allocationDate ? new Date(allocationDate) : (assignedDate ? new Date(assignedDate) : new Date());
    const formattedDate = effectiveDate.toLocaleDateString('en-GB');
    const allocationPurpose = purpose || 'Regular Work';

    const allocationRef = `ALC-VIT-${Math.floor(100000 + Math.random() * 900000)}`;

    const updatedAssets = [];

    for (const asset of requestedAssets) {
      asset.status = 'Assigned';
      asset.userName = finalName;
      asset.empCode = finalCode;
      asset.mailId = finalEmail;
      asset.department = finalDept;
      asset.plant = finalLocation;
      asset.assignedDate = effectiveDate;
      asset.expectedReturnDate = expectedReturnDate ? new Date(expectedReturnDate) : null;
      asset.purpose = allocationPurpose;
      asset.receiptAcknowledged = false;
      asset.receiptAcknowledgedAt = null;
      if (remarks) asset.remarks = remarks;

      const historyEntry = {
        action: 'Assigned',
        date: effectiveDate,
        user: actorName || 'IT Admin',
        details: `Allocated to ${finalName} (${finalCode || 'N/A'}) [${finalDept} - ${finalLocation}] on ${formattedDate}. Purpose: ${allocationPurpose}${remarks ? ` (${remarks})` : ''} [Ref: ${allocationRef}]`,
      };

      asset.history.unshift(historyEntry);
      await asset.save();
      updatedAssets.push(asset);

      await AuditLog.create({
        user: actorName || 'IT Admin',
        role: 'IT Admin',
        action: 'Asset Allocated',
        assetTag: asset.sr || asset.assetNo,
        details: `Allocated to ${finalName} (${finalDept}) - Purpose: ${allocationPurpose} [Ref: ${allocationRef}]`,
        ipAddress: req.ip || '127.0.0.1',
      });
    }

    if (!targetEmployee) {
      try {
        targetEmployee = await Employee.create({
          employeeId: finalCode || `VIT-${Math.floor(1000 + Math.random() * 9000)}`,
          name: finalName,
          email: finalEmail || `${finalName.toLowerCase().replace(/[^a-z0-9]/g, '')}@vitromed.com`,
          department: finalDept,
          location: finalLocation,
          status: 'Active',
        });
      } catch {}
    }

    res.status(200).json({
      success: true,
      message: `Successfully allocated ${updatedAssets.length} asset(s) to ${finalName}`,
      allocationId: allocationRef,
      employee: {
        id: targetEmployee?._id,
        name: finalName,
        employeeCode: finalCode,
        department: finalDept,
        location: finalLocation,
      },
      assets: updatedAssets,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const acknowledgeAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { acknowledgementNotes, notes, actorName } = req.body;

    const asset = await Asset.findById(id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    asset.receiptAcknowledged = true;
    asset.receiptAcknowledgedAt = new Date();
    asset.acknowledgementNotes = acknowledgementNotes || notes || 'Asset received in good working condition';

    asset.history.unshift({
      action: 'Receipt Acknowledged',
      date: new Date(),
      user: actorName || asset.userName || 'Employee',
      details: `Receipt acknowledged by ${asset.userName} (${asset.empCode || 'Staff'}): "${asset.acknowledgementNotes}"`,
    });

    await asset.save();

    await AuditLog.create({
      user: actorName || asset.userName || 'Employee',
      action: 'Receipt Acknowledged',
      assetTag: asset.sr || asset.assetNo,
      details: `Custodian ${asset.userName} acknowledged receipt for ${asset.assetNo || asset.sr}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: `Receipt acknowledged for asset ${asset.assetNo || asset.sr}`,
      data: asset,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 17. ASSET TRANSFER & HANDOVER CONTROLLERS
// ==========================================

