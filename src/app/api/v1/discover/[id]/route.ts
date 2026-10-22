import { NextRequest } from 'next/server';
import { jsonSuccess, jsonError } from '@/server/response';
import { db } from '@/server/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const business = db.businesses.find(b => b.id === id);

  if (!business) {
    return jsonError('NOT_FOUND', `Business with ID "${id}" was not found`, 404);
  }

  return jsonSuccess(business);
}
