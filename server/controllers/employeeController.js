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
// EMPLOYEECONTROLLER
// ==========================================

export const getEmployees = async (req, res) => {
  try {
    let employees = await Employee.find().sort({ name: 1 });
    if (!employees || employees.length === 0) {
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
        } catch {}
        employees = await Employee.find().sort({ name: 1 });
      }
    }
    res.status(200).json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    let { employeeId, name, email, department, location, designation, phone, status, actorName } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Employee name is required' });
    }

    if (!employeeId?.trim()) {
      const highestEmp = await Employee.findOne({ employeeId: /^VIT-\d+$/ }).sort({ employeeId: -1 });
      let nextNum = 1001;
      if (highestEmp && highestEmp.employeeId) {
        const num = parseInt(highestEmp.employeeId.replace('VIT-', ''), 10);
        if (!isNaN(num)) nextNum = num + 1;
      }
      employeeId = `VIT-${nextNum}`;
    }

    const existingId = await Employee.findOne({ employeeId: employeeId.trim() });
    if (existingId) {
      return res.status(400).json({ success: false, message: `Employee ID "${employeeId}" is already assigned to ${existingId.name}` });
    }

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
};

export const bulkImportEmployees = async (req, res) => {
  try {
    const { employees: rawEmployees, actorName, updateExisting = false } = req.body;

    if (!Array.isArray(rawEmployees) || rawEmployees.length === 0) {
      return res.status(400).json({ success: false, message: 'No employee records provided for bulk import' });
    }

    const highestEmp = await Employee.findOne({ employeeId: /^VIT-\d+$/ }).sort({ employeeId: -1 });
    let nextNum = 1001;
    if (highestEmp && highestEmp.employeeId) {
      const num = parseInt(highestEmp.employeeId.replace('VIT-', ''), 10);
      if (!isNaN(num)) nextNum = num + 1;
    }

    const existingEmployees = await Employee.find({}, { employeeId: 1, email: 1, name: 1, department: 1, location: 1, designation: 1, phone: 1, status: 1 });
    const existingIdMap = new Map();
    const existingEmailMap = new Map();
    existingEmployees.forEach((e) => {
      if (e.employeeId) existingIdMap.set(e.employeeId.trim().toLowerCase(), e);
      if (e.email) existingEmailMap.set(e.email.trim().toLowerCase(), e);
    });

    const results = { created: [], updated: [], skipped: [], errors: [] };
    const toInsert = [];

    for (let i = 0; i < rawEmployees.length; i++) {
      const item = rawEmployees[i];
      const rowNum = i + 1;
      const name = (item.name || '').trim();
      if (!name) {
        results.errors.push({ row: rowNum, message: 'Missing employee name' });
        continue;
      }

      let employeeId = (item.employeeId || '').trim();
      if (!employeeId) employeeId = `VIT-${nextNum++}`;

      let email = (item.email || '').trim().toLowerCase();
      if (!email) {
        const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        email = `${cleanName}@vitromed.com`;
      }

      const normId = employeeId.toLowerCase();
      const normEmail = email.toLowerCase();
      const idExists = existingIdMap.get(normId);
      const emailExists = existingEmailMap.get(normEmail);

      if (idExists || emailExists) {
        const existingRecord = idExists || emailExists;
        if (updateExisting) {
          try {
            const updated = await Employee.findByIdAndUpdate(
              existingRecord._id,
              {
                name,
                department: item.department?.trim() || existingRecord.department || 'General',
                location: item.location?.trim() || existingRecord.location || 'Vitromed',
                designation: item.designation?.trim() || existingRecord.designation || 'Staff Associate',
                phone: item.phone?.trim() || existingRecord.phone || '',
                status: item.status?.trim() || existingRecord.status || 'Active',
              },
              { new: true }
            );
            results.updated.push(updated);
          } catch (updateErr) {
            results.errors.push({ row: rowNum, message: `Failed to update ${name}: ${updateErr.message}` });
          }
        } else {
          results.skipped.push({
            row: rowNum,
            name,
            employeeId,
            reason: idExists ? `Employee ID "${employeeId}" already exists` : `Email "${email}" already registered`,
          });
        }
        continue;
      }

      const newDoc = {
        employeeId,
        name,
        email,
        department: item.department?.trim() || 'General',
        location: item.location?.trim() || 'Vitromed',
        designation: item.designation?.trim() || 'Staff Associate',
        phone: item.phone?.trim() || '',
        status: item.status?.trim() || 'Active',
      };

      existingIdMap.set(normId, newDoc);
      existingEmailMap.set(normEmail, newDoc);
      toInsert.push(newDoc);
    }

    if (toInsert.length > 0) {
      const inserted = await Employee.insertMany(toInsert);
      results.created = inserted;
    }

    await AuditLog.create({
      user: actorName || 'IT Admin',
      role: 'IT Admin',
      action: 'Bulk Employee Import',
      details: `Bulk imported ${results.created.length} employees (${results.updated.length} updated, ${results.skipped.length} skipped, ${results.errors.length} errors)`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      message: `Successfully processed ${rawEmployees.length} records: ${results.created.length} created, ${results.updated.length} updated, ${results.skipped.length} skipped`,
      data: results,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const oldEmp = await Employee.findById(id);
    if (!oldEmp) {
      return res.status(404).json({ success: false, message: 'Employee record not found' });
    }

    const { employeeId, name, email, department, location, designation, phone, status, actorName } = req.body;
    const previousId = oldEmp.employeeId;
    const previousName = oldEmp.name;

    if (employeeId && employeeId.trim() !== oldEmp.employeeId) {
      const existing = await Employee.findOne({ employeeId: employeeId.trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ success: false, message: `Employee ID "${employeeId}" is already assigned to ${existing.name}` });
      }
    }

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

    if ((employeeId && employeeId.trim() !== previousId) || (name && name.trim() !== previousName)) {
      const escapedPrevName = previousName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedPrevId = previousId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await Asset.updateMany(
        {
          $or: [
            { userName: { $regex: new RegExp(`^${escapedPrevName}$`, 'i') } },
            { empCode: { $regex: new RegExp(`^${escapedPrevId}$`, 'i') } },
          ],
        },
        {
          $set: {
            userName: updated.name,
            empCode: updated.employeeId,
            mailId: updated.email,
            department: updated.department,
            plant: updated.location,
          },
        }
      );
    }

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
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await Employee.findById(id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee record not found' });
    }

    const assignedCount = await Asset.countDocuments({
      $or: [{ userName: emp.name }, { empCode: emp.employeeId }],
    });

    if (assignedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete employee "${emp.name}" because they have ${assignedCount} active hardware asset(s) assigned. Please return or transfer the assets first.`,
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
};

export const getEmployeeAssets = async (req, res) => {
  try {
    const { id } = req.params;
    let emp = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      emp = await Employee.findById(id);
    }
    if (!emp) {
      emp = await Employee.findOne({ $or: [{ employeeId: id }, { email: id.toLowerCase() }, { name: id }] });
    }

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const escapedName = emp.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedCode = emp.employeeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedEmail = emp.email ? emp.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';

    const orConditions = [
      { empCode: { $regex: new RegExp(`^${escapedCode}$`, 'i') } },
      { userName: { $regex: new RegExp(`^${escapedName}$`, 'i') } },
    ];
    if (escapedEmail) {
      orConditions.push({ mailId: { $regex: new RegExp(escapedEmail, 'i') } });
    }

    const assets = await Asset.find({
      status: { $in: ['Assigned', 'Under Maintenance'] },
      $or: orConditions,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: assets.length,
      employee: {
        id: emp._id,
        employeeId: emp.employeeId,
        name: emp.name,
        department: emp.department,
        designation: emp.designation,
        location: emp.location,
        status: emp.status,
      },
      data: assets,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmployeeHistory = async (req, res) => {
  try {
    const { id } = req.params;
    let emp = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      emp = await Employee.findById(id);
    }
    if (!emp) {
      emp = await Employee.findOne({ $or: [{ employeeId: id }, { email: id.toLowerCase() }, { name: id }] });
    }

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const escapedName = emp.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedCode = emp.employeeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const assets = await Asset.find({
      $or: [
        { userName: { $regex: new RegExp(`^${escapedName}$`, 'i') } },
        { empCode: { $regex: new RegExp(`^${escapedCode}$`, 'i') } },
        { 'history.details': { $regex: new RegExp(escapedName, 'i') } },
        { 'history.details': { $regex: new RegExp(escapedCode, 'i') } },
      ],
    });

    const combinedTimeline = [];
    const nameLower = emp.name.toLowerCase();
    const codeLower = emp.employeeId.toLowerCase();

    assets.forEach((asset) => {
      (asset.history || []).forEach((h) => {
        const detailsLower = (h.details || '').toLowerCase();
        const matchesUser =
          detailsLower.includes(nameLower) ||
          detailsLower.includes(codeLower) ||
          (asset.userName && asset.userName.toLowerCase() === nameLower);

        if (matchesUser) {
          combinedTimeline.push({
            assetId: asset._id,
            assetNo: asset.assetNo || 'AST-N/A',
            deviceType: asset.deviceType || 'Hardware',
            make: asset.make || '',
            model: asset.model || '',
            sr: asset.sr || '',
            action: h.action,
            date: h.date,
            user: h.user,
            details: h.details,
          });
        }
      });
    });

    combinedTimeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      count: combinedTimeline.length,
      data: combinedTimeline,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const employeeExit = async (req, res) => {
  try {
    const { id } = req.params;
    const { exitDate, exitRemarks, workingCondition, assetIds, actorName } = req.body;

    let emp = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      emp = await Employee.findById(id);
    }
    if (!emp) {
      emp = await Employee.findOne({ $or: [{ employeeId: id }, { email: id.toLowerCase() }] });
    }

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    emp.status = 'Resigned';
    await emp.save();

    const escapedName = emp.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedCode = emp.employeeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const assetQuery = {
      status: { $in: ['Assigned', 'Under Maintenance'] },
      $or: [
        { userName: { $regex: new RegExp(`^${escapedName}$`, 'i') } },
        { empCode: { $regex: new RegExp(`^${escapedCode}$`, 'i') } },
      ],
    };

    if (Array.isArray(assetIds) && assetIds.length > 0) {
      assetQuery._id = { $in: assetIds };
    }

    const assignedAssets = await Asset.find(assetQuery);
    const effectiveDate = exitDate ? new Date(exitDate) : new Date();
    const formattedDate = effectiveDate.toLocaleDateString('en-GB');
    const cond = workingCondition || 'Good';
    const notes = exitRemarks || 'Recovered to central stock on employee exit/resignation';

    for (const asset of assignedAssets) {
      asset.status = 'Available';
      asset.userName = 'Unassigned';
      asset.empCode = '';
      asset.mailId = '';
      asset.workingCondition = cond;
      asset.assignedDate = null;
      asset.expectedReturnDate = null;
      asset.remarks = `Returned on ${formattedDate} (Offboarding): ${notes}`;

      asset.history.unshift({
        action: 'Returned (Employee Exit)',
        date: effectiveDate,
        user: actorName || 'IT Admin',
        details: `Recovered from ${emp.name} (${emp.employeeId}) upon employee exit. Condition: ${cond}. Remarks: ${notes}`,
      });

      await asset.save();
    }

    await AuditLog.create({
      user: actorName || 'IT Admin',
      role: 'IT Admin',
      action: 'Employee Offboarded',
      details: `Offboarded ${emp.name} (${emp.employeeId}). Recovered ${assignedAssets.length} hardware asset(s) to stock.`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: `Employee "${emp.name}" offboarded successfully and ${assignedAssets.length} asset(s) recovered to stock`,
      data: {
        employee: emp,
        recoveredAssetsCount: assignedAssets.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// 3. DEPARTMENT CONTROLLERS
// ==========================================

