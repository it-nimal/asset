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
// TRANSFERCONTROLLER
// ==========================================

// @desc    Get all transfers with filters and search
// @route   GET /api/transfers or /api/assets/transfers
export const getTransfers = async (req, res) => {
  try {
    const { status, search, assetId, fromEmployeeId, toEmployeeId, fromEmpCode, toEmpCode, employeeId } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (assetId) {
      query.assetId = assetId;
    }

    if (fromEmployeeId) {
      query.fromEmployeeId = fromEmployeeId;
    }

    if (toEmployeeId) {
      query.toEmployeeId = toEmployeeId;
    }

    if (employeeId) {
      query.$or = [
        { fromEmployeeId: employeeId },
        { toEmployeeId: employeeId },
        { fromEmpCode: employeeId },
        { toEmpCode: employeeId },
        { fromEmail: employeeId },
        { toEmail: employeeId },
      ];
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchCondition = [
        { transferId: searchRegex },
        { assetTag: searchRegex },
        { assetMake: searchRegex },
        { assetModel: searchRegex },
        { assetSerial: searchRegex },
        { fromEmployeeName: searchRegex },
        { toEmployeeName: searchRegex },
        { fromEmpCode: searchRegex },
        { toEmpCode: searchRegex },
        { reason: searchRegex },
      ];

      if (query.$or) {
        query = { $and: [query, { $or: searchCondition }] };
      } else {
        query.$or = searchCondition;
      }
    }

    const transfers = await Transfer.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: transfers.length,
      data: transfers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single transfer by ID or transferId
// @route   GET /api/transfers/:id
export const getTransferById = async (req, res) => {
  try {
    const { id } = req.params;
    let transfer = null;

    if (id.startsWith('TRF-')) {
      transfer = await Transfer.findOne({ transferId: id });
    } else if (id.match(/^[0-9a-fA-F]{24}$/)) {
      transfer = await Transfer.findById(id);
    } else {
      transfer = await Transfer.findOne({ transferId: id });
    }

    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer record not found' });
    }

    res.status(200).json({ success: true, data: transfer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create a new asset transfer request
// @route   POST /api/transfers
export const createTransfer = async (req, res) => {
  try {
    const {
      assetId,
      toEmployeeId,
      toEmployeeName,
      toEmpCode,
      toDepartment,
      toLocation,
      toDesignation,
      toEmail,
      transferDate,
      reason,
      destinationLocation,
      remarks,
      assetCondition,
      accessoriesTransferred,
      accessoryNotes,
      actorName,
    } = req.body;

    if (!assetId) {
      return res.status(400).json({ success: false, message: 'Asset ID is required for transfer' });
    }
    if (!toEmployeeId && !toEmployeeName) {
      return res.status(400).json({ success: false, message: 'Destination employee is required' });
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Rule 1: Only Assigned assets can be transferred
    if (asset.status !== 'Assigned') {
      if (asset.status === 'Under Maintenance' || asset.status === 'Under QC') {
        return res.status(400).json({
          success: false,
          message: 'This asset is currently under maintenance. Complete maintenance before transferring the asset.',
        });
      }
      if (asset.status === 'Retired' || asset.status === 'Disposed') {
        return res.status(400).json({
          success: false,
          message: 'Retired or disposed assets cannot be transferred.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Only assigned assets can be transferred. Current asset status is "${asset.status}".`,
      });
    }

    // Destination employee lookup (if ID or code provided, verify active)
    let destEmp = null;
    if (toEmployeeId) {
      destEmp = await Employee.findOne({
        $or: [
          { _id: toEmployeeId.match(/^[0-9a-fA-F]{24}$/) ? toEmployeeId : null },
          { employeeId: toEmployeeId },
          { name: toEmployeeId },
        ],
      });
    } else if (toEmpCode) {
      destEmp = await Employee.findOne({ employeeId: toEmpCode });
    } else if (toEmployeeName) {
      destEmp = await Employee.findOne({ name: toEmployeeName });
    }

    if (destEmp && (destEmp.status === 'Resigned' || destEmp.status === 'Inactive')) {
      return res.status(400).json({
        success: false,
        message: `Destination employee "${destEmp.name}" is marked as ${destEmp.status} and cannot receive assets.`,
      });
    }

    const targetEmpName = destEmp ? destEmp.name : (toEmployeeName || '').trim();
    const targetEmpCode = destEmp ? destEmp.employeeId : (toEmpCode || '').trim();
    const targetDept = destEmp ? destEmp.department : (toDepartment || asset.department || 'IT');
    const targetLoc = destEmp ? destEmp.location : (toLocation || destinationLocation || asset.plant || 'Vitromed');
    const targetDesig = destEmp ? destEmp.designation : (toDesignation || 'Associate');
    const targetEmail = destEmp ? destEmp.email : (toEmail || '');

    // Rule 2: Asset cannot be transferred to the same employee
    const currentEmpCode = (asset.empCode || '').trim().toLowerCase();
    const currentEmpName = (asset.userName || '').trim().toLowerCase();
    const destCodeCheck = targetEmpCode.toLowerCase();
    const destNameCheck = targetEmpName.toLowerCase();

    if (
      (currentEmpCode && destCodeCheck && currentEmpCode === destCodeCheck) ||
      (currentEmpName && destNameCheck && currentEmpName === destNameCheck)
    ) {
      return res.status(400).json({
        success: false,
        message: 'The destination employee is already the current custodian.',
      });
    }

    // Concurrency Protection: Check for duplicate active transfers on this asset
    const activeTransfer = await Transfer.findOne({
      assetId: asset._id,
      status: { $in: ['Pending', 'Approved', 'Handover Pending', 'Acknowledgement Pending'] },
    });
    if (activeTransfer) {
      return res.status(400).json({
        success: false,
        message: `An active transfer ticket (${activeTransfer.transferId}) is already in progress for this asset.`,
      });
    }

    // Generate unique TRF-VIT-XXXXXX
    const count = await Transfer.countDocuments();
    const transferId = `TRF-VIT-${String(count + 101).padStart(6, '0')}`;

    const newTransfer = await Transfer.create({
      transferId,
      assetId: asset._id,
      assetTag: asset.assetNo || asset.sr,
      assetCategory: asset.category || asset.deviceType || 'Computing',
      assetMake: asset.make,
      assetModel: asset.model,
      assetSerial: asset.sr,

      fromEmployeeId: asset.empCode || asset.userName || '',
      fromEmployeeName: asset.userName || 'Current Custodian',
      fromEmpCode: asset.empCode || '',
      fromDepartment: asset.department || '',
      fromLocation: asset.plant || 'Vitromed',
      fromDesignation: '',
      fromEmail: asset.mailId || '',

      toEmployeeId: targetEmpCode || targetEmpName,
      toEmployeeName: targetEmpName,
      toEmpCode: targetEmpCode,
      toDepartment: targetDept,
      toLocation: targetLoc,
      toDesignation: targetDesig,
      toEmail: targetEmail,

      transferDate: transferDate ? new Date(transferDate) : new Date(),
      reason: reason || 'Employee Transfer',
      destinationLocation: destinationLocation || targetLoc,
      remarks: remarks || '',
      assetCondition: assetCondition || asset.workingCondition || 'Good',
      accessoriesTransferred: accessoriesTransferred !== false,
      accessoryNotes: accessoryNotes || asset.accessories || '',
      status: 'Pending',

      history: [
        {
          date: new Date(),
          action: 'Transfer Created',
          performedBy: actorName || 'IT Admin',
          details: `Initiated custody transfer from ${asset.userName} (${asset.empCode || 'N/A'}) to ${targetEmpName} (${targetEmpCode || 'N/A'}). Reason: ${reason || 'Employee Transfer'}`,
        },
      ],
      createdBy: actorName || 'IT Admin',
      updatedBy: actorName || 'IT Admin',
    });

    await AuditLog.create({
      user: actorName || 'IT Admin',
      action: 'Transfer Created',
      assetTag: asset.assetNo || asset.sr,
      details: `Created transfer ${transferId} for ${asset.make} ${asset.model} from ${asset.userName} to ${targetEmpName}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    await Notification.create({
      title: 'Asset Transfer Requested',
      message: `Transfer ${transferId} initiated for ${asset.make} ${asset.model} to ${targetEmpName}.`,
      type: 'assignment',
    });

    res.status(201).json({
      success: true,
      message: 'Asset transfer request created successfully',
      data: newTransfer,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Approve transfer request
// @route   POST /api/transfers/:id/approve
export const approveTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName, notes } = req.body;

    const transfer = await Transfer.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { transferId: id }],
    });
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer record not found' });

    if (transfer.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve transfer in "${transfer.status}" status. Must be in "Pending" status.`,
      });
    }

    const asset = await Asset.findById(transfer.assetId);
    if (!asset) return res.status(404).json({ success: false, message: 'Underlying asset not found' });
    if (asset.status !== 'Assigned') {
      return res.status(400).json({
        success: false,
        message: `Asset is currently "${asset.status}" and cannot be transferred.`,
      });
    }

    transfer.status = 'Approved';
    transfer.approvedBy = actorName || 'IT Admin';
    transfer.approvedDate = new Date();
    transfer.history.push({
      date: new Date(),
      action: 'Transfer Approved',
      performedBy: actorName || 'IT Admin',
      details: notes ? `Approved by ${actorName || 'IT Admin'}: ${notes}` : `Transfer approved by ${actorName || 'IT Admin'}`,
    });

    await transfer.save();

    await AuditLog.create({
      user: actorName || 'IT Admin',
      action: 'Transfer Approved',
      assetTag: transfer.assetTag || transfer.assetSerial,
      details: `Approved transfer ${transfer.transferId} to ${transfer.toEmployeeName}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: `Transfer ${transfer.transferId} approved successfully`,
      data: transfer,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Confirm physical equipment handover
// @route   POST /api/transfers/:id/handover
export const handoverTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName, assetCondition, accessoriesTransferred, accessoryNotes, notes } = req.body;

    const transfer = await Transfer.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { transferId: id }],
    });
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer record not found' });

    if (transfer.status !== 'Approved' && transfer.status !== 'Handover Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot process handover for transfer in "${transfer.status}" status. Must be "Approved".`,
      });
    }

    const asset = await Asset.findById(transfer.assetId);
    if (!asset) return res.status(404).json({ success: false, message: 'Underlying asset not found' });

    if (assetCondition) transfer.assetCondition = assetCondition;
    if (accessoriesTransferred !== undefined) transfer.accessoriesTransferred = accessoriesTransferred;
    if (accessoryNotes) transfer.accessoryNotes = accessoryNotes;

    transfer.handedOverBy = actorName || 'IT Admin';
    transfer.handoverDate = new Date();
    transfer.status = 'Acknowledgement Pending';
    transfer.history.push({
      date: new Date(),
      action: 'Handover Confirmed',
      performedBy: actorName || 'IT Admin',
      details: notes || `Physical equipment handed over for custody transition to ${transfer.toEmployeeName}. Awaiting receipt acknowledgement.`,
    });

    await transfer.save();

    await AuditLog.create({
      user: actorName || 'IT Admin',
      action: 'Handover Confirmed',
      assetTag: transfer.assetTag || transfer.assetSerial,
      details: `Handover confirmed for transfer ${transfer.transferId}. Dispatched to ${transfer.toEmployeeName}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: `Handover confirmed for ${transfer.transferId}. Awaiting recipient acknowledgement.`,
      data: transfer,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Acknowledge receipt and complete transfer (Atomic Custody Switch)
// @route   POST /api/transfers/:id/acknowledge
export const acknowledgeTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName, notes, acknowledgementNotes } = req.body;

    const transfer = await Transfer.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { transferId: id }],
    });
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer record not found' });

    if (transfer.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'This transfer is already completed.' });
    }
    if (transfer.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'This transfer has been cancelled.' });
    }

    const asset = await Asset.findById(transfer.assetId);
    if (!asset) return res.status(404).json({ success: false, message: 'Underlying asset not found' });

    // Concurrency Protection: Verify asset custodian has not changed since transfer was created
    const currentCustodianName = (asset.userName || '').trim().toLowerCase();
    const currentCustodianCode = (asset.empCode || '').trim().toLowerCase();
    const expectedFromCode = (transfer.fromEmpCode || '').trim().toLowerCase();
    const expectedFromName = (transfer.fromEmployeeName || '').trim().toLowerCase();

    if (
      (expectedFromCode && currentCustodianCode && currentCustodianCode !== expectedFromCode) ||
      (!expectedFromCode && expectedFromName && currentCustodianName !== expectedFromName)
    ) {
      return res.status(400).json({
        success: false,
        message: 'The asset custodian has changed since this transfer was created. Please refresh and create a new transfer.',
      });
    }

    // ATOMIC UPDATE: Switch Asset Master custodian to new employee
    const oldUserName = asset.userName;
    const oldEmpCode = asset.empCode;

    asset.userName = transfer.toEmployeeName;
    asset.empCode = transfer.toEmpCode || transfer.toEmployeeId;
    asset.department = transfer.toDepartment || asset.department;
    asset.mailId = transfer.toEmail || asset.mailId;
    if (transfer.destinationLocation) {
      asset.plant = transfer.destinationLocation;
    }
    asset.status = 'Assigned';
    asset.userStatus = 'Active';
    asset.workingCondition = transfer.assetCondition || asset.workingCondition || 'Good';
    asset.receiptAcknowledged = true;
    asset.receiptAcknowledgedAt = new Date();
    asset.acknowledgementNotes = acknowledgementNotes || notes || 'Transfer receipt acknowledged';

    // Append custody timeline events to Asset history
    const transEvent = {
      action: 'Transferred',
      date: transfer.transferDate || new Date(),
      user: actorName || 'IT Admin',
      details: `Custody transferred from ${oldUserName} (${oldEmpCode || 'N/A'}) to ${transfer.toEmployeeName} (${transfer.toEmpCode || 'N/A'}) [${transfer.transferId}]. Reason: ${transfer.reason}`,
    };
    const ackEvent = {
      action: 'Acknowledged',
      date: new Date(),
      user: transfer.toEmployeeName,
      details: `Receipt acknowledged by new custodian ${transfer.toEmployeeName} (${transfer.toEmpCode || 'N/A'}): "${asset.acknowledgementNotes}"`,
    };
    asset.history.unshift(ackEvent);
    asset.history.unshift(transEvent);

    await asset.save();

    // Update transfer document
    transfer.status = 'Completed';
    transfer.acknowledgedBy = actorName || transfer.toEmployeeName;
    transfer.acknowledgementDate = new Date();
    transfer.acknowledgementNotes = asset.acknowledgementNotes;
    transfer.history.push({
      date: new Date(),
      action: 'Acknowledgement Received',
      performedBy: actorName || transfer.toEmployeeName,
      details: `Custody confirmed and receipt acknowledged by ${transfer.toEmployeeName}. Transfer completed.`,
    });

    await transfer.save();

    await AuditLog.create({
      user: actorName || transfer.toEmployeeName,
      action: 'Transfer Completed',
      assetTag: asset.assetNo || asset.sr,
      details: `Transfer ${transfer.transferId} finalized: ${oldUserName} -> ${transfer.toEmployeeName}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    await Notification.create({
      title: 'Asset Transfer Completed',
      message: `Asset ${asset.assetNo || asset.sr} (${asset.make} ${asset.model}) successfully transferred to ${transfer.toEmployeeName}.`,
      type: 'assignment',
    });

    res.status(200).json({
      success: true,
      message: `Transfer ${transfer.transferId} completed successfully! Custody updated to ${transfer.toEmployeeName}.`,
      data: {
        transfer,
        asset,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Cancel a transfer request
// @route   POST /api/transfers/:id/cancel
export const cancelTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { actorName, cancellationReason, reason } = req.body;

    const transfer = await Transfer.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { transferId: id }],
    });
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer record not found' });

    if (transfer.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed transfers cannot be cancelled.',
      });
    }
    if (transfer.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Transfer is already cancelled.',
      });
    }

    transfer.status = 'Cancelled';
    transfer.cancelledBy = actorName || 'IT Admin';
    transfer.cancelledDate = new Date();
    transfer.cancellationReason = cancellationReason || reason || 'Cancelled by administrator';
    transfer.history.push({
      date: new Date(),
      action: 'Transfer Cancelled',
      performedBy: actorName || 'IT Admin',
      details: `Transfer cancelled by ${actorName || 'IT Admin'}. Reason: ${transfer.cancellationReason}. Asset remains with ${transfer.fromEmployeeName}.`,
    });

    await transfer.save();

    // Log cancellation on asset history for complete audit
    const asset = await Asset.findById(transfer.assetId);
    if (asset) {
      asset.history.unshift({
        action: 'Transfer Cancelled',
        date: new Date(),
        user: actorName || 'IT Admin',
        details: `Transfer ticket ${transfer.transferId} was cancelled. Asset remains assigned to ${asset.userName}.`,
      });
      await asset.save();
    }

    await AuditLog.create({
      user: actorName || 'IT Admin',
      action: 'Transfer Cancelled',
      assetTag: transfer.assetTag || transfer.assetSerial,
      details: `Cancelled transfer ${transfer.transferId}: ${transfer.cancellationReason}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: `Transfer ${transfer.transferId} cancelled. Asset remains with ${transfer.fromEmployeeName}.`,
      data: transfer,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get transfer history for a specific asset
// @route   GET /api/assets/:id/transfers
export const getAssetTransfers = async (req, res) => {
  try {
    const { id } = req.params;
    const transfers = await Transfer.find({
      $or: [
        { assetId: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { assetTag: id },
        { assetSerial: id },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: transfers.length, data: transfers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get transfer history for an employee (incoming and outgoing)
// @route   GET /api/employees/:id/transfers
export const getEmployeeTransfers = async (req, res) => {
  try {
    const { id } = req.params;
    const transfers = await Transfer.find({
      $or: [
        { fromEmployeeId: id },
        { toEmployeeId: id },
        { fromEmpCode: id },
        { toEmpCode: id },
        { fromEmail: id },
        { toEmail: id },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: transfers.length, data: transfers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

