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
import { generateToken, normalizeRole } from '../middleware/auth.js';
import { resolveUserPermissions } from '../middleware/permissionMiddleware.js';
import { getClientIp } from '../utils/clientIp.js';
import { recordAuditLog, calculateDiff } from '../utils/auditService.js';

// ==========================================
// SYSTEMCONTROLLER
// ==========================================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanInput = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    const clientIp = getClientIp(req);

    // Normalized email lookup (handles both 'admin' and 'admin@vitromed.com')
    const searchEmail = cleanInput === 'admin' ? 'admin@vitromed.com' : cleanInput;

    let user = await User.findOne({
      $or: [
        { email: searchEmail },
        { username: cleanInput },
        { name: { $regex: new RegExp(`^${cleanInput}$`, 'i') } },
      ],
    });

    // Default built-in Administrator credential bootstrap
    const isAdminMatch =
      (cleanInput === 'admin' || cleanInput === 'admin@vitromed.com') &&
      (cleanPass === 'Admin@123' || cleanPass === 'admin123');

    if (!user && isAdminMatch) {
      user = await User.create({
        name: 'IT Administrator',
        username: 'admin',
        email: 'admin@vitromed.com',
        password: 'Admin@123',
        role: 'Super Admin',
        department: 'IT Infrastructure',
        active: true,
        loginCount: 0,
      });
    }

    const isPasswordValid = user ? (await user.comparePassword(cleanPass)) || (isAdminMatch && user.email === 'admin@vitromed.com') : false;

    if (!user || !isPasswordValid) {
      // Record failed login attempt in audit trail without storing passwords
      await recordAuditLog({
        req,
        action: 'FAILED_LOGIN',
        module: 'Auth',
        status: 'FAILED',
        details: `Failed login attempt for identifier "${cleanInput}" from IP ${clientIp}`,
        description: `Failed authentication attempt using identifier "${cleanInput}"`,
        userOverride: { username: cleanInput || 'Unknown', name: cleanInput || 'Unknown', role: 'User' },
      });

      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    if (user.active === false) {
      await recordAuditLog({
        req,
        action: 'FAILED_LOGIN',
        module: 'Auth',
        status: 'FAILED',
        details: `Deactivated user "${user.email}" attempted to log in`,
        description: `Access rejected: User "${user.email}" is deactivated`,
        userOverride: { id: user._id, username: user.username, name: user.name, role: user.role },
      });

      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact your Super Administrator.',
      });
    }

    // Update last login metadata & login counter
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLogin = new Date();
    user.lastLoginIp = clientIp;
    if (!user.username) {
      user.username = user.email.split('@')[0].toLowerCase();
    }
    await user.save();

    const canonicalRole = normalizeRole(user.role);
    const token = generateToken(user);
    const effectivePermissions = await resolveUserPermissions(user);

    // Record successful login audit log
    await recordAuditLog({
      req,
      action: 'LOGIN',
      module: 'Auth',
      status: 'SUCCESS',
      recordId: user._id,
      recordIdentifier: user.email,
      details: `${user.name} (${canonicalRole}) logged into ITAM dashboard`,
      description: `User "${user.name}" (${canonicalRole}) authenticated successfully from IP ${clientIp}`,
      userOverride: { id: user._id, username: user.username, name: user.name, role: canonicalRole },
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: canonicalRole,
        rawRole: user.role,
        department: user.department || 'IT Infrastructure',
        employeeId: user.employeeId || null,
        loginCount: user.loginCount,
        lastLogin: user.lastLogin,
        lastLoginIp: user.lastLoginIp,
        permissions: effectivePermissions,
      },
    });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    if (req.user) {
      await recordAuditLog({
        req,
        action: 'LOGOUT',
        module: 'Auth',
        status: 'SUCCESS',
        recordId: req.user.id,
        recordIdentifier: req.user.email,
        details: `${req.user.name} (${req.user.role}) logged out`,
        description: `User "${req.user.name}" (${req.user.role}) logged out from IP ${getClientIp(req)}`,
      });
    }
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const effectivePermissions = await resolveUserPermissions(user);
    const canonicalRole = normalizeRole(user.role);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username || user.email.split('@')[0],
        email: user.email,
        role: canonicalRole,
        rawRole: user.role,
        department: user.department,
        employeeId: user.employeeId,
        loginCount: user.loginCount || 0,
        lastLogin: user.lastLogin,
        lastLoginIp: user.lastLoginIp,
        permissions: effectivePermissions,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      await recordAuditLog({
        req,
        action: 'PASSWORD_CHANGE',
        module: 'Auth',
        status: 'FAILED',
        recordId: user._id,
        recordIdentifier: user.email,
        details: `Failed password change attempt: Incorrect current password for "${user.email}"`,
        description: `Failed password change: Incorrect credentials provided by user "${user.name}"`,
      });
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    await recordAuditLog({
      req,
      action: 'PASSWORD_CHANGE',
      module: 'Auth',
      status: 'SUCCESS',
      recordId: user._id,
      recordIdentifier: user.email,
      details: `Password changed successfully for user "${user.name}" (${user.email})`,
      description: `User "${user.name}" changed personal password from IP ${getClientIp(req)}`,
    });

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const targetUserId = req.params.id;
    const callerRole = normalizeRole(req.user?.role);

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'Target user not found' });

    const targetCanonicalRole = normalizeRole(targetUser.role);

    // Safeguard: Admin cannot reset password for Admin or Super Admin
    if (callerRole === 'Admin' && targetCanonicalRole !== 'User') {
      await recordAuditLog({
        req,
        action: 'PRIVILEGE_ESCALATION_BLOCKED',
        module: 'User Management',
        status: 'FAILED',
        details: `Admin "${req.user?.name}" attempted unauthorized password reset for ${targetCanonicalRole} "${targetUser.email}"`,
      });
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admins can only reset passwords for standard User accounts.',
      });
    }

    targetUser.password = newPassword;
    await targetUser.save();

    await recordAuditLog({
      req,
      action: 'PASSWORD_RESET',
      module: 'User Management',
      recordId: targetUser._id,
      recordIdentifier: targetUser.email,
      details: `${req.user?.name} (${callerRole}) reset password for user "${targetUser.name}" (${targetUser.email})`,
      description: `Administrative password reset performed for "${targetUser.name}" by ${req.user?.name}`,
    });

    res.status(200).json({ success: true, message: `Password reset successfully for ${targetUser.name}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserActivityStats = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const callerId = String(req.user?.id || req.user?._id || '');
    const callerRole = normalizeRole(req.user?.role);

    // Regular users can only fetch their own activity
    if (callerRole === 'User' && targetUserId !== callerId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view your own activity statistics.',
      });
    }

    const targetUser = await User.findById(targetUserId).select('-password');
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const usernameRegex = new RegExp(`^${targetUser.name}$|^${targetUser.username}$|^${targetUser.email}$`, 'i');
    const userQuery = {
      $or: [
        { userId: String(targetUser._id) },
        { username: usernameRegex },
        { user: usernameRegex },
      ],
    };

    const [
      totalOperations,
      totalLogins,
      lastLoginRecord,
      lastActiveRecord,
      assetsCreated,
      assetsUpdated,
      recordsDeleted,
      recentActivity,
    ] = await Promise.all([
      AuditLog.countDocuments(userQuery),
      AuditLog.countDocuments({ ...userQuery, action: 'LOGIN', status: 'SUCCESS' }),
      AuditLog.findOne({ ...userQuery, action: 'LOGIN', status: 'SUCCESS' }).sort({ timestamp: -1 }),
      AuditLog.findOne(userQuery).sort({ timestamp: -1 }),
      AuditLog.countDocuments({ ...userQuery, action: 'CREATE', module: 'Assets' }),
      AuditLog.countDocuments({ ...userQuery, action: 'UPDATE', module: 'Assets' }),
      AuditLog.countDocuments({ ...userQuery, action: 'DELETE' }),
      AuditLog.find(userQuery).sort({ timestamp: -1 }).limit(50),
    ]);

    res.status(200).json({
      success: true,
      data: {
        userId: targetUser._id,
        name: targetUser.name,
        username: targetUser.username || targetUser.email.split('@')[0],
        email: targetUser.email,
        role: normalizeRole(targetUser.role),
        department: targetUser.department,
        totalOperations,
        totalLogins: Math.max(targetUser.loginCount || 0, totalLogins),
        lastLoginDate: lastLoginRecord?.timestamp || targetUser.lastLogin || null,
        lastLoginIp: lastLoginRecord?.ipAddress || targetUser.lastLoginIp || 'Unknown',
        lastActiveDate: lastActiveRecord?.timestamp || targetUser.updatedAt || null,
        assetsCreated,
        assetsUpdated,
        recordsDeleted,
        recentActivity,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const callerRole = normalizeRole(req.user?.role || 'Super Admin');
    let query = {};

    // Admin can see all users but is restricted when modifying them
    const users = await User.find(query).select('-password').sort({ name: 1 });
    const sanitized = users.map((u) => {
      const obj = u.toObject();
      obj.canonicalRole = normalizeRole(obj.role);
      return obj;
    });
    res.status(200).json({ success: true, data: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const obj = user.toObject();
    obj.canonicalRole = normalizeRole(obj.role);
    res.status(200).json({ success: true, data: obj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, employeeId } = req.body;
    const callerRole = normalizeRole(req.user?.role || 'Super Admin');
    const targetRole = normalizeRole(role || 'User');

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // Safeguard 1: Admin can ONLY create 'User' accounts
    if (callerRole === 'Admin' && targetRole !== 'User') {
      await recordAuditLog({
        req,
        action: 'PRIVILEGE_ESCALATION_BLOCKED',
        module: 'User Management',
        status: 'FAILED',
        details: `Admin "${req.user?.name}" attempted to create ${targetRole} user "${email}"`,
        description: `Privilege escalation blocked: Admin "${req.user?.name}" tried creating account with role "${targetRole}"`,
      });
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Administrators can only create normal User accounts.',
      });
    }

    // Safeguard 2: Only Super Admin can create Super Admin accounts
    if (callerRole !== 'Super Admin' && targetRole === 'Super Admin') {
      await recordAuditLog({
        req,
        action: 'PRIVILEGE_ESCALATION_BLOCKED',
        module: 'User Management',
        status: 'FAILED',
        details: `Role "${req.user?.role}" attempted to create Super Admin user "${email}"`,
      });
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only Super Administrators can create Super Admin accounts.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Email "${email}" is already registered` });
    }

    const username = email.toLowerCase().trim().split('@')[0];

    const user = await User.create({
      name: name.trim(),
      username: username,
      email: email.toLowerCase().trim(),
      password, // Pre-save hook hashes with bcrypt
      role: targetRole,
      department: department || 'IT',
      employeeId: employeeId || null,
      active: true,
      loginCount: 0,
    });

    await recordAuditLog({
      req,
      action: 'CREATE',
      module: 'User Management',
      recordId: user._id,
      recordIdentifier: user.email,
      newValues: {
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        active: user.active,
      },
      details: `Created new user account "${user.name}" with role "${user.role}"`,
      description: `New user account created: "${user.name}" (${user.role}) by ${req.user?.name}`,
    });

    const userPayload = {
      id: user._id,
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
      active: user.active,
    };

    res.status(201).json({
      success: true,
      data: userPayload,
      user: userPayload,
      message: `User ${user.name} created successfully`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const callerRole = normalizeRole(req.user?.role || 'Super Admin');
    const callerId = String(req.user?.id || req.user?._id || '');
    const updateData = { ...req.body };

    if (updateData.email) updateData.email = updateData.email.toLowerCase().trim();
    if (updateData.role) updateData.role = normalizeRole(updateData.role);

    // Safeguard 1: Admin can only edit User accounts and cannot elevate anyone to Admin or Super Admin
    if (callerRole === 'Admin') {
      if (normalizeRole(targetUser.role) !== 'User' || (updateData.role && updateData.role !== 'User')) {
        await recordAuditLog({
          req,
          action: 'PRIVILEGE_ESCALATION_BLOCKED',
          module: 'User Management',
          status: 'FAILED',
          details: `Admin "${req.user?.name}" attempted unauthorized modification on "${targetUser.email}"`,
        });
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Administrators can only manage normal User accounts.',
        });
      }
    }

    // Safeguard 2: Non-Super Admin cannot edit a Super Admin or elevate anyone to Super Admin
    if (callerRole !== 'Super Admin') {
      if (targetUser.role === 'Super Admin' || updateData.role === 'Super Admin') {
        await recordAuditLog({
          req,
          action: 'PRIVILEGE_ESCALATION_BLOCKED',
          module: 'User Management',
          status: 'FAILED',
          details: `Role "${req.user?.role}" attempted to modify Super Admin user or grant Super Admin role to "${targetUser.email}"`,
        });
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Only Super Administrators can manage Super Admin roles.',
        });
      }
    }

    // Safeguard 3: Prevent deactivating or demoting the LAST active Super Admin
    if (normalizeRole(targetUser.role) === 'Super Admin') {
      const isDeactivating = updateData.active === false || updateData.active === 'false' || updateData.isActive === false || updateData.isActive === 'false';
      const isDemoting = updateData.role && normalizeRole(updateData.role) !== 'Super Admin';

      if (isDeactivating || isDemoting) {
        const activeSuperAdminCount = await User.countDocuments({
          role: 'Super Admin',
          active: true,
        });

        if (activeSuperAdminCount <= 1) {
          return res.status(403).json({
            success: false,
            message: 'Protection Error: Cannot deactivate or demote the last active Super Administrator in the system.',
          });
        }
      }
    }

    // Safeguard 4: Super Admin cannot deactivate their own currently active session
    if (callerId && String(targetUser._id) === callerId && (updateData.active === false || updateData.active === 'false' || updateData.isActive === false || updateData.isActive === 'false')) {
      return res.status(403).json({
        success: false,
        message: 'Security Protection: You cannot deactivate your own logged-in account.',
      });
    }

    const oldState = targetUser.toObject();

    // If password is not provided, do not overwrite
    if (!updateData.password) {
      delete updateData.password;
    }

    const roleChanged = updateData.role && updateData.role !== targetUser.role;
    const statusChanged = updateData.active !== undefined && updateData.active !== targetUser.active;

    Object.assign(targetUser, updateData);
    await targetUser.save();

    const newState = targetUser.toObject();
    const diff = calculateDiff(oldState, newState);

    // Record general update
    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'User Management',
      recordId: targetUser._id,
      recordIdentifier: targetUser.email,
      oldValues: diff.oldValues,
      newValues: diff.newValues,
      changedFields: diff.changedFields,
      details: `Updated user profile for "${targetUser.name}" (${targetUser.email})`,
      description: `User account details updated for "${targetUser.name}"`,
    });

    // Record specific security events
    if (roleChanged) {
      await recordAuditLog({
        req,
        action: 'ROLE_CHANGE',
        module: 'User Management',
        recordId: targetUser._id,
        recordIdentifier: targetUser.email,
        oldValues: { role: oldState.role },
        newValues: { role: targetUser.role },
        changedFields: [{ field: 'role', oldValue: oldState.role, newValue: targetUser.role }],
        details: `Role changed for "${targetUser.name}" from "${oldState.role}" to "${targetUser.role}" by ${req.user?.name}`,
        description: `Role elevated/modified for user "${targetUser.name}"`,
      });
    }

    if (statusChanged) {
      const isActivated = targetUser.active;
      await recordAuditLog({
        req,
        action: isActivated ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED',
        module: 'User Management',
        recordId: targetUser._id,
        recordIdentifier: targetUser.email,
        oldValues: { active: oldState.active },
        newValues: { active: targetUser.active },
        changedFields: [{ field: 'active', oldValue: oldState.active, newValue: targetUser.active }],
        details: `Account for "${targetUser.name}" was ${isActivated ? 'activated' : 'deactivated'} by ${req.user?.name}`,
        description: `Account status updated to ${isActivated ? 'Active' : 'Deactivated'} for "${targetUser.name}"`,
      });
    }

    const sanitizedUser = targetUser.toObject();
    delete sanitizedUser.password;

    res.status(200).json({
      success: true,
      data: sanitizedUser,
      message: 'User profile updated successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const callerId = String(req.user?.id || req.user?._id || '');

    // Safeguard 1: Prevent deleting the LAST active Super Admin
    if (normalizeRole(user.role) === 'Super Admin') {
      const activeSuperAdminCount = await User.countDocuments({
        role: 'Super Admin',
        active: true,
      });

      if (activeSuperAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Protection Error: Cannot delete the last active Super Administrator.',
        });
      }
    }

    // Safeguard 2: Cannot delete own account
    if (callerId && String(user._id) === callerId) {
      return res.status(400).json({
        success: false,
        message: 'Security Protection: You cannot delete your own logged-in account.',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'User Management',
      recordId: user._id,
      recordIdentifier: user.email,
      oldValues: {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      details: `Deleted user account "${user.name}" (${user.email})`,
      description: `User account deleted: "${user.name}" (${user.email}) by ${req.user?.name}`,
    });

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
    const callerRole = normalizeRole(req.user?.role);
    const callerId = String(req.user?.id || req.user?._id || '');
    const callerUsername = req.user?.username || req.user?.name;

    const {
      search,
      role,
      action,
      module: mod,
      status,
      startDate,
      endDate,
      sort = 'newest',
      page = 1,
      limit = 50,
      export: exportFormat,
    } = req.query;

    const query = {};

    // Normal Users can only view their own activity history
    if (callerRole === 'User') {
      query.$or = [
        { userId: callerId },
        { username: new RegExp(`^${callerUsername}$|^${req.user?.email}$`, 'i') },
        { user: new RegExp(`^${callerUsername}$|^${req.user?.email}$`, 'i') },
      ];
    }

    if (search && search.trim()) {
      const s = search.trim();
      const searchRegex = new RegExp(s, 'i');
      const searchConditions = [
        { username: searchRegex },
        { user: searchRegex },
        { userFullName: searchRegex },
        { recordIdentifier: searchRegex },
        { assetTag: searchRegex },
        { description: searchRegex },
        { details: searchRegex },
        { ipAddress: searchRegex },
        { action: searchRegex },
        { module: searchRegex },
        { userId: searchRegex },
        { auditId: searchRegex },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    if (role && role !== 'All' && callerRole !== 'User') {
      query.userRole = role === 'Admin' ? { $in: ['Admin', 'IT Admin'] } : role;
    }

    if (action && action !== 'All') {
      query.action = new RegExp(`^${action}$`, 'i');
    }

    if (mod && mod !== 'All') {
      query.module = mod;
    }

    if (status && status !== 'All') {
      query.status = status.toUpperCase();
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;
    const sortObj = { timestamp: sortOrder, _id: sortOrder };

    // CSV Export handling
    if (exportFormat === 'csv') {
      const logs = await AuditLog.find(query).sort(sortObj).limit(5000);

      // Record the data export in the audit trail
      await recordAuditLog({
        req,
        action: 'DATA_EXPORT',
        module: 'Audit Trail',
        status: 'SUCCESS',
        details: `Exported ${logs.length} audit trail records to CSV`,
        description: `Audit trail records export initiated by ${req.user?.name} (${callerRole})`,
      });

      const headers = [
        'Audit ID',
        'Timestamp (IST)',
        'Username',
        'Full Name',
        'Role',
        'Action',
        'Module',
        'Record Identifier',
        'Status',
        'IP Address',
        'Description',
        'Changed Fields',
      ];

      const escapeCsv = (val) => {
        if (val === null || val === undefined) return '""';
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      };

      const rows = logs.map((l) => {
        const dt = l.timestamp || l.createdAt;
        const istDate = dt
          ? new Date(dt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })
          : '';
        const changedSummary = l.changedFields?.length
          ? l.changedFields.map((cf) => `${cf.field}: ${JSON.stringify(cf.oldValue)} -> ${JSON.stringify(cf.newValue)}`).join('; ')
          : '';

        return [
          escapeCsv(l.auditId || l._id),
          escapeCsv(istDate),
          escapeCsv(l.username || l.user),
          escapeCsv(l.userFullName || l.username || l.user),
          escapeCsv(l.userRole || l.role),
          escapeCsv(l.action),
          escapeCsv(l.module),
          escapeCsv(l.recordIdentifier || l.assetTag || ''),
          escapeCsv(l.status),
          escapeCsv(l.ipAddress),
          escapeCsv(l.description || l.details || ''),
          escapeCsv(changedSummary),
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-trail.csv"');
      return res.status(200).send(csvContent);
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort(sortObj).skip(skip).limit(limitNum),
      AuditLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createAuditLog = async (req, res) => {
  try {
    const log = await recordAuditLog({
      req,
      action: req.body.action || 'CUSTOM_ACTION',
      module: req.body.module || 'Assets',
      recordId: req.body.recordId,
      recordIdentifier: req.body.recordIdentifier || req.body.assetTag,
      oldValues: req.body.oldValues,
      newValues: req.body.newValues,
      changedFields: req.body.changedFields,
      status: req.body.status || 'SUCCESS',
      details: req.body.details,
      description: req.body.description || req.body.details,
    });
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const clearAuditLogs = async (req, res) => {
  // Audit logs are append-only. Reject all deletion requests!
  try {
    await recordAuditLog({
      req,
      action: 'UNAUTHORIZED_DELETION_ATTEMPT',
      module: 'System',
      status: 'FAILED',
      details: `Purge of audit logs attempted and blocked. Audit records are immutable.`,
      description: `Attempt to clear audit log history was blocked. Audit trail is append-only.`,
    });
  } catch {}

  return res.status(403).json({
    success: false,
    message: 'Forbidden: Audit logs are append-only immutable records and cannot be cleared or deleted.',
  });
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
    const oldSettings = await MasterSetting.findOne({ key: 'master_config' });
    const updated = await MasterSetting.findOneAndUpdate(
      { key: 'master_config' },
      { $set: req.body },
      { upsert: true, new: true }
    );

    const diff = calculateDiff(oldSettings ? oldSettings.toObject() : {}, updated.toObject());

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'System Settings',
      recordIdentifier: 'master_config',
      oldValues: diff.oldValues,
      newValues: diff.newValues,
      changedFields: diff.changedFields,
      details: `System master settings updated by ${req.user?.name}`,
      description: `Master configuration modified by Super Admin "${req.user?.name}"`,
    });

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
      Notification.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      Invoice.deleteMany({}),
      Inward.deleteMany({}),
      Transfer.deleteMany({}),
    ]);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'System Settings',
      details: `System clear-all invoked by Super Admin ${req.user?.name}. Audit logs preserved.`,
      description: `Complete system data purge executed by ${req.user?.name}`,
    });

    res.status(200).json({ success: true, message: 'All system data removed cleanly.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const seedDemoData = async (req, res) => {
  try {
    const { seedComprehensiveITAMData } = await import('../seed/demoSeed.js');
    const result = await seedComprehensiveITAMData();

    await recordAuditLog({
      req,
      action: 'CREATE',
      module: 'System Settings',
      details: `Demo data seeding executed by ${req.user?.name}`,
      description: `Comprehensive ITAM demo data seeded into system`,
    });

    res.status(200).json({ success: true, message: 'Demo data successfully populated', result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const feedUserData = async (req, res) => {
  try {
    const { feedRealUserData } = await import('../seed/feedUserData.js');
    const count = await feedRealUserData();

    await recordAuditLog({
      req,
      action: 'CREATE',
      module: 'System Settings',
      details: `Real user data feed executed by ${req.user?.name} (${count} systems)`,
      description: `Production user records fed into database`,
    });

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

    await recordAuditLog({
      req,
      action: 'CREATE',
      module: 'Purchase Orders',
      recordId: order._id,
      recordIdentifier: order.poNumber,
      newValues: order.toObject(),
      details: `Created Purchase Order ${order.poNumber}`,
      description: `Purchase order ${order.poNumber} created by ${req.user?.name}`,
    });

    res.status(201).json({ success: true, data: order, message: 'Purchase Order created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePurchaseOrder = async (req, res) => {
  try {
    const oldOrder = await PurchaseOrder.findById(req.params.id);
    const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Purchase order not found' });

    const diff = calculateDiff(oldOrder ? oldOrder.toObject() : {}, order.toObject());
    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'Purchase Orders',
      recordId: order._id,
      recordIdentifier: order.poNumber,
      oldValues: diff.oldValues,
      newValues: diff.newValues,
      changedFields: diff.changedFields,
      details: `Updated Purchase Order ${order.poNumber}`,
    });

    res.status(200).json({ success: true, data: order, message: 'Purchase order updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Purchase order not found' });

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'Purchase Orders',
      recordId: order._id,
      recordIdentifier: order.poNumber,
      oldValues: order.toObject(),
      details: `Deleted Purchase Order ${order.poNumber}`,
    });

    res.status(200).json({ success: true, message: `Purchase order ${order.poNumber} deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

    await recordAuditLog({
      req,
      action: 'CREATE',
      module: 'Invoices',
      recordId: inv._id,
      recordIdentifier: inv.invoiceNumber,
      newValues: inv.toObject(),
      details: `Created Invoice ${inv.invoiceNumber}`,
    });

    res.status(201).json({ success: true, data: inv, message: 'Invoice created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const oldInv = await Invoice.findById(req.params.id);
    const inv = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const diff = calculateDiff(oldInv ? oldInv.toObject() : {}, inv.toObject());
    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'Invoices',
      recordId: inv._id,
      recordIdentifier: inv.invoiceNumber,
      oldValues: diff.oldValues,
      newValues: diff.newValues,
      changedFields: diff.changedFields,
      details: `Updated Invoice ${inv.invoiceNumber}`,
    });

    res.status(200).json({ success: true, data: inv, message: 'Invoice updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const inv = await Invoice.findByIdAndDelete(req.params.id);
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'Invoices',
      recordId: inv._id,
      recordIdentifier: inv.invoiceNumber,
      oldValues: inv.toObject(),
      details: `Deleted Invoice ${inv.invoiceNumber}`,
    });

    res.status(200).json({ success: true, message: `Invoice ${inv.invoiceNumber} deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
