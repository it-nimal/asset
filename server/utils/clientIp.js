/**
 * Reliable Client IP Detection Utility
 * Handles IPv4, IPv6, IPv4-mapped IPv6, and trusted proxy scenarios securely.
 */

export const normalizeIp = (rawIp) => {
  if (!rawIp || typeof rawIp !== 'string') return 'unknown';

  let ip = rawIp.trim();

  // Strip port if present in IPv4 (e.g. "192.168.1.1:54321")
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(ip)) {
    ip = ip.split(':')[0];
  }

  // Handle IPv4-mapped IPv6 (::ffff:192.168.1.100 -> 192.168.1.100)
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // Normalize IPv6 localhost to IPv4 standard
  if (ip === '::1' || ip === '::') {
    return '127.0.0.1';
  }

  // Validate IPv4 or IPv6
  const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
  const isIPv6 = /^[0-9a-fA-F:]+$/.test(ip);

  if (isIPv4 || isIPv6) {
    return ip;
  }

  return 'unknown';
};

export const getClientIp = (req) => {
  if (!req) return 'unknown';

  // 1. Direct req.ip (populated by Express if trust proxy is set appropriately)
  if (req.ip) {
    const normalized = normalizeIp(req.ip);
    if (normalized !== 'unknown') return normalized;
  }

  // 2. Safely inspect X-Forwarded-For only if req.app is configured to trust proxy or in development
  const trustProxy = req.app?.get('trust proxy');
  if (trustProxy) {
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (typeof xForwardedFor === 'string' && xForwardedFor.length > 0) {
      // First IP in the list represents the originating client
      const firstIp = xForwardedFor.split(',')[0].trim();
      const normalized = normalizeIp(firstIp);
      if (normalized !== 'unknown') return normalized;
    }
  }

  // 3. Fallbacks from socket/connection
  const socketIp = req.socket?.remoteAddress || req.connection?.remoteAddress;
  if (socketIp) {
    const normalized = normalizeIp(socketIp);
    if (normalized !== 'unknown') return normalized;
  }

  return 'unknown';
};

export default getClientIp;
