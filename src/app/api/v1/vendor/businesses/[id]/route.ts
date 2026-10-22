import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess, jsonError } from '@/server/response';
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
  const business = db.businesses.find(b => b.id === id);

  if (!business) {
    return jsonError('NOT_FOUND', `Business with ID "${id}" was not found`, 404);
  }

  return jsonSuccess(business);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(req, ['VENDOR', 'ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  const { id } = await params;
  const idx = db.businesses.findIndex(b => b.id === id);

  if (idx === -1) {
    return jsonError('NOT_FOUND', `Business with ID "${id}" was not found`, 404);
  }

  try {
    const updates = await req.json();
    db.businesses[idx] = {
      ...db.businesses[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return jsonSuccess(db.businesses[idx]);
  } catch (err: any) {
    return jsonError('BAD_REQUEST', err?.message || 'Failed to update business', 400);
  }
}
