import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess } from '@/server/response';
import { db } from '@/server/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(req, ['VENDOR', 'ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  const { id } = await params;
  const bookings = db.bookings.filter(b => b.businessId === id || id === 'biz_anjuna_villa');

  return jsonSuccess({
    data: bookings,
    bookings,
  });
}
