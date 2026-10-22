import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess } from '@/server/response';
import { db } from '@/server/db';

export async function GET(req: NextRequest) {
  // STRICT ADMIN ROLE CHECK
  const auth = authenticateRequest(req, ['ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  const kpis = {
    totalPartners: 48,
    activeVendors: 39,
    pendingVerifications: db.businesses.filter(b => b.verificationStatus === 'PENDING').length,
    totalBookingsMonth: db.bookings.length,
    gmvMinor: 142000000,
    platformTakeRatePct: 4.8,
    disputesOpen: 1,
  };

  return jsonSuccess({ kpis });
}
