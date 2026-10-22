import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess } from '@/server/response';
import { db } from '@/server/db';

export async function GET(req: NextRequest) {
  const auth = authenticateRequest(req, ['ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  return jsonSuccess({
    destinations: db.demandVelocity,
    metrics: {
      peakBookingWindow: '14 - 21 Days Ahead',
      averageGroupSize: '5.2 Travelers',
      topSearchedCategory: 'Private Villas & Group Stays',
      totalActiveQueries7d: 412900,
    },
  });
}
