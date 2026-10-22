import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess } from '@/server/response';
import { db } from '@/server/db';

export async function GET(req: NextRequest) {
  const auth = authenticateRequest(req, ['ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let results = db.businesses;
  if (status && status !== 'ALL') {
    results = results.filter(b => b.verificationStatus === status);
  }

  return jsonSuccess({
    data: results,
    businesses: results,
    total: results.length,
    pagination: { page: 1, limit: 10, total: results.length },
  });
}
