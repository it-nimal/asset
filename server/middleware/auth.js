import crypto from 'crypto';
import { User } from '../models/User.js';
import { getClientIp } from '../utils/clientIp.js';
import { recordAuditLog } from '../utils/auditService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'itam-enterprise-secret-key-2026-vitromed';

// Helper functions for base64url encoding/decoding
const base64UrlEncode = (str) => {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const base64UrlDecode = (str) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
};

export const normalizeRole = (role) => {
  const r = (role || '').trim();
  if (r === 'Super Admin') return 'Super Admin';
  if (r === 'Admin' || r === 'IT Admin') return 'Admin';
  return 'User';
};

/**
 * Generate a cryptographically signed HMAC-SHA256 JWT
 */
export const generateToken = (user) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const role = normalizeRole(user.role);
  const username = user.username || user.email?.split('@')[0] || user.name;
  const payload = {
    userId: String(user._id || user.id),
    name: user.name,
    username: username,
    email: user.email,
    role: role,
    department: user.department || 'IT',
    employeeId: user.employeeId || null,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days validity
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

/**
 * Verify HMAC-SHA256 JWT
 */
export const verifyJwtToken = (token) => {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
};

/**
 * Extract token from request headers, query, or cookies
 */
export const extractToken = (req) => {
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }
    return authHeader.trim();
  }
  if (req.query && req.query.token) {
    return String(req.query.token).trim();
  }
  return null;
};

/**
 * Authenticate Token Middleware
 * Enforces valid credentials, loads user from database, and attaches to req.user
 */
export const authenticateToken = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No authorization token provided.',
    });
  }

  try {
    let verifiedPayload = verifyJwtToken(token);
    let userId = verifiedPayload?.userId;

    // Backward-compatibility: support legacy format 'jwt-<userId>-<timestamp>' or 'jwt-admin-<timestamp>'
    if (!verifiedPayload && token.startsWith('jwt-')) {
      const parts = token.split('-');
      if (parts.length >= 2) {
        if (parts[1] === 'admin') {
          const adminUser = await User.findOne({ email: 'admin@vitromed.com' });
          if (adminUser) userId = adminUser._id;
        } else if (parts[1].length === 24) {
          userId = parts[1];
        }
      }
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authorization token.',
      });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account associated with this token no longer exists.',
      });
    }

    if (user.active === false) {
      return res.status(403).json({
        success: false,
        message: 'User account has been deactivated. Please contact your Super Administrator.',
      });
    }

    // Attach sanitized authenticated user context to request
    req.user = {
      _id: user._id,
      id: String(user._id),
      name: user.name,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      role: normalizeRole(user.role),
      rawRole: user.role,
      department: user.department,
      employeeId: user.employeeId,
      active: user.active,
      permissions: user.permissions || {},
      loginCount: user.loginCount || 0,
      lastLogin: user.lastLogin,
      lastLoginIp: user.lastLoginIp,
    };

    next();
  } catch (err) {
    console.error('[Auth Middleware] Verification error:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Failed to authenticate token.',
    });
  }
};

/**
 * Optional Authentication Middleware
 * Populates req.user if token is present, but doesn't block request if absent
 */
export const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    let verifiedPayload = verifyJwtToken(token);
    let userId = verifiedPayload?.userId;

    if (!verifiedPayload && token.startsWith('jwt-')) {
      const parts = token.split('-');
      if (parts[1] === 'admin') {
        const adminUser = await User.findOne({ email: 'admin@vitromed.com' });
        if (adminUser) userId = adminUser._id;
      } else if (parts[1]?.length === 24) {
        userId = parts[1];
      }
    }

    if (userId) {
      const user = await User.findById(userId).select('-password');
      if (user && user.active !== false) {
        req.user = {
          _id: user._id,
          id: String(user._id),
          name: user.name,
          username: user.username || user.email.split('@')[0],
          email: user.email,
          role: normalizeRole(user.role),
          rawRole: user.role,
          department: user.department,
          employeeId: user.employeeId,
          active: user.active,
          permissions: user.permissions || {},
        };
      }
    }
  } catch {
    // Continue unauthenticated
  }

  next();
};

/**
 * RBAC Role Authorization Middleware
 * Denies unauthorized API requests with HTTP 403 Forbidden
 * Logs rejected authorization attempts to the audit trail
 */
export const requireRole = (...allowedRoles) => {
  const normalizedAllowed = allowedRoles.map(normalizeRole);

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
    }

    if (req.user.active === false) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Access denied.',
      });
    }

    const userRole = normalizeRole(req.user.role);

    if (!normalizedAllowed.includes(userRole)) {
      // Record rejected authorization attempt in Audit Log
      try {
        await recordAuditLog({
          req,
          action: 'UNAUTHORIZED_ACCESS',
          module: 'Auth',
          status: 'FAILED',
          details: `Role "${req.user.role}" attempted forbidden access to ${req.method} ${req.originalUrl || req.baseUrl}. Required: [${allowedRoles.join(', ')}]`,
          description: `Access Denied: Role "${req.user.role}" attempted unauthorized access to ${req.method} ${req.originalUrl || req.baseUrl}. Required roles: [${allowedRoles.join(', ')}]`,
        });
      } catch (logErr) {
        console.warn('[Audit Warning] Failed to log access denial:', logErr.message);
      }

      return res.status(403).json({
        success: false,
        message: `Forbidden: Insufficient privileges. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

export const requireSuperAdmin = requireRole('Super Admin');
export const requireAdmin = requireRole('Super Admin', 'Admin');

export default {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireSuperAdmin,
  requireAdmin,
  generateToken,
  verifyJwtToken,
  normalizeRole,
};
