import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess } from '@/server/response';

export async function GET(req: NextRequest) {
  const auth = authenticateRequest(req, ['ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  const vendors = [
    {
      id: 'ven_anjuna_host',
      name: 'Vikram Joshi',
      email: 'vikram.goa.villas@wakeru.local',
      status: 'ACTIVE',
    },
    {
      id: 'ven_thalassa_mgr',
      name: 'Spiros Taverna Management',
      email: 'spiros.thalassa@wakeru.local',
      status: 'ACTIVE',
    },
  ];

  return jsonSuccess({
    data: vendors,
    vendors,
  });
}
