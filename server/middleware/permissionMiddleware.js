import { RolePermission, DEFAULT_ROLE_PERMISSIONS, SYSTEM_MODULES, PERMISSION_ACTIONS } from '../models/RolePermission.js';
import { recordAuditLog } from '../utils/auditService.js';
import { normalizeRole } from './auth.js';

// In-memory cache for role permissions to minimize DB round-trips
let rolePermissionsCache = null;
let lastCacheUpdate = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export const getCachedRolePermissions = async () => {
  const now = Date.now();
  if (rolePermissionsCache && now - lastCacheUpdate < CACHE_TTL_MS) {
    return rolePermissionsCache;
  }

  try {
    const rolesFromDb = await RolePermission.find();
    const map = { ...DEFAULT_ROLE_PERMISSIONS };
    rolesFromDb.forEach((doc) => {
      if (doc.role && doc.permissions) {
        map[doc.role] = typeof doc.permissions.toJSON === 'function' ? doc.permissions.toJSON() : doc.permissions;
      }
    });
    rolePermissionsCache = map;
    lastCacheUpdate = now;
    return rolePermissionsCache;
  } catch (err) {
    console.warn('[Permissions] Failed to load role permissions from DB, using defaults:', err.message);
    return DEFAULT_ROLE_PERMISSIONS;
  }
};

export const invalidatePermissionCache = () => {
  rolePermissionsCache = null;
  lastCacheUpdate = 0;
};

/**
 * Resolve effective permissions for a user (combining role defaults and user-specific overrides)
 */
export const resolveUserPermissions = async (user) => {
  if (!user) return {};
  const canonicalRole = normalizeRole(user.role);

  if (canonicalRole === 'Super Admin') {
    return SYSTEM_MODULES.reduce((acc, mod) => {
      acc[mod] = [...PERMISSION_ACTIONS];
      return acc;
    }, {});
  }

  const allRolePermissions = await getCachedRolePermissions();
  const roleDefaults = allRolePermissions[canonicalRole] || DEFAULT_ROLE_PERMISSIONS[canonicalRole] || {};

  // Clone role defaults
  const resolved = {};
  SYSTEM_MODULES.forEach((mod) => {
    resolved[mod] = roleDefaults[mod] ? [...roleDefaults[mod]] : [];
  });

  // Apply user-level permission overrides if present
  let overrides = user.permissions;
  if (overrides) {
    if (typeof overrides.toJSON === 'function') overrides = overrides.toJSON();
    if (overrides instanceof Map) {
      overrides.forEach((actions, mod) => {
        if (Array.isArray(actions)) resolved[mod] = [...actions];
      });
    } else if (typeof overrides === 'object') {
      Object.entries(overrides).forEach(([mod, actions]) => {
        if (Array.isArray(actions)) resolved[mod] = [...actions];
      });
    }
  }

  return resolved;
};

/**
 * Check permission middleware
 * Usage: checkPermission('Employees', 'CREATE') or checkPermission('Asset Master', 'UPDATE')
 */
export const checkPermission = (moduleName, requiredAction) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before verifying permissions.',
      });
    }

    if (req.user.active === false) {
      return res.status(403).json({
        success: false,
        message: 'User account has been deactivated.',
      });
    }

    const canonicalRole = normalizeRole(req.user.role);

    // Super Admin has unconstrained ownership
    if (canonicalRole === 'Super Admin') {
      return next();
    }

    try {
      const userPermissions = await resolveUserPermissions(req.user);
      const modulePerms = userPermissions[moduleName] || [];
      const hasAction =
        modulePerms.includes(requiredAction) ||
        modulePerms.includes('MANAGE'); // MANAGE implies all action privileges for that module

      if (!hasAction) {
        // Record unauthorized access attempt in Audit Trail
        await recordAuditLog({
          req,
          action: 'UNAUTHORIZED_ACCESS',
          module: moduleName,
          status: 'FAILED',
          details: `User "${req.user.name}" (${canonicalRole}) denied access for [${requiredAction}] on [${moduleName}]`,
          description: `Permission Denied: User "${req.user.name}" (${canonicalRole}) attempted unauthorized action "${requiredAction}" on module "${moduleName}"`,
        });

        return res.status(403).json({
          success: false,
          message: `Forbidden: Insufficient privileges. Required action "${requiredAction}" on module "${moduleName}".`,
        });
      }

      next();
    } catch (err) {
      console.error('[Permission Middleware Error]', err);
      return res.status(500).json({
        success: false,
        message: 'Error evaluating access permissions.',
      });
    }
  };
};

export default {
  checkPermission,
  resolveUserPermissions,
  getCachedRolePermissions,
  invalidatePermissionCache,
};
