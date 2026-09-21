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
// MAINTENANCECONTROLLER
// ==========================================

export const getMaintenance = async (req, res) => {
  try {
    const { status, search, assetId, employeeId, priority, issueCategory } = req.query;
    const query = {};

    if (status && status !== 'All') {
      if (status === 'Active') {
        query.status = { $nin: ['Returned', 'Cancelled', 'Resolved', 'Closed'] };
      } else {
        query.status = status;
      }
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    if (issueCategory && issueCategory !== 'All') {
      query.issueCategory = issueCategory;
    }
    if (assetId) {
      query.assetId = assetId;
    }
    if (employeeId) {
      query.$or = [{ employeeId }, { empCode: employeeId }, { employeeName: employeeId }];
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { maintenanceId: { $regex: q, $options: 'i' } },
        { ticketId: { $regex: q, $options: 'i' } },
        { assetTag: { $regex: q, $options: 'i' } },
        { assetSerial: { $regex: q, $options: 'i' } },
        { assetMake: { $regex: q, $options: 'i' } },
        { assetModel: { $regex: q, $options: 'i' } },
        { employeeName: { $regex: q, $options: 'i' } },
        { empCode: { $regex: q, $options: 'i' } },
        { issueDescription: { $regex: q, $options: 'i' } },
        { issue: { $regex: q, $options: 'i' } },
        { vendor: { $regex: q, $options: 'i' } },
      ];
    }

    const tickets = await Maintenance.find(query)
      .populate('assetId', 'assetNo sr make model deviceType category status plant userName department')
      .sort({ reportedDate: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMaintenanceById = async (req, res) => {
  try {
    const ticket = await Maintenance.findById(req.params.id)
      .populate('assetId', 'assetNo sr make model deviceType category status plant userName department warrantyStartDate warrantyEndDate purchaseDate');
    if (!ticket) return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createMaintenance = async (req, res) => {
  try {
    let {
      maintenanceId,
      assetId,
      assetTag,
      issueDescription,
      issue,
      issueCategory = 'Hardware',
      priority = 'Medium',
      reportedBy = 'IT Staff',
      reportedDate,
      expectedReturnDate,
      serviceNotes,
      vendor,
      repairType,
      actorName,
    } = req.body;

    const desc = issueDescription || issue || 'Hardware/Software Issue';

    let asset = null;
    if (assetId) {
      asset = await Asset.findById(assetId);
    }
    if (!asset && assetTag) {
      asset = await Asset.findOne({ $or: [{ assetNo: assetTag }, { sr: assetTag }] });
    }

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Target asset not found for maintenance' });
    }

    if (['Retired', 'Disposed'].includes(asset.status)) {
      return res.status(400).json({
        success: false,
        message: `Asset ${asset.assetNo || asset.sr} is ${asset.status} and cannot be placed into maintenance.`,
      });
    }

    const activeTicket = await Maintenance.findOne({
      assetId: asset._id,
      status: { $nin: ['Returned', 'Cancelled', 'Resolved', 'Closed'] },
    });

    if (activeTicket) {
      return res.status(400).json({
        success: false,
        message: `This asset already has an active maintenance request: ${activeTicket.maintenanceId || activeTicket.ticketId}`,
        data: activeTicket,
      });
    }

    if (!maintenanceId) {
      const highestTicket = await Maintenance.findOne({ maintenanceId: /^MNT-VIT-\d+$/ }).sort({ maintenanceId: -1 });
      let nextNum = 101;
      if (highestTicket && highestTicket.maintenanceId) {
        const num = parseInt(highestTicket.maintenanceId.replace('MNT-VIT-', ''), 10);
        if (!isNaN(num)) nextNum = num + 1;
      }
      maintenanceId = `MNT-VIT-${String(nextNum).padStart(6, '0')}`;
    }

    const hasCustodian = asset.userName && asset.userName !== 'Unassigned';
    const empName = hasCustodian ? asset.userName : (req.body.employeeName || '');
    const empCode = hasCustodian ? asset.empCode : (req.body.empCode || '');
    const dept = hasCustodian ? asset.department : (req.body.department || 'General');

    const newTicket = await Maintenance.create({
      maintenanceId,
      ticketId: maintenanceId,
      assetId: asset._id,
      assetTag: asset.assetNo || asset.sr,
      assetCategory: asset.category || 'Hardware',
      assetMake: asset.make || '',
      assetModel: asset.model || '',
      assetSerial: asset.sr || '',
      employeeName: empName,
      empCode: empCode,
      department: dept,
      reportedBy: actorName || reportedBy || (hasCustodian ? empName : 'IT Staff'),
      reportedDate: reportedDate ? new Date(reportedDate) : new Date(),
      issueCategory,
      issueDescription: desc,
      issue: desc,
      priority,
      status: 'Reported',
      vendor: vendor || '',
      serviceVendor: vendor || '',
      repairType: repairType || '',
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : undefined,
      serviceNotes: serviceNotes || '',
      history: [
        {
          date: new Date(),
          action: 'Issue Reported',
          performedBy: actorName || reportedBy || 'IT Staff',
          details: `Reported issue: ${desc} (Priority: ${priority})`,
        },
      ],
      createdBy: actorName || 'IT Admin',
    });

    asset.status = 'Under Maintenance';
    asset.history.unshift({
      action: 'Sent to Maintenance',
      date: new Date(),
      user: actorName || reportedBy || 'IT Admin',
      details: `Placed into maintenance (${maintenanceId}). Issue: ${desc} [Priority: ${priority}]`,
      maintenanceId,
    });
    await asset.save();

    await AuditLog.create({
      user: actorName || 'IT Admin',
      role: 'IT Admin',
      action: 'Maintenance Created',
      assetTag: asset.sr || asset.assetNo,
      details: `Created maintenance ${maintenanceId} for ${asset.assetNo || asset.sr}: ${desc}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      data: newTicket,
      message: `Maintenance request ${maintenanceId} created successfully`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMaintenance = async (req, res) => {
  try {
    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Maintenance record not found' });

    const updated = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated, message: 'Maintenance record updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const diagnoseMaintenance = async (req, res) => {
  try {
    const { diagnosis, rootCause, recommendedAction, diagnosedBy, actorName } = req.body;
    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Maintenance record not found' });

    ticket.diagnosis = diagnosis || ticket.diagnosis;
    ticket.rootCause = rootCause || ticket.rootCause;
    ticket.recommendedAction = recommendedAction || ticket.recommendedAction;
    ticket.diagnosedBy = diagnosedBy || actorName || 'IT Support';
    ticket.diagnosisDate = new Date();
    ticket.status = 'Under Diagnosis';

    ticket.history.unshift({
      date: new Date(),
      action: 'Diagnosis Completed',
      performedBy: ticket.diagnosedBy,
      details: `Diagnosis: ${ticket.diagnosis}${ticket.rootCause ? ` | Root Cause: ${ticket.rootCause}` : ''}`,
    });

    await ticket.save();

    await Asset.findByIdAndUpdate(ticket.assetId, {
      $push: {
        history: {
          $each: [
            {
              action: 'Maintenance Diagnosis',
              date: new Date(),
              user: ticket.diagnosedBy,
              details: `Diagnosis on ${ticket.maintenanceId}: ${ticket.diagnosis}`,
            },
          ],
          $position: 0,
        },
      },
    });

    res.status(200).json({ success: true, data: ticket, message: 'Diagnosis updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const startRepairMaintenance = async (req, res) => {
  try {
    const {
      repairType,
      vendor,
      serviceVendor,
      warrantyStatus,
      sentDate,
      expectedReturnDate,
      partsReplaced,
      serviceNotes,
      repairCost,
      status,
      actorName,
    } = req.body;

    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Maintenance record not found' });

    if (repairType) ticket.repairType = repairType;
    if (vendor || serviceVendor) {
      ticket.vendor = vendor || serviceVendor;
      ticket.serviceVendor = vendor || serviceVendor;
    }
    if (warrantyStatus) ticket.warrantyStatus = warrantyStatus;
    if (sentDate) ticket.sentDate = new Date(sentDate);
    if (expectedReturnDate) ticket.expectedReturnDate = new Date(expectedReturnDate);
    if (partsReplaced) ticket.partsReplaced = partsReplaced;
    if (serviceNotes) ticket.serviceNotes = serviceNotes;
    if (repairCost !== undefined) {
      ticket.repairCost = parseFloat(repairCost) || 0;
      ticket.cost = parseFloat(repairCost) || 0;
    }

    const nextStatus = status || (ticket.vendor ? 'Awaiting Vendor' : 'In Repair');
    ticket.status = nextStatus;

    ticket.history.unshift({
      date: new Date(),
      action: nextStatus === 'QC Pending' ? 'Repair Completed' : 'Repair Updated',
      performedBy: actorName || 'IT Support',
      details: `${nextStatus} - Type: ${ticket.repairType || 'Standard'} ${ticket.vendor ? `(Vendor: ${ticket.vendor})` : ''} ${ticket.serviceNotes ? `[Notes: ${ticket.serviceNotes}]` : ''}`,
    });

    await ticket.save();

    res.status(200).json({ success: true, data: ticket, message: `Repair status updated to ${nextStatus}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const qcMaintenance = async (req, res) => {
  try {
    const { qcResult, qcNotes, qcBy, actorName } = req.body;
    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Maintenance record not found' });

    if (!qcResult || !['Passed', 'Failed'].includes(qcResult)) {
      return res.status(400).json({ success: false, message: 'QC Result must be either "Passed" or "Failed"' });
    }

    const tester = qcBy || actorName || 'IT QC Inspector';
    ticket.qcResult = qcResult;
    ticket.qcNotes = qcNotes || '';
    ticket.qcBy = tester;
    ticket.qcDate = new Date();

    if (qcResult === 'Passed') {
      ticket.status = 'Ready';
    } else {
      ticket.status = 'In Repair';
    }

    ticket.history.unshift({
      date: new Date(),
      action: qcResult === 'Passed' ? 'QC Passed' : 'QC Failed',
      performedBy: tester,
      details: `QC ${qcResult}. ${qcNotes ? `Notes: ${qcNotes}` : ''}`,
    });

    await ticket.save();

    await Asset.findByIdAndUpdate(ticket.assetId, {
      $push: {
        history: {
          $each: [
            {
              action: qcResult === 'Passed' ? 'QC Passed' : 'QC Failed',
              date: new Date(),
              user: tester,
              details: `Maintenance ${ticket.maintenanceId} - QC ${qcResult} by ${tester}`,
            },
          ],
          $position: 0,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: ticket,
      message: `QC evaluated as ${qcResult}. Status is now ${ticket.status}.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const completeMaintenance = async (req, res) => {
  try {
    const { finalDisposition, remarks, actorName } = req.body;
    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Maintenance record not found' });

    if (ticket.qcResult !== 'Passed' || ticket.status !== 'Ready') {
      return res.status(400).json({
        success: false,
        message: 'QC must be completed and marked as "Passed" before the asset can be returned from maintenance.',
      });
    }

    const disposition = finalDisposition || (ticket.employeeName ? 'Return to Employee' : 'Return to Stock');
    const asset = await Asset.findById(ticket.assetId);
    if (!asset) return res.status(404).json({ success: false, message: 'Associated asset record not found' });

    const operator = actorName || 'IT Admin';
    const completionDate = new Date();

    if (disposition === 'Return to Employee') {
      asset.status = 'Assigned';
      asset.history.unshift({
        action: 'Returned from Maintenance',
        date: completionDate,
        user: operator,
        details: `Returned from maintenance (${ticket.maintenanceId}) to custodian ${asset.userName} (${asset.department}) following successful repair & QC.`,
      });
    } else if (disposition === 'Return to Stock') {
      const prevOwner = asset.userName;
      asset.status = 'Available';
      asset.userName = 'Unassigned';
      asset.empCode = '';
      asset.mailId = '';
      asset.history.unshift({
        action: 'Returned to Stock',
        date: completionDate,
        user: operator,
        details: `Returned from maintenance (${ticket.maintenanceId}) into available inventory stock (Previous custodian: ${prevOwner}).`,
      });
    } else if (disposition === 'Retire') {
      asset.status = 'Retired';
      asset.history.unshift({
        action: 'Retired',
        date: completionDate,
        user: operator,
        details: `Retired following maintenance evaluation (${ticket.maintenanceId}).`,
      });
    }

    if (ticket.repairCost) asset.lastMaintenanceCost = ticket.repairCost;
    if (ticket.serviceNotes || remarks) asset.lastMaintenanceResolution = ticket.serviceNotes || remarks || 'Completed maintenance';

    await asset.save();

    ticket.status = 'Returned';
    ticket.finalDisposition = disposition;
    ticket.completedDate = completionDate;
    ticket.returnedDate = completionDate;
    ticket.history.unshift({
      date: completionDate,
      action: 'Maintenance Finalized',
      performedBy: operator,
      details: `Asset finalized with disposition: "${disposition}".`,
    });
    await ticket.save();

    await AuditLog.create({
      user: operator,
      role: 'IT Admin',
      action: 'Maintenance Completed',
      assetTag: asset.sr || asset.assetNo,
      details: `Maintenance ${ticket.maintenanceId} completed. Disposition: ${disposition}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      data: { ticket, asset },
      message: `Asset successfully processed with disposition: "${disposition}"`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelMaintenance = async (req, res) => {
  try {
    const { cancelReason, actorName } = req.body;
    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Maintenance record not found' });

    ticket.status = 'Cancelled';
    ticket.history.unshift({
      date: new Date(),
      action: 'Maintenance Cancelled',
      performedBy: actorName || 'IT Admin',
      details: `Cancelled: ${cancelReason || 'No action required'}`,
    });
    await ticket.save();

    const asset = await Asset.findById(ticket.assetId);
    if (asset) {
      if (asset.userName && asset.userName !== 'Unassigned') {
        asset.status = 'Assigned';
      } else {
        asset.status = 'Available';
      }
      asset.history.unshift({
        action: 'Maintenance Cancelled',
        date: new Date(),
        user: actorName || 'IT Admin',
        details: `Maintenance request ${ticket.maintenanceId} was cancelled. Asset restored to ${asset.status}.`,
      });
      await asset.save();
    }

    res.status(200).json({ success: true, data: ticket, message: `Maintenance request ${ticket.maintenanceId} cancelled` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const reportAssetIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { issue, issueDescription, issueCategory = 'Hardware', priority = 'Medium', reportedBy, notes, actorName } = req.body;

    const asset = await Asset.findById(id);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset record not found' });

    req.body.assetId = asset._id;
    req.body.assetTag = asset.assetNo || asset.sr;
    req.body.issueDescription = issueDescription || issue || notes || 'Hardware issue reported';
    req.body.issueCategory = issueCategory;
    req.body.priority = priority;
    req.body.reportedBy = actorName || reportedBy || asset.userName || 'Employee';

    return createMaintenance(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAssetMaintenanceHistory = async (req, res) => {
  try {
    const tickets = await Maintenance.find({ assetId: req.params.id }).sort({ reportedDate: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmployeeMaintenanceHistory = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    const filter = {
      $or: [
        { employeeId: req.params.id },
        { empCode: emp?.employeeId || req.params.id },
        { employeeName: emp?.name || '' },
      ].filter(Boolean),
    };
    const tickets = await Maintenance.find(filter).sort({ reportedDate: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resolveMaintenance = completeMaintenance;

export const deleteMaintenance = async (req, res) => {
  try {
    const ticket = await Maintenance.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    res.status(200).json({ success: true, message: `Ticket ${ticket.maintenanceId || ticket.ticketId} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 9. INWARD PROCUREMENT CONTROLLERS
// ==========================================

