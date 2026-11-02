import crypto from 'crypto';
import { AuditLog } from '../models/AuditLog.js';
import { getClientIp } from './clientIp.js';

// Sensitive fields to never store in audit logs
const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'jwt',
  'vncPassword',
  'windowsKey',
  'officeKey',
  'loginPassword',
  'secret',
  'authorization',
  'creditCard',
  'apiKey',
]);

// Internal metadata fields to ignore during field-level diff calculation
const IGNORE_FIELDS = new Set(['_id', '__v', 'createdAt', 'updatedAt', 'sn']);

/**
 * Clean sensitive values from an object
 */
export const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;
  if (data instanceof Date) return data;

  const raw = typeof data.toObject === 'function' ? data.toObject() : { ...data };
  const sanitized = {};

  for (const [key, val] of Object.entries(raw)) {
    if (SENSITIVE_FIELDS.has(key)) {
      continue; // Strip sensitive fields entirely
    }
    if (IGNORE_FIELDS.has(key)) {
      continue;
    }
    if (val !== undefined) {
      sanitized[key] = val;
    }
  }

  return sanitized;
};

/**
 * Calculate field-level differences between before and after document states
 * Returns { oldValues, newValues, changedFields }
 */
export const calculateDiff = (before, after) => {
  const cleanBefore = sanitizeData(before) || {};
  const cleanAfter = sanitizeData(after) || {};

  const oldValues = {};
  const newValues = {};
  const changedFields = [];

  const allKeys = new Set([...Object.keys(cleanBefore), ...Object.keys(cleanAfter)]);

  for (const key of allKeys) {
    const valA = cleanBefore[key];
    const valB = cleanAfter[key];

    // Normalize comparison for dates and objects
    const strA = valA instanceof Date ? valA.toISOString() : JSON.stringify(valA);
    const strB = valB instanceof Date ? valB.toISOString() : JSON.stringify(valB);

    if (strA !== strB) {
      if (valA !== undefined) oldValues[key] = valA;
      if (valB !== undefined) newValues[key] = valB;
      changedFields.push({
        field: key,
        oldValue: valA !== undefined ? valA : null,
        newValue: valB !== undefined ? valB : null,
      });
    }
  }

  return {
    oldValues: Object.keys(oldValues).length > 0 ? oldValues : null,
    newValues: Object.keys(newValues).length > 0 ? newValues : null,
    changedFields: changedFields.length > 0 ? changedFields : [],
  };
};

/**
 * Centralized Audit Logging Service
 * Records audit logs with authentic server-clock UTC timestamp, originating IP, and RBAC user context
 */
export const recordAuditLog = async ({
  req = null,
  action,
  module = 'Assets',
  recordId = null,
  recordIdentifier = null,
  oldValues = null,
  newValues = null,
  changedFields = null,
  status = 'SUCCESS',
  details = null,
  description = null,
  errorDetails = null,
  userOverride = null,
  session = null,
  correlationId = null,
}) => {
  try {
    // 1. Resolve Actor identity from trusted server-side authenticated context
    let userId = null;
    let username = 'System';
    let userFullName = 'System';
    let userRole = 'Admin';

    if (userOverride) {
      userId = userOverride.id || userOverride._id || null;
      username = userOverride.username || userOverride.email?.split('@')[0] || userOverride.name || 'System';
      userFullName = userOverride.name || userOverride.fullName || username;
      userRole = userOverride.role || 'Admin';
    } else if (req && req.user) {
      userId = req.user.id || req.user._id || null;
      username = req.user.username || req.user.email?.split('@')[0] || req.user.name || 'Authenticated User';
      userFullName = req.user.name || req.user.fullName || username;
      userRole = req.user.role || 'Admin';
    }

    // 2. Resolve client IP address (strictly server-side)
    const ipAddress = getClientIp(req);

    // 3. User Agent
    const userAgent = req?.headers ? req.headers['user-agent'] || 'Unknown' : 'Server Internal';

    // 4. API Endpoint and HTTP Method
    const apiEndpoint = req ? req.originalUrl || req.baseUrl || req.url || 'Internal API' : 'Internal Service';
    const httpMethod = req ? req.method || 'INTERNAL' : 'INTERNAL';

    // 5. Correlation ID
    const activeCorrelationId =
      correlationId ||
      req?.headers?.['x-correlation-id'] ||
      req?.id ||
      `REQ-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    // 6. Process field diff if raw objects were passed
    let finalOldValues = oldValues;
    let finalNewValues = newValues;
    let finalChangedFields = changedFields || [];

    if (oldValues && newValues && !oldValues.__isCalculatedDiff) {
      const diff = calculateDiff(oldValues, newValues);
      finalOldValues = diff.oldValues;
      finalNewValues = diff.newValues;
      if (!finalChangedFields.length && diff.changedFields) {
        finalChangedFields = diff.changedFields;
      }
    } else {
      if (finalOldValues) finalOldValues = sanitizeData(finalOldValues);
      if (finalNewValues) finalNewValues = sanitizeData(finalNewValues);
    }

    // 7. Server UTC Timestamp
    const serverTimestamp = new Date();

    // 8. Description & backward compatibility details
    const actionDesc =
      description ||
      details ||
      `${action} on ${module}${recordIdentifier ? ` (${recordIdentifier})` : ''}`;

    // 9. Construct log document
    const logDoc = {
      auditId: `AUD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      userId: userId ? String(userId) : undefined,
      username: username,
      userFullName: userFullName,
      userRole: userRole,
      role: userRole,
      action: action,
      module: module,
      apiEndpoint: apiEndpoint,
      httpMethod: httpMethod,
      recordId: recordId ? String(recordId) : undefined,
      recordIdentifier: recordIdentifier ? String(recordIdentifier) : undefined,
      description: actionDesc,
      details: actionDesc,
      oldValues: finalOldValues,
      newValues: finalNewValues,
      changedFields: finalChangedFields,
      ipAddress: ipAddress,
      userAgent: userAgent,
      timestamp: serverTimestamp,
      status: status,
      errorDetails: errorDetails ? String(errorDetails) : undefined,
      correlationId: activeCorrelationId,
      user: username,
      assetTag: recordIdentifier,
    };

    const options = session ? { session } : {};
    const createdLog = await AuditLog.create([logDoc], options);
    return createdLog[0] || createdLog;
  } catch (err) {
    console.error('[AuditService Error] Failed to persist audit log entry:', err.message, {
      action,
      module,
      recordIdentifier,
    });
    return null;
  }
};

export default {
  recordAuditLog,
  calculateDiff,
  sanitizeData,
};
