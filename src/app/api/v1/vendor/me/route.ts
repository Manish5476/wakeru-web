import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess } from '@/server/response';

let vendorProfile = {
  id: 'ven_anjuna_host',
  name: 'Vikram Joshi',
  email: 'vikram.goa.villas@wakeru.local',
  phone: '+91 98230 44521',
  status: 'VERIFIED',
  businessCount: 2,
  payoutUpi: 'vikram.joshi@okhdfcbank',
};

export async function GET(req: NextRequest) {
  const auth = authenticateRequest(req, ['VENDOR', 'ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  return jsonSuccess(vendorProfile);
}

export async function PATCH(req: NextRequest) {
  const auth = authenticateRequest(req, ['VENDOR', 'ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  const body = await req.json();
  vendorProfile = { ...vendorProfile, ...body };
  return jsonSuccess(vendorProfile);
}
