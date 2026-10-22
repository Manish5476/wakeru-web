import { fetchClient } from './client';
import { ITrip, IStop, ITripMember, TripSummary } from '@/types/trip.types';
import { ITravelPlan } from '@/types/travelPlan.types';
import { INITIAL_TRIPS, INITIAL_TRAVEL_PLAN } from '@/lib/mockTripsData';

const STORAGE_KEY = 'tripsplit_web_trips';
const PLAN_STORAGE_PREFIX = 'tripsplit_web_plan_';

function getStoredTrips(): ITrip[] {
  if (typeof window === 'undefined') return INITIAL_TRIPS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_TRIPS;
}

function saveStoredTrips(trips: ITrip[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch {}
}

export const tripsApi = {
  getMyTrips: async (params?: any): Promise<{ trips: ITrip[]; stats: any }> => {
    try {
      const res = await fetchClient<{ trips: ITrip[]; stats: any }>('/trips', {
        params,
      });
      if (res && Array.isArray(res.trips) && res.trips.length > 0) {
        saveStoredTrips(res.trips);
        return res;
      }
    } catch {}

    const trips = getStoredTrips();
    return {
      trips,
      stats: {
        activeTripsCount: trips.filter(t => t.status === 'active').length,
        totalSpentBase: trips.reduce((s, t) => s + (t.spentBase || 0), 0),
        totalCountries: new Set(trips.map(t => t.country).filter(Boolean)).size,
        totalTravelers: new Set(
          trips.flatMap(t => t.members.map(m => m.userId)),
        ).size,
      },
    };
  },

  getTrip: async (tripId: string): Promise<{ trip: ITrip }> => {
    try {
      const res = await fetchClient<{ trip: ITrip }>(`/trips/${tripId}`);
      if (res?.trip) return res;
    } catch {}

    const trips = getStoredTrips();
    const found = trips.find(t => t._id === tripId || t.id === tripId);
    if (found) return { trip: found };
    throw new Error('Trip not found');
  },

  create: async (data: Partial<ITrip>): Promise<{ trip: ITrip }> => {
    try {
      const res = await fetchClient<{ trip: ITrip }>('/trips', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res?.trip) {
        const trips = getStoredTrips();
        saveStoredTrips([res.trip, ...trips]);
        return res;
      }
    } catch {}

    const newTrip: ITrip = {
      _id: `trip_${Date.now()}`,
      id: `trip_${Date.now()}`,
      title: data.title || 'Untitled Vacation',
      description: data.description || '',
      destination: data.destination || 'Selected Destination',
      country: data.country || 'IND',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date().toISOString().split('T')[0],
      currency: data.currency || 'INR',
      budget: data.budget || 50000,
      spentBase: 0,
      coverImage:
        data.coverImage ||
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
      emoji: data.emoji || '✈️',
      visibility: data.visibility || 'shared',
      status: 'active',
      ownerId: 'usr_me',
      members: [
        {
          id: 'mem_owner',
          userId: 'usr_me',
          name: 'You',
          role: 'owner',
          joinedAt: new Date().toISOString(),
        },
        ...(data.members || []),
      ],
      stops: data.stops || [],
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const trips = getStoredTrips();
    saveStoredTrips([newTrip, ...trips]);
    return { trip: newTrip };
  },

  updateTrip: async (tripId: string, data: Partial<ITrip>): Promise<{ trip: ITrip }> => {
    try {
      const res = await fetchClient<{ trip: ITrip }>(`/trips/${tripId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      if (res?.trip) return res;
    } catch {}

    const trips = getStoredTrips();
    const idx = trips.findIndex(t => t._id === tripId || t.id === tripId);
    if (idx !== -1) {
      trips[idx] = { ...trips[idx], ...data, updatedAt: new Date().toISOString() };
      saveStoredTrips(trips);
      return { trip: trips[idx] };
    }
    throw new Error('Trip not found');
  },

  addMember: async (tripId: string, member: Partial<ITripMember>): Promise<{ trip: ITrip }> => {
    try {
      const res = await fetchClient<{ trip: ITrip }>(`/trips/${tripId}/members`, {
        method: 'POST',
        body: JSON.stringify(member),
      });
      if (res?.trip) return res;
    } catch {}

    const trips = getStoredTrips();
    const trip = trips.find(t => t._id === tripId || t.id === tripId);
    if (trip) {
      const newMember: ITripMember = {
        id: `mem_${Date.now()}`,
        userId: member.userId || `usr_${Date.now()}`,
        name: member.name || 'Travel Companion',
        email: member.email,
        role: member.role || 'member',
        joinedAt: new Date().toISOString(),
        upiId: member.upiId,
      };
      trip.members.push(newMember);
      saveStoredTrips(trips);
      return { trip };
    }
    throw new Error('Trip not found');
  },

  getTravelPlan: async (tripId: string): Promise<{ plan: ITravelPlan }> => {
    try {
      const res = await fetchClient<{ plan: ITravelPlan }>(`/trips/${tripId}/plan`);
      if (res?.plan) return res;
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`${PLAN_STORAGE_PREFIX}${tripId}`);
        if (stored) return { plan: JSON.parse(stored) };
      } catch {}
    }

    const defaultPlan: ITravelPlan = {
      ...INITIAL_TRAVEL_PLAN,
      tripId,
    };
    return { plan: defaultPlan };
  },

  updateTravelPlan: async (tripId: string, plan: Partial<ITravelPlan>): Promise<{ plan: ITravelPlan }> => {
    try {
      const res = await fetchClient<{ plan: ITravelPlan }>(`/trips/${tripId}/plan`, {
        method: 'PATCH',
        body: JSON.stringify(plan),
      });
      if (res?.plan) return res;
    } catch {}

    const cur = (await tripsApi.getTravelPlan(tripId)).plan;
    const updated: ITravelPlan = {
      ...cur,
      ...plan,
      updatedAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${PLAN_STORAGE_PREFIX}${tripId}`, JSON.stringify(updated));
    }
    return { plan: updated };
  },

  getTripSummary: async (tripId: string): Promise<{ summary: TripSummary }> => {
    try {
      const res = await fetchClient<{ summary: TripSummary }>(`/trips/${tripId}/summary`);
      if (res?.summary) return res;
    } catch {}

    const trip = (await tripsApi.getTrip(tripId)).trip;
    return {
      summary: {
        tripId,
        totalSpent: trip.spentBase || 0,
        currency: trip.currency,
        budgetHealth: (trip.spentBase || 0) > (trip.budget || 0) ? 'EXCEEDED' : 'HEALTHY',
        budgetPercentage: trip.budget ? Math.min(100, Math.round(((trip.spentBase || 0) / trip.budget) * 100)) : 0,
        userBalance: 4200,
        memberCount: trip.members.length,
        expenseCount: 4,
      },
    };
  },
};
