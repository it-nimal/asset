import { RolePermission, DEFAULT_ROLE_PERMISSIONS, SYSTEM_MODULES, PERMISSION_ACTIONS } from '../models/RolePermission.js';
import { User } from '../models/User.js';
import { recordAuditLog, calculateDiff } from '../utils/auditService.js';
import {
  getCachedRolePermissions,
  invalidatePermissionCache,
  resolveUserPermissions,
} from '../middleware/permissionMiddleware.js';
import { normalizeRole } from '../middleware/auth.js';

/**
 * @desc Get global Role-Permission Matrix
 * @route GET /api/permissions/matrix
 * @access Super Admin
 */
export const getRolePermissionMatrix = async (req, res) => {
  try {
    const permissions = await getCachedRolePermissions();
    res.status(200).json({
      success: true,
      matrix: permissions,
      modules: SYSTEM_MODULES,
      actions: PERMISSION_ACTIONS,
      data: {
        modules: SYSTEM_MODULES,
        actions: PERMISSION_ACTIONS,
        matrix: permissions,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Update Role-Permission Matrix
 * @route PUT /api/permissions/matrix
 * @access Super Admin
 */
export const updateRolePermissionMatrix = async (req, res) => {
  try {
    const { role, permissions } = req.body;
    const normalizedRole = normalizeRole(role);

    if (normalizedRole === 'Super Admin') {
      return res.status(400).json({
        success: false,
        message: 'Super Admin permissions are complete and immutable.',
      });
    }

    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid permissions payload.',
      });
    }

    let existingDoc = await RolePermission.findOne({ role: normalizedRole });
    const oldPermissions = existingDoc?.permissions || DEFAULT_ROLE_PERMISSIONS[normalizedRole];

    if (!existingDoc) {
      existingDoc = new RolePermission({
        role: normalizedRole,
        permissions: permissions,
        updatedBy: req.user?.name || 'Super Admin',
      });
    } else {
      existingDoc.permissions = permissions;
      existingDoc.updatedBy = req.user?.name || 'Super Admin';
    }

    await existingDoc.save();
    invalidatePermissionCache();

    const diff = calculateDiff(oldPermissions, permissions);

    await recordAuditLog({
      req,
      action: 'PERMISSION_CHANGE',
      module: 'System Settings',
      recordIdentifier: normalizedRole,
      oldValues: diff.oldValues,
      newValues: diff.newValues,
      details: `Super Admin "${req.user?.name}" updated role permissions for role "${normalizedRole}"`,
      description: `Role permission matrix updated for "${normalizedRole}"`,
    });

    res.status(200).json({
      success: true,
      message: `Permissions updated for role ${normalizedRole}`,
      data: existingDoc,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Get User Permission Overrides & Effective Permissions
 * @route GET /api/auth/users/:id/permissions
 * @access Admin / Super Admin (or User for self)
 */
export const getUserPermissionsHandler = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const callerId = String(req.user?.id || req.user?._id || '');
    const callerRole = normalizeRole(req.user?.role);

    // Normal users can only fetch their own permissions
    if (callerRole === 'User' && targetUserId !== callerId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view your own permissions.',
      });
    }

    const user = await User.findById(targetUserId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const effective = await resolveUserPermissions(user);

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        role: normalizeRole(user.role),
        overrides: user.permissions || {},
        effective: effective,
        modules: SYSTEM_MODULES,
        actions: PERMISSION_ACTIONS,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc Set User Permission Overrides
 * @route PUT /api/auth/users/:id/permissions
 * @access Super Admin
 */
export const updateUserPermissionsHandler = async (req, res) => {
  try {
    const { permissions } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldOverrides = user.permissions ? (typeof user.permissions.toJSON === 'function' ? user.permissions.toJSON() : user.permissions) : {};
    user.permissions = permissions || {};
    await user.save();

    const diff = calculateDiff(oldOverrides, permissions || {});

    await recordAuditLog({
      req,
      action: 'PERMISSION_CHANGE',
      module: 'User Management',
      recordId: user._id,
      recordIdentifier: user.email,
      oldValues: diff.oldValues,
      newValues: diff.newValues,
      details: `Super Admin "${req.user?.name}" updated custom permission overrides for user "${user.name}" (${user.email})`,
      description: `Permission overrides updated for user "${user.name}"`,
    });

    const effective = await resolveUserPermissions(user);

    res.status(200).json({
      success: true,
      message: `Permission overrides updated for ${user.name}`,
      data: {
        userId: user._id,
        overrides: user.permissions,
        effective: effective,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
