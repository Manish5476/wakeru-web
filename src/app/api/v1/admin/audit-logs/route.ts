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
  const action = searchParams.get('action');

  let logs = db.auditLogs;
  if (action && action !== 'ALL') {
    logs = logs.filter(l => l.action === action);
  }

  return jsonSuccess({
    data: logs,
    logs,
    total: logs.length,
  });
}
