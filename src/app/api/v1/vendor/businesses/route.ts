import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess, jsonError } from '@/server/response';
import { db } from '@/server/db';
import { Business } from '@/types/api';

export async function GET(req: NextRequest) {
  const auth = authenticateRequest(req, ['VENDOR', 'ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  // Vendors see their own businesses; Admins see all
  const businesses =
    auth.user.role === 'ADMIN'
      ? db.businesses
      : db.businesses.filter(b => b.vendorId === auth.user.id || b.vendorId === 'ven_anjuna_host');

  return jsonSuccess({
    data: businesses,
    businesses,
  });
}

export async function POST(req: NextRequest) {
  const auth = authenticateRequest(req, ['VENDOR', 'ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  try {
    const data = await req.json();
    const newId = `biz_${Date.now()}`;

    const newBiz: Business = {
      id: newId,
      vendorId: auth.user.id,
      businessName: data.businessName || 'New Retreat',
      category: data.category || 'STAY',
      description: data.description || '',
      address: data.address || '',
      city: data.city || 'Goa',
      country: data.country || 'India',
      latitude: data.latitude ? Number(data.latitude) : 15.5807,
      longitude: data.longitude ? Number(data.longitude) : 73.7433,
      googleMapsUrl: data.googleMapsUrl,
      phone: data.phone || '+91 98000 00000',
      whatsapp: data.whatsapp,
      status: 'active',
      verificationStatus: 'PENDING',
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      media: [],
      services: [],
      offers: [],
      reviews: [],
    };

    db.businesses.unshift(newBiz);

    // Audit log
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'BUSINESS_CREATE',
      actorId: auth.user.id,
      actorRole: auth.user.role,
      targetId: newId,
      details: `Vendor registered business "${newBiz.businessName}" (Status: PENDING)`,
      createdAt: new Date().toISOString(),
    });

    return jsonSuccess(newBiz, 201);
  } catch (err: any) {
    return jsonError('BAD_REQUEST', err?.message || 'Failed to create business', 400);
  }
}
