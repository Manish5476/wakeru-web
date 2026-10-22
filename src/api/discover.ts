import { fetchClient } from './client';
import { Business, BusinessService, BusinessOffer, BusinessReview, BookingRequest, Reservation } from '../types/api';

const BOOKINGS_STORAGE_KEY = 'wakeru_web_bookings';
const SAVED_VENUES_KEY = 'wakeru_web_saved_venues';

export const MOCK_BUSINESSES: Business[] = [
  {
    id: 'biz_anjuna_villa',
    vendorId: 'ven_anjuna_host',
    businessName: 'Anjuna Beachfront Sunset Villa & Spa',
    category: 'STAY',
    description: 'Ultra-private 4-bedroom luxury coastal sanctuary with private infinity plunge pool, oceanview sunset deck, daily private chef, and direct access to Anjuna beach.',
    address: 'Plot 44, Anjuna Flea Market Rd',
    city: 'Goa',
    country: 'India',
    latitude: 15.5807,
    longitude: 73.7433,
    phone: '+91 98230 44521',
    whatsapp: '+919823044521',
    status: 'active',
    verificationStatus: 'VERIFIED',
    rating: 4.9,
    reviewCount: 38,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
    media: [
      {
        id: 'm_1',
        businessId: 'biz_anjuna_villa',
        url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1000&auto=format&fit=crop&q=80',
        provider: 'local',
        mediaType: 'cover',
        sortOrder: 1,
        moderationStatus: 'APPROVED',
        createdAt: '2026-01-10T10:00:00Z',
      },
    ],
    services: [
      {
        id: 'srv_villa_full',
        businessId: 'biz_anjuna_villa',
        serviceName: 'Full Private Ocean Villa (4 Suites)',
        serviceType: 'accommodation',
        description: 'Complete sanctuary for up to 8 guests. Infinity pool, ocean balcony, and daily breakfast.',
        basePriceMinor: 2400000,
        currency: 'INR',
        priceUnit: 'per night',
        isAvailable: true,
        maxCapacity: 8,
        imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80',
        facilities: ['Private Pool', 'Ocean View', 'Wi-Fi 5G', 'Private Chef', 'Air Conditioning'],
      },
      {
        id: 'srv_ocean_suite',
        businessId: 'biz_anjuna_villa',
        serviceName: 'Master Ocean Penthouse Suite',
        serviceType: 'accommodation',
        description: 'Top-floor romantic suite with panoramic sunset views, private jacuzzi, and king bed.',
        basePriceMinor: 950000,
        currency: 'INR',
        priceUnit: 'per night',
        isAvailable: true,
        maxCapacity: 2,
        facilities: ['Jacuzzi', 'Ocean View', 'Breakfast Included'],
      },
    ],
    reviews: [
      {
        id: 'rev_1',
        businessId: 'biz_anjuna_villa',
        travelerHash: 'usr_sarah_992',
        rating: 5,
        comment: 'Absolute paradise for our group vacation! The sunset from the pool deck was unforgettable, and Vikram made check-in effortless with the digital key.',
        provenance: 'VERIFIED_BOOKING',
        createdAt: '2026-10-02T14:00:00Z',
        vendorReply: 'Thank you Sarah! It was our pleasure hosting your group. Come back soon!',
      },
    ],
  },
  {
    id: 'biz_thalassa',
    vendorId: 'ven_thalassa_mgr',
    businessName: 'Thalassa Greek Taverna & Sunset Lounge',
    category: 'DINING',
    description: 'Iconic cliffside dining overlooking the Arabian Sea in Siolim. Authentic Aegean mezze, fresh caught red snapper, sunset cocktails, and live Greek fire dancing.',
    address: 'Vaddy, Siolim River Road',
    city: 'Goa',
    country: 'India',
    latitude: 15.6192,
    longitude: 73.7441,
    phone: '+91 98500 33529',
    whatsapp: '+919850033529',
    status: 'active',
    verificationStatus: 'VERIFIED',
    rating: 4.8,
    reviewCount: 142,
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
    media: [
      {
        id: 'm_2',
        businessId: 'biz_thalassa',
        url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1000&auto=format&fit=crop&q=80',
        provider: 'local',
        mediaType: 'cover',
        sortOrder: 1,
        moderationStatus: 'APPROVED',
        createdAt: '2026-01-12T10:00:00Z',
      },
    ],
    services: [
      {
        id: 'srv_sunset_table',
        businessId: 'biz_thalassa',
        serviceName: 'Cliffside Sunset Table (4–6 Guests)',
        serviceType: 'dining_reservation',
        description: 'Prime front-row cliffside seating with complimentary bottle of Greek rosé and chef platter.',
        basePriceMinor: 450000,
        currency: 'INR',
        priceUnit: 'cover deposit',
        isAvailable: true,
        maxCapacity: 6,
        facilities: ['Front-Row Sunset', 'Live Music', 'Vegetarian Options'],
      },
    ],
    reviews: [
      {
        id: 'rev_2',
        businessId: 'biz_thalassa',
        travelerHash: 'usr_rohan_112',
        rating: 5,
        comment: 'Best dinner of the entire trip. The grilled kingfish souvlaki and cocktails are out of this world.',
        provenance: 'VERIFIED_BOOKING',
        createdAt: '2026-10-16T20:00:00Z',
      },
    ],
  },
  {
    id: 'biz_scuba_goa',
    vendorId: 'ven_scuba_captain',
    businessName: 'Grand Island Scuba & Marine Expeditions',
    category: 'ACTIVITY',
    description: 'PADI certified dive masters, underwater photography, coral reef excursions, and private catamaran charters around Grand Island and Bat Island.',
    address: 'Bogmalo Jetty & Harbor',
    city: 'Goa',
    country: 'India',
    latitude: 15.3522,
    longitude: 73.8344,
    phone: '+91 98221 55670',
    whatsapp: '+919822155670',
    status: 'active',
    verificationStatus: 'VERIFIED',
    rating: 4.7,
    reviewCount: 64,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-10-21T10:00:00Z',
    media: [
      {
        id: 'm_3',
        businessId: 'biz_scuba_goa',
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1000&auto=format&fit=crop&q=80',
        provider: 'local',
        mediaType: 'cover',
        sortOrder: 1,
        moderationStatus: 'APPROVED',
        createdAt: '2026-02-01T10:00:00Z',
      },
    ],
    services: [
      {
        id: 'srv_scuba_cert',
        businessId: 'biz_scuba_goa',
        serviceName: 'Full Island Scuba Dive + HD GoPro Video',
        serviceType: 'tour_activity',
        description: 'Includes speedboat transfer, training session, 45-min dive, BBQ lunch on Monkey Beach, and 4K video clips.',
        basePriceMinor: 350000,
        currency: 'INR',
        priceUnit: 'per diver',
        isAvailable: true,
        maxCapacity: 12,
        facilities: ['Gear Included', 'GoPro Footage', 'Lunch Included', 'Certified Instructor'],
      },
    ],
  },
  {
    id: 'biz_gunpowder',
    vendorId: 'ven_gunpowder_host',
    businessName: 'Gunpowder Heritage Coastal Kitchen',
    category: 'DINING',
    description: 'Rustic heritage Portuguese courtyard cafe in Assagao serving authentic South Indian coastal fare: Kerala beef roast, Malabar parottas, pandi curry, and kokum cocktails.',
    address: 'Saunto Vaddo, Assagao',
    city: 'Goa',
    country: 'India',
    latitude: 15.5898,
    longitude: 73.7842,
    phone: '+91 832 226 8083',
    status: 'active',
    verificationStatus: 'VERIFIED',
    rating: 4.9,
    reviewCount: 96,
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
    media: [
      {
        id: 'm_4',
        businessId: 'biz_gunpowder',
        url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
        provider: 'local',
        mediaType: 'cover',
        sortOrder: 1,
        moderationStatus: 'APPROVED',
        createdAt: '2026-02-15T10:00:00Z',
      },
    ],
    services: [
      {
        id: 'srv_tasting_menu',
        businessId: 'biz_gunpowder',
        serviceName: 'Coastal Heritage 5-Course Group Feast',
        serviceType: 'dining_experience',
        description: 'Curated group banquet featuring Kerala roasts, appams, spicy curries, and tropical desserts.',
        basePriceMinor: 180000,
        currency: 'INR',
        priceUnit: 'per guest',
        isAvailable: true,
        maxCapacity: 10,
        facilities: ['Garden Seating', 'Pet Friendly', 'Cocktail Bar'],
      },
    ],
  },
  {
    id: 'biz_palolem_shack',
    vendorId: 'ven_palolem_cottage',
    businessName: 'Palolem Bay Wooden Eco-Cottages',
    category: 'STAY',
    description: 'Rustic oceanfront bamboo chalets nestled right on Palolem Beach sand with sea kayaking, dolphin cruise departures, and sunset bonfire BBQs.',
    address: 'Ourem Road, South End, Palolem',
    city: 'Goa',
    country: 'India',
    latitude: 15.0099,
    longitude: 74.0232,
    phone: '+91 98221 99014',
    status: 'active',
    verificationStatus: 'VERIFIED',
    rating: 4.8,
    reviewCount: 52,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-10-21T10:00:00Z',
    media: [
      {
        id: 'm_5',
        businessId: 'biz_palolem_shack',
        url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1000&auto=format&fit=crop&q=80',
        provider: 'local',
        mediaType: 'cover',
        sortOrder: 1,
        moderationStatus: 'APPROVED',
        createdAt: '2026-03-01T10:00:00Z',
      },
    ],
    services: [
      {
        id: 'srv_beach_cottage',
        businessId: 'biz_palolem_shack',
        serviceName: 'Deluxe Beachfront Bamboo Cottage',
        serviceType: 'accommodation',
        description: 'Wake up 10 steps from the waves with private hammock and outdoor rain shower.',
        basePriceMinor: 450000,
        currency: 'INR',
        priceUnit: 'per night',
        isAvailable: true,
        maxCapacity: 3,
        facilities: ['On the Sand', 'Sea Kayak Included', 'Wi-Fi', 'Breakfast'],
      },
    ],
  },
];

