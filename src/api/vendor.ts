import { fetchClient } from './client';
import {
  Business,
  BusinessMedia,
  BusinessOffer,
  BusinessService,
  BookingRequest,
  Reservation,
  BusinessReview,
} from '../types/api';
import { MOCK_BUSINESSES } from './discover';

const VENDOR_BOOKINGS_STORAGE_KEY = 'wakeru_web_bookings';

function getStoredBookings(): BookingRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VENDOR_BOOKINGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function updateStoredBooking(requestId: string, status: BookingRequest['status'], reason?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getStoredBookings();
    const updated = all.map(b => (b.id === requestId ? { ...b, status, rejectionReason: reason, reason } : b));
    localStorage.setItem(VENDOR_BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export const vendorApi = {
  // Identity
  getMe: async () => {
    try {
      return await fetchClient('/vendor/me');
    } catch {
      return {
        id: 'ven_anjuna_host',
        name: 'Vikram Joshi',
        email: 'vikram.goa.villas@wakeru.local',
        phone: '+91 98230 44521',
        status: 'VERIFIED',
      };
    }
  },

  updateProfile: (data: any) =>
    fetchClient('/vendor/me', { method: 'PATCH', body: JSON.stringify(data) }),

  // Businesses
  createBusiness: async (data: any): Promise<Business> => {
    try {
      const res = await fetchClient<Business>('/vendor/businesses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res?.id) return res;
    } catch {}

    const newBiz: Business = {
      id: `biz_${Date.now()}`,
      vendorId: 'ven_anjuna_host',
      businessName: data.businessName || 'New Retreat',
      category: data.category || 'STAY',
      description: data.description || '',
      address: data.address || '',
      city: data.city || 'Goa',
      country: data.country || 'India',
      status: 'active',
      verificationStatus: 'PENDING',
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newBiz;
  },

  getBusinesses: async (): Promise<{ data: Business[] }> => {
    try {
      const res = await fetchClient<{ data: Business[] }>('/vendor/businesses');
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    return { data: MOCK_BUSINESSES.slice(0, 3) };
  },

  getBusinessById: async (id: string): Promise<Business> => {
    try {
      const res = await fetchClient<Business>(`/vendor/businesses/${id}`);
      if (res?.id) return res;
    } catch {}

    const match = MOCK_BUSINESSES.find(b => b.id === id);
    if (match) return match;
    return MOCK_BUSINESSES[0];
  },

  updateBusiness: async (id: string, data: any): Promise<Business> => {
    try {
      const res = await fetchClient<Business>(`/vendor/businesses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (res?.id) return res;
    } catch {}

    const match = MOCK_BUSINESSES.find(b => b.id === id) || MOCK_BUSINESSES[0];
    return { ...match, ...data, updatedAt: new Date().toISOString() };
  },

  getBusinessOverview: async (id: string) => {
    try {
      return await fetchClient<any>(`/vendor/businesses/${id}/overview`);
    } catch {
      return {
        totalRevenueMinor: 48000000,
        monthlyBookings: 24,
        averageRating: 4.9,
        occupancyRate: 86,
      };
    }
  },

  checkCompleteness: async (id: string) => {
    try {
      return await fetchClient<any>(`/vendor/businesses/${id}/completeness`);
    } catch {
      return {
        score: 95,
        missingFields: [],
        readyForPublishing: true,
      };
    }
  },

  // Media
  getMedia: async (businessId: string): Promise<{ data: BusinessMedia[] }> => {
    try {
      const res = await fetchClient<{ data: BusinessMedia[] }>(`/vendor/businesses/${businessId}/media`);
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    const match = MOCK_BUSINESSES.find(b => b.id === businessId);
    return { data: match?.media || [] };
  },

  uploadMedia: (businessId: string, data: any) =>
    fetchClient<BusinessMedia>(`/vendor/businesses/${businessId}/media`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteMedia: (mediaId: string) =>
    fetchClient(`/vendor/media/${mediaId}`, { method: 'DELETE' }),

  reorderMedia: (businessId: string, updates: any[]) =>
    fetchClient(`/vendor/businesses/${businessId}/media/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    }),

  setCoverMedia: (businessId: string, mediaId: string) =>
    fetchClient(`/vendor/businesses/${businessId}/media/cover`, {
      method: 'PATCH',
      body: JSON.stringify({ mediaId }),
    }),

  // Offers
  getOffers: async (businessId: string): Promise<{ data: BusinessOffer[] }> => {
    try {
      const res = await fetchClient<{ data: BusinessOffer[] }>(`/vendor/businesses/${businessId}/offers`);
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    return {
      data: [
        {
          id: 'off_early_bird',
          businessId,
          title: 'Early Bird Sunset Package - 15% OFF',
          description: 'Book 14 days in advance for direct beach villa access and private plunge pool.',
          discountType: 'percentage',
          discountValue: 15,
          startAt: '2026-10-01',
          endAt: '2026-12-31',
          status: 'active',
        },
        {
          id: 'off_group_stay',
          businessId,
          title: 'TripSplit Squad Special - Free Welcome Mezze & Wine',
          description: 'Complementary Aegean sunset appetizers for groups of 4 or more.',
          discountType: 'percentage',
          discountValue: 10,
          startAt: '2026-10-01',
          endAt: '2026-11-30',
          status: 'active',
        },
      ],
    };
  },

  createOffer: (businessId: string, data: any) =>
    fetchClient<BusinessOffer>(`/vendor/businesses/${businessId}/offers`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateOfferStatus: (offerId: string, status: string) =>
    fetchClient<BusinessOffer>(`/vendor/offers/${offerId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deleteOffer: (offerId: string) =>
    fetchClient(`/vendor/offers/${offerId}`, { method: 'DELETE' }),

  // Services
  getServices: async (businessId: string): Promise<{ data: BusinessService[] }> => {
    try {
      const res = await fetchClient<{ data: BusinessService[] }>(`/vendor/businesses/${businessId}/services`);
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    const match = MOCK_BUSINESSES.find(b => b.id === businessId);
    return { data: match?.services || MOCK_BUSINESSES[0].services || [] };
  },

  createService: (businessId: string, data: any) =>
    fetchClient<BusinessService>(`/vendor/businesses/${businessId}/services`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteService: (serviceId: string) =>
    fetchClient(`/vendor/services/${serviceId}`, { method: 'DELETE' }),

  // CRM: Leads, Bookings & Reservations
  getLeads: async (businessId: string) => {
    try {
      return await fetchClient<any>(`/vendor/businesses/${businessId}/leads`);
    } catch {
      return {
        data: [
          {
            id: 'lead_1',
            travelerName: 'Sarah Jenkins',
            email: 'sarah.j@gmail.com',
            phone: '+91 99823 11094',
            inquiry: 'Interested in booking the entire 4-bedroom villa for 6 nights in November.',
            status: 'NEW',
            createdAt: '2026-10-21T09:30:00Z',
          },
        ],
      };
    }
  },

  getBookingRequests: async (businessId: string): Promise<{ data: BookingRequest[] }> => {
    try {
      const res = await fetchClient<{ data: BookingRequest[] }>(`/vendor/businesses/${businessId}/booking-requests`);
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    const stored = getStoredBookings();
    if (stored.length > 0) {
      const matching = stored.filter(b => !businessId || b.businessId === businessId);
      return { data: matching.length > 0 ? matching : stored };
    }

    return {
      data: [
        {
          id: 'res_default_1',
          bookingReference: 'BK-ANJUNA-9921',
          businessId,
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
          businessId,
          travelerHash: 'usr_alex_7492',
          status: 'REQUESTED',
          priceSnapshotMinor: 960000,
          currency: 'INR',
          serviceName: 'Cliffside Sunset Mezze Table (4 Guests)',
          businessName: 'Thalassa Siolim',
          bookingDate: '2026-11-15',
          createdAt: '2026-10-16T14:00:00Z',
        },
      ],
    };
  },

  acceptBookingRequest: async (requestId: string): Promise<BookingRequest> => {
    try {
      const res = await fetchClient<BookingRequest>(`/vendor/booking-requests/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ACCEPTED' }),
      });
      if (res?.id) {
        updateStoredBooking(requestId, 'ACCEPTED');
        return res;
      }
    } catch {}

    updateStoredBooking(requestId, 'ACCEPTED');
    return {
      id: requestId,
      bookingReference: `BK-${requestId.slice(-4).toUpperCase()}`,
      businessId: 'biz_anjuna_villa',
      travelerHash: 'usr_alex_7492',
      status: 'ACCEPTED',
      priceSnapshotMinor: 2400000,
      currency: 'INR',
      serviceName: 'Anjuna Beachfront Sunset Villa',
      bookingDate: '2026-11-14',
      createdAt: new Date().toISOString(),
    };
  },

  declineBookingRequest: async (requestId: string, reason?: string): Promise<BookingRequest> => {
    try {
      const res = await fetchClient<BookingRequest>(`/vendor/booking-requests/${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'DECLINED', reason, rejectionReason: reason }),
      });
      if (res?.id) {
        updateStoredBooking(requestId, 'DECLINED', reason);
        return res;
      }
    } catch {}

    updateStoredBooking(requestId, 'DECLINED', reason);
    return {
      id: requestId,
      bookingReference: `BK-${requestId.slice(-4).toUpperCase()}`,
      businessId: 'biz_anjuna_villa',
      travelerHash: 'usr_alex_7492',
      status: 'DECLINED',
      rejectionReason: reason || 'Dates unavailable',
      priceSnapshotMinor: 2400000,
      currency: 'INR',
      serviceName: 'Anjuna Beachfront Sunset Villa',
      bookingDate: '2026-11-14',
      createdAt: new Date().toISOString(),
    };
  },

  getReservations: async (businessId: string): Promise<{ data: Reservation[] }> => {
    try {
      const res = await fetchClient<{ data: Reservation[] }>(`/vendor/businesses/${businessId}/reservations`);
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    return {
      data: [
        {
          id: 'res_default_1',
          bookingRequestId: 'br_default_1',
          businessId,
          businessName: 'Anjuna Luxury Coastal Villa',
          serviceName: 'Anjuna Beachfront Sunset Villa (3 Nights)',
          currency: 'INR',
          priceMinor: 2400000,
          status: 'CONFIRMED',
          vendorConfirmedAt: '2026-10-15T10:00:00Z',
          bookingDate: '2026-11-14',
          digitalKey: {
            code: 'VILLA-204-KEY',
            pin: '849204',
            doorName: 'Ocean Suite 204 · Private Gate',
            validUntil: '2026-11-17T11:00:00Z',
            wifiSsid: 'Anjuna_Luxury_Guests_5G',
            wifiPassword: 'sunsetparadise2026',
          },
        },
      ],
    };
  },

  completeReservation: (reservationId: string) =>
    fetchClient<Reservation>(`/vendor/reservations/${reservationId}/complete`, { method: 'PATCH' }),

  // Reviews
  getReviews: async (businessId: string): Promise<{ data: BusinessReview[] }> => {
    try {
      const res = await fetchClient<{ data: BusinessReview[] }>(`/vendor/businesses/${businessId}/reviews`);
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    const match = MOCK_BUSINESSES.find(b => b.id === businessId);
    return { data: match?.reviews || [] };
  },

  replyToReview: (reviewId: string, reply: string) =>
    fetchClient<BusinessReview>(`/vendor/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply }),
    }),

  // Advertising Campaigns
  getCampaigns: async (businessId: string) => {
    try {
      return await fetchClient<any>(`/vendor/businesses/${businessId}/campaigns`);
    } catch {
      return {
        data: [
          {
            id: 'camp_1',
            businessId,
            name: 'Goa Sunset Luxury Villa Reach',
            status: 'ACTIVE',
            dailyBudgetMinor: 50000,
            impressions: 4820,
            clicks: 342,
            conversions: 18,
          },
        ],
      };
    }
  },

  createCampaign: (businessId: string, data: any) =>
    fetchClient<any>(`/vendor/businesses/${businessId}/campaigns`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCampaignStatus: (campaignId: string, status: string) =>
    fetchClient<any>(`/vendor/campaigns/${campaignId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  addFunds: (vendorId: string, amount: number) =>
    fetchClient<any>(`/vendor/${vendorId}/funds`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  // Analytics
  getAnalytics: async (businessId: string, timeframe: string) => {
    try {
      return await fetchClient<any>(`/vendor/businesses/${businessId}/analytics`, {
        params: { timeframe },
      });
    } catch {
      return {
        views: 1420,
        uniqueVisitors: 980,
        inquiries: 46,
        confirmedBookings: 24,
        avgStayDurationNights: 3.4,
        topLocations: ['Mumbai', 'Bengaluru', 'Delhi', 'Dubai', 'London'],
      };
    }
  },
};
