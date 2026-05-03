import { Request } from 'express';

/**
 * Extract real client IP from request.
 * Handles proxy/load balancer scenarios via X-Forwarded-For and X-Real-IP.
 *
 * Priority:
 * 1. X-Forwarded-For (first IP in chain — the original client)
 * 2. X-Real-IP
 * 3. req.ip / req.socket.remoteAddress
 */
export function extractClientIp(request: Request): string {
  const xForwardedFor = request.headers['x-forwarded-for'];
  if (xForwardedFor) {
    const forwarded = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor;
    // X-Forwarded-For can be comma-separated: client, proxy1, proxy2
    const clientIp = forwarded.split(',')[0].trim();
    return normalizeIp(clientIp);
  }

  const xRealIp = request.headers['x-real-ip'];
  if (xRealIp) {
    const realIp = Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;
    return normalizeIp(realIp.trim());
  }

  return normalizeIp(request.ip || request.socket?.remoteAddress || '0.0.0.0');
}

/**
 * Normalize IPv6-mapped IPv4 addresses.
 * e.g., "::ffff:192.168.1.1" → "192.168.1.1"
 */
function normalizeIp(ip: string): string {
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  return ip;
}

/**
 * Parse an IPv4 address into a 32-bit number.
 */
function ipToNumber(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let num = 0;
  for (const part of parts) {
    const octet = parseInt(part, 10);
    if (isNaN(octet) || octet < 0 || octet > 255) return null;
    num = (num << 8) | octet;
  }
  return num >>> 0; // unsigned
}

/**
 * Check if clientIp falls within a CIDR range (e.g. "192.168.1.0/24").
 */
function matchesCidr(clientIp: string, cidr: string): boolean {
  const [rangeIp, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return false;

  const clientNum = ipToNumber(clientIp);
  const rangeNum = ipToNumber(rangeIp);
  if (clientNum === null || rangeNum === null) return false;

  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return (clientNum & mask) === (rangeNum & mask);
}

/**
 * Check if an IP matches any in a list of allowed IPs.
 * Supports both exact match and CIDR notation (e.g., "192.168.1.0/24").
 */
export function isIpAllowed(clientIp: string, allowedIPs: string[]): boolean {
  if (!allowedIPs || allowedIPs.length === 0) {
    return false;
  }
  const normalized = normalizeIp(clientIp);
  return allowedIPs.some((allowed) => {
    const normalizedAllowed = normalizeIp(allowed.trim());
    if (normalizedAllowed.includes('/')) {
      return matchesCidr(normalized, normalizedAllowed);
    }
    return normalizedAllowed === normalized;
  });
}