function getStoredBookings(): BookingRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveStoredBooking(b: BookingRequest): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getStoredBookings().filter(existing => existing.id !== b.id);
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify([b, ...all]));
  } catch {}
}

export const discoveryApi = {
  // Discovery
  getNearbyBusinesses: async (lat: number, lng: number, radius?: number): Promise<{ data: Business[] }> => {
    try {
      const res = await fetchClient<{ data: Business[] }>('/discover/businesses/nearby', {
        params: { lat, lng, radius },
      });
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    return { data: MOCK_BUSINESSES };
  },

  getDestinationBusinesses: async (city: string, country: string, category?: string): Promise<{ data: Business[] }> => {
    try {
      const res = await fetchClient<{ data: Business[] }>('/discover/businesses/destination', {
        params: { city, country, category },
      });
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    let filtered = MOCK_BUSINESSES;
    if (category && category !== 'ALL') {
      filtered = filtered.filter(b => b.category.toUpperCase() === category.toUpperCase());
    }
    return { data: filtered };
  },

  compareBusinesses: async (ids: string): Promise<{ data: Business[] }> => {
    try {
      const res = await fetchClient<{ data: Business[] }>('/discover/businesses/compare', { params: { ids } });
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    const idList = ids.split(',').map(s => s.trim());
    const matched = MOCK_BUSINESSES.filter(b => idList.includes(b.id));
    return { data: matched.length > 0 ? matched : MOCK_BUSINESSES.slice(0, 3) };
  },

  getBusinessDetail: async (id: string): Promise<Business> => {
    try {
      const res = await fetchClient<Business>(`/discover/businesses/${id}`);
      if (res?.id) return res;
    } catch {}

    const match = MOCK_BUSINESSES.find(b => b.id === id);
    if (match) return match;
    return MOCK_BUSINESSES[0];
  },

  // Business Details
  getBusinessServices: async (id: string): Promise<{ data: BusinessService[] }> => {
    try {
      const res = await fetchClient<{ data: BusinessService[] }>(`/discover/businesses/${id}/services`);
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    const match = MOCK_BUSINESSES.find(b => b.id === id);
    return { data: match?.services || MOCK_BUSINESSES[0].services || [] };
  },

  getBusinessOffers: (id: string) =>
    fetchClient<{ data: BusinessOffer[] }>(`/discover/businesses/${id}/offers`),

  recordInteraction: (id: string, type: 'view' | 'click' | 'save' | 'share') =>
    fetchClient(`/discover/businesses/${id}/interactions`, { method: 'POST', body: JSON.stringify({ type }) }),

  reportBusiness: (id: string, reason: string) =>
    fetchClient(`/discover/businesses/${id}/report`, { method: 'POST', body: JSON.stringify({ reason }) }),

  // Bookings
  createBookingRequest: async (businessId: string, payload: any, idempotencyKey: string): Promise<BookingRequest> => {
    try {
      const res = await fetchClient<BookingRequest>(`/discover/businesses/${businessId}/booking-requests`, {
        method: 'POST',
        body: JSON.stringify(payload),
        idempotencyKey,
      });
      if (res?.id) {
        saveStoredBooking(res);
        return res;
      }
    } catch {}

    const mockBooking: BookingRequest = {
      id: `br_${Date.now()}`,
      bookingReference: `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      businessId,
      travelerHash: 'usr_alex_7492',
      status: 'REQUESTED',
      priceSnapshotMinor: payload.priceMinor || 500000,
      currency: payload.currency || 'INR',
      serviceId: payload.serviceId,
      serviceName: payload.serviceName || 'Direct Experience Booking',
      bookingDate: payload.bookingDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      businessName: payload.businessName || 'Verified Experience Destination',
    };

    saveStoredBooking(mockBooking);
    return mockBooking;
  },

  cancelBookingRequest: async (requestId: string) => {
    try {
      await fetchClient(`/discover/booking-requests/${requestId}/cancel`, { method: 'POST' });
    } catch {}

    const all = getStoredBookings();
    const updated = all.map(b => (b.id === requestId ? { ...b, status: 'CANCELLED' as const } : b));
    if (typeof window !== 'undefined') {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
    }
  },

  getTravelerBookings: async (): Promise<{ data: BookingRequest[] }> => {
    try {
      const res = await fetchClient<{ data: BookingRequest[] }>('/discover/traveler/bookings');
      if (res?.data && res.data.length > 0) {
        return res;
      }
    } catch {}

    const stored = getStoredBookings();
    if (stored.length > 0) {
      return { data: stored };
    }

    const defaults: BookingRequest[] = [
      {
        id: 'res_default_1',
        bookingReference: 'BK-ANJUNA-9921',
        businessId: 'biz_anjuna_villa',
        travelerHash: 'usr_alex_7492',
        status: 'ACCEPTED',
        priceSnapshotMinor: 2400000,
        currency: 'INR',
        serviceName: 'Anjuna Beachfront Sunset Villa (3 Nights)',
        businessName: 'Anjuna Luxury Coastal Villa',
        bookingDate: '2026-11-14',
        createdAt: '2026-10-15T10:00:00Z',
      },
      {
        id: 'br_default_2',
        bookingReference: 'BK-THALASSA-4412',
        businessId: 'biz_thalassa',
        travelerHash: 'usr_alex_7492',
        status: 'REQUESTED',
        priceSnapshotMinor: 960000,
        currency: 'INR',
        serviceName: 'Cliffside Sunset Mezze Table (4 Guests)',
        businessName: 'Thalassa Siolim',
        bookingDate: '2026-11-15',
        createdAt: '2026-10-16T14:00:00Z',
      },
      {
        id: 'br_default_3',
        bookingReference: 'BK-SCUBA-1102',
        businessId: 'biz_scuba_goa',
        travelerHash: 'usr_alex_7492',
        status: 'DECLINED',
        rejectionReason: 'Grand Island marine swell alert; boat tours halted for passenger safety.',
        priceSnapshotMinor: 1200000,
        currency: 'INR',
        serviceName: 'Certified Scuba Diving & Dolphin Cruise',
        businessName: 'Goa Marine Adventures',
        bookingDate: '2026-11-16',
        createdAt: '2026-10-18T16:00:00Z',
      },
    ];

    if (typeof window !== 'undefined') {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(defaults));
    }
    return { data: defaults };
  },

  getTravelerBookingDetail: (id: string) =>
    fetchClient<BookingRequest>(`/discover/traveler/bookings/${id}`),

  getTravelerReservationDetail: async (id: string): Promise<Reservation> => {
    try {
      const res = await fetchClient<Reservation>(`/discover/traveler/reservations/${id}`);
      if (res?.id) return res;
    } catch {}

    return {
      id,
      bookingRequestId: id,
      bookingReference: `TS-VOUCHER-${id.substring(0, 6).toUpperCase()}`,
      businessId: 'biz_anjuna_villa',
      businessName: 'Anjuna Beachfront Sunset Villa & Spa',
      businessAddress: 'Plot 44, Anjuna Flea Market Rd, North Goa',
      businessCity: 'Goa',
      businessCountry: 'India',
      latitude: 15.5807,
      longitude: 73.7433,
      phone: '+91 98230 44521',
      serviceName: 'Private Ocean Suite with Infinity Plunge Pool',
      priceMinor: 2400000,
      currency: 'INR',
      status: 'CONFIRMED',
      vendorConfirmedAt: '2026-10-15T12:00:00Z',
      bookingDate: '2026-11-14',
      digitalKey: {
        code: 'VILLA-204-KEY',
        pin: '849204',
        doorName: 'Ocean Suite 204 · Private Gate',
        validUntil: '2026-11-19T11:00:00Z',
        wifiSsid: 'Anjuna_Luxury_Guests_5G',
        wifiPassword: 'sunsetparadise2026',
      },
    };
  },

  // Saved / Bookmark Storage Helpers
  getSavedVenueIds: (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(SAVED_VENUES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return ['biz_anjuna_villa', 'biz_thalassa'];
  },

  toggleSaveVenue: (venueId: string): boolean => {
    if (typeof window === 'undefined') return false;
    const current = discoveryApi.getSavedVenueIds();
    let updated: string[];
    let isSaved: boolean;
    if (current.includes(venueId)) {
      updated = current.filter(id => id !== venueId);
      isSaved = false;
    } else {
      updated = [venueId, ...current];
      isSaved = true;
    }
    localStorage.setItem(SAVED_VENUES_KEY, JSON.stringify(updated));
    return isSaved;
  },

  // Reviews
  getBusinessReviews: async (id: string): Promise<{ data: BusinessReview[] }> => {
    try {
      const res = await fetchClient<{ data: BusinessReview[] }>(`/discover/businesses/${id}/reviews`);
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    const match = MOCK_BUSINESSES.find(b => b.id === id);
    return { data: match?.reviews || [] };
  },

  getBusinessReviewsSummary: (id: string) =>
    fetchClient(`/discover/businesses/${id}/reviews/summary`),

  createReview: async (businessId: string, payload: any, idempotencyKey: string): Promise<BusinessReview> => {
    try {
      const res = await fetchClient<BusinessReview>(`/discover/businesses/${businessId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(payload),
        idempotencyKey,
      });
      if (res?.id) return res;
    } catch {}

    const newRev: BusinessReview = {
      id: `rev_${Date.now()}`,
      businessId,
      travelerHash: 'usr_me_verified',
      rating: payload.rating || 5,
      comment: payload.comment || 'Wonderful verified experience!',
      provenance: payload.provenance || 'VERIFIED_BOOKING',
      createdAt: new Date().toISOString(),
    };
    return newRev;
  },

  reportReview: (reviewId: string, reason: string) =>
    fetchClient(`/discover/reviews/${reviewId}/report`, { method: 'POST', body: JSON.stringify({ reason }) }),

  // Advertising
  recordAdEvent: (campaignId: string, type: 'impression' | 'click') =>
    fetchClient('/discover/events', { method: 'POST', body: JSON.stringify({ campaignId, type }) }),

  getEligibleCampaigns: (category: string, city: string) =>
    fetchClient<any>(`/discover/campaigns/eligible`, { params: { category, city } }),
};
