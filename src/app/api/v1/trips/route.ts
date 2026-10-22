import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess, jsonError } from '@/server/response';
import { db } from '@/server/db';
import { ITrip } from '@/types/trip.types';

export async function GET(req: NextRequest) {
  const auth = authenticateRequest(req, ['TRAVELER', 'VENDOR', 'ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let trips = db.trips;
  if (status && status !== 'all') {
    trips = trips.filter(t => t.status === status);
  }

  const stats = {
    activeTripsCount: db.trips.filter(t => t.status === 'active').length,
    totalSpentBase: db.trips.reduce((s, t) => s + (t.spentBase || 0), 0),
    totalCountries: new Set(db.trips.map(t => t.country).filter(Boolean)).size,
    totalTravelers: new Set(db.trips.flatMap(t => t.members.map(m => m.userId))).size,
  };

  return jsonSuccess({ trips, stats }, 200, { userRole: auth.user.role });
}

export async function POST(req: NextRequest) {
  const auth = authenticateRequest(req, ['TRAVELER', 'VENDOR', 'ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  try {
    const data = await req.json();
    const newId = `trip_${Date.now()}`;

    const newTrip: ITrip = {
      _id: newId,
      id: newId,
      title: data.title || 'Untitled Vacation',
      description: data.description || '',
      destination: data.destination || 'Selected Destination',
      country: data.country || 'IND',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date().toISOString().split('T')[0],
      currency: data.currency || 'INR',
      budget: Number(data.budget) || 50000,
      spentBase: 0,
      coverImage:
        data.coverImage ||
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
      emoji: data.emoji || '✈️',
      visibility: data.visibility || 'shared',
      status: 'active',
      ownerId: auth.user.id,
      members: [
        {
          id: 'mem_owner',
          userId: auth.user.id,
          name: auth.user.name,
          role: 'owner',
          email: auth.user.email,
          joinedAt: new Date().toISOString(),
        },
      ],
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.trips.unshift(newTrip);

    // Audit log
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'TRIP_CREATE',
      actorId: auth.user.id,
      actorRole: auth.user.role,
      targetId: newId,
      details: `Created new group trip: ${newTrip.title}`,
      createdAt: new Date().toISOString(),
    });

    return jsonSuccess({ trip: newTrip }, 201);
  } catch (err: any) {
    return jsonError('BAD_REQUEST', err?.message || 'Invalid trip payload', 400);
  }
}
