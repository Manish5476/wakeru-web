import { NextRequest } from 'next/server';
import { generateToken, ROLE_PERMISSIONS } from '@/server/auth';
import { jsonSuccess, jsonError } from '@/server/response';
import { UserRole } from '@/server/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();

    if (!email) {
      return jsonError('VALIDATION_ERROR', 'Email is required', 400);
    }

    let role: UserRole = 'TRAVELER';
    let name = 'Alex Traveler';
    let id = 'usr_me';

    if (email.includes('admin')) {
      role = 'ADMIN';
      name = 'Platform Administrator';
      id = 'admin_usr_01';
    } else if (email.includes('vendor') || email.includes('host') || email.includes('villa')) {
      role = 'VENDOR';
      name = 'Vikram Joshi (Goa Villas)';
      id = 'ven_anjuna_host';
    }

    const token = generateToken({ id, email, name, role });

    return jsonSuccess({
      token,
      user: {
        id,
        email,
        name,
        role,
        permissions: ROLE_PERMISSIONS[role],
      },
    });
  } catch (err: any) {
    return jsonError('INTERNAL_ERROR', err?.message || 'Login failed', 500);
  }
}
