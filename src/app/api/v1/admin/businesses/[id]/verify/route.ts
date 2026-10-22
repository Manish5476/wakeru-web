import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess, jsonError } from '@/server/response';
import { db } from '@/server/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(req, ['ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  const { id } = await params;
  const business = db.businesses.find(b => b.id === id);

  if (!business) {
    return jsonError('NOT_FOUND', `Business with ID "${id}" was not found`, 404);
  }

  try {
    const body = await req.json();
    const status = body.status === 'REJECTED' ? 'REJECTED' : 'VERIFIED';
    business.verificationStatus = status;

    // Audit log
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: status === 'VERIFIED' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
      actorId: auth.user.id,
      actorRole: auth.user.role,
      targetId: business.id,
      details: `Administrator ${auth.user.name} marked business "${business.businessName}" as ${status}`,
      createdAt: new Date().toISOString(),
    });

    return jsonSuccess({ business });
  } catch (err: any) {
    return jsonError('BAD_REQUEST', err?.message || 'Failed to update verification', 400);
  }
}
