import { AuthTokenPayload, AuthUser, UserRole } from './types';
import { jsonError } from './response';

const TOKEN_SECRET = process.env.AUTH_SECRET || 'wakeru_jwt_super_secret_production_key_2026';
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  TRAVELER: [
    'trips:read',
    'trips:create',
    'trips:update',
    'expenses:read',
    'expenses:create',
    'expenses:delete',
    'settlements:calculate',
    'bookings:read',
    'bookings:create',
    'discover:read',
  ],
  VENDOR: [
    'trips:read',
    'vendor:read',
    'vendor:write',
    'vendor:manage_businesses',
    'vendor:manage_bookings',
    'vendor:manage_services',
    'vendor:analytics',
    'discover:read',
  ],
  ADMIN: [
    'trips:read',
    'vendor:read',
    'vendor:write',
    'admin:all',
    'admin:verify_business',
    'admin:audit_logs',
    'admin:demand_velocity',
    'admin:vendors_manage',
    'admin:campaigns_manage',
    'discover:read',
  ],
};

/**
 * Generate a token containing the user claims, expiration, and role permissions.
 */
export function generateToken(user: { id: string; email: string; name: string; role: UserRole }): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + TOKEN_TTL_SECONDS;
  const permissions = ROLE_PERMISSIONS[user.role] || [];

  const payload: AuthTokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions,
    iat,
    exp,
  };

  const jsonStr = JSON.stringify(payload);
  const base64 = Buffer.from(jsonStr, 'utf-8').toString('base64url');
  
  // Simple checksum signature
  const signature = Buffer.from(`${base64}.${TOKEN_SECRET}`).toString('base64url').slice(0, 32);
  return `${base64}.${signature}`;
}

/**
 * Verify and decode token.
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    if (!token) return null;

    // Handle demo / test tokens
    if (token.startsWith('demo_jwt_')) {
      const parts = token.split('_');
      const encoded = parts[parts.length - 1];
      let role: UserRole = 'TRAVELER';
      try {
        const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
        if (decoded.includes('admin')) role = 'ADMIN';
        else if (decoded.includes('vendor')) role = 'VENDOR';
      } catch {}

      return {
        id: 'usr_me',
        email: role === 'ADMIN' ? 'admin@wakeru.local' : role === 'VENDOR' ? 'vikram@anjunavilla.com' : 'alex@tripsplit.in',
        name: role === 'ADMIN' ? 'Admin Moderator' : role === 'VENDOR' ? 'Vikram Joshi' : 'Alex Traveler',
        role,
        permissions: ROLE_PERMISSIONS[role],
      };
    }

    const [base64, sig] = token.split('.');
    if (!base64 || !sig) return null;

    const expectedSig = Buffer.from(`${base64}.${TOKEN_SECRET}`).toString('base64url').slice(0, 32);
    if (sig !== expectedSig) return null;

    const jsonStr = Buffer.from(base64, 'base64url').toString('utf-8');
    const payload: AuthTokenPayload = JSON.parse(jsonStr);

    // Expiration check
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      permissions: payload.permissions || ROLE_PERMISSIONS[payload.role] || [],
    };
  } catch {
    return null;
  }
}

/**
 * Authentication and Role Guard for Next.js Route Handlers.
 */
export function authenticateRequest(
  request: Request,
  allowedRoles?: UserRole[]
): { user: AuthUser } | { response: Response } {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

  // Also check cookie if header not provided
  let token: string | null = null;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.slice(7).trim();
  }

  // If no token in authorization header, fallback for development/demo ease
  if (!token) {
    // If no token provided in demo mode, check if a role header is supplied (e.g. x-demo-role)
    const demoRole = (request.headers.get('x-demo-role') as UserRole) || 'TRAVELER';
    const fallbackUser: AuthUser = {
      id: 'usr_demo',
      email: `${demoRole.toLowerCase()}@wakeru.local`,
      name: demoRole === 'ADMIN' ? 'Platform Administrator' : demoRole === 'VENDOR' ? 'Partner Host' : 'Traveler Demo',
      role: demoRole,
      permissions: ROLE_PERMISSIONS[demoRole] || [],
    };

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(demoRole)) {
      return {
        response: jsonError(
          'FORBIDDEN',
          `Insufficient permissions. Requires one of: [${allowedRoles.join(', ')}]`,
          403,
          { requiredRoles: allowedRoles, currentRole: demoRole }
        ),
      };
    }

    return { user: fallbackUser };
  }

  const user = verifyToken(token);
  if (!user) {
    return {
      response: jsonError('UNAUTHORIZED', 'Invalid or expired authentication token. Please sign in again.', 401),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      response: jsonError(
        'FORBIDDEN',
        `Access denied. Role "${user.role}" does not have access to this resource. Requires: [${allowedRoles.join(', ')}]`,
        403,
        { requiredRoles: allowedRoles, userRole: user.role }
      ),
    };
  }

  return { user };
}
