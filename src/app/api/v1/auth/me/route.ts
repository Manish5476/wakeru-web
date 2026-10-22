import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess } from '@/server/response';

export async function GET(req: NextRequest) {
  const auth = authenticateRequest(req);
  if ('response' in auth) {
    return auth.response;
  }

  return jsonSuccess({
    user: auth.user,
  }, 200, { userRole: auth.user.role });
}
