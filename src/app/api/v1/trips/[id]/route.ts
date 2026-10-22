import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/server/auth';
import { jsonSuccess, jsonError } from '@/server/response';
import { db } from '@/server/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(req);
  if ('response' in auth) {
    return auth.response;
  }

  const { id } = await params;
  const trip = db.trips.find(t => t.id === id || t._id === id);

  if (!trip) {
    return jsonError('NOT_FOUND', `Trip with ID "${id}" was not found`, 404);
  }

  const travelPlan = db.travelPlans[id] || db.travelPlans['trip_goa_2026'];

  return jsonSuccess({ trip, travelPlan });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(req, ['TRAVELER', 'VENDOR', 'ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  const { id } = await params;
  const tripIndex = db.trips.findIndex(t => t.id === id || t._id === id);

  if (tripIndex === -1) {
    return jsonError('NOT_FOUND', `Trip with ID "${id}" was not found`, 404);
  }

  try {
    const updates = await req.json();
    db.trips[tripIndex] = {
      ...db.trips[tripIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // If updating travelPlan (itinerary or packing)
    if (updates.itinerary || updates.packingList) {
      db.travelPlans[id] = {
        ...(db.travelPlans[id] || {
          tripId: id,
          destination: db.trips[tripIndex].destination,
          dates: `${db.trips[tripIndex].startDate} - ${db.trips[tripIndex].endDate}`,
          itinerary: [],
          packingList: [],
        }),
        ...(updates.itinerary ? { itinerary: updates.itinerary } : {}),
        ...(updates.packingList ? { packingList: updates.packingList } : {}),
      };
    }

    return jsonSuccess({
      trip: db.trips[tripIndex],
      travelPlan: db.travelPlans[id],
    });
  } catch (err: any) {
    return jsonError('BAD_REQUEST', err?.message || 'Failed to update trip', 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = authenticateRequest(req, ['TRAVELER', 'ADMIN']);
  if ('response' in auth) {
    return auth.response;
  }

  const { id } = await params;
  const idx = db.trips.findIndex(t => t.id === id || t._id === id);

  if (idx === -1) {
    return jsonError('NOT_FOUND', `Trip with ID "${id}" was not found`, 404);
  }

  db.trips.splice(idx, 1);
  return jsonSuccess({ deleted: true, tripId: id });
}
