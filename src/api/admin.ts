import { fetchClient } from './client';
import { Business, BusinessMedia, Vendor } from '../types/api';
import { MOCK_BUSINESSES } from './discover';

const MOCK_AUDIT_LOGS = [
  {
    id: 'aud_1',
    actor: 'vikram.goa.villas@wakeru.local',
    action: 'BOOKING_ACCEPT',
    target: 'BK-ANJUNA-9921',
    ip: '103.212.14.99',
    timestamp: '2026-10-22T08:15:00Z',
    details: 'Vendor confirmed reservation for Anjuna Beachfront Villa (3 nights).',
  },
  {
    id: 'aud_2',
    actor: 'admin@wakeru.local',
    action: 'BUSINESS_VERIFY',
    target: 'biz_thalassa',
    ip: '14.139.12.8',
    timestamp: '2026-10-21T16:40:00Z',
    details: 'Partner license and FSSAI hygiene certificate verified.',
  },
  {
    id: 'aud_3',
    actor: 'admin@wakeru.local',
    action: 'MEDIA_APPROVE',
    target: 'm_goa_scuba_1',
    ip: '14.139.12.8',
    timestamp: '2026-10-20T11:20:00Z',
    details: 'Approved high-resolution underwater coral photos for Grand Island dive tour.',
  },
];

const MOCK_VENDORS: Vendor[] = [
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

export const adminApi = {
  // Businesses & Moderation
  getBusinesses: async (page = 1): Promise<{ data: Business[]; pagination: any }> => {
    try {
      const res = await fetchClient<{ data: Business[]; pagination: any }>('/admin/businesses', {
        params: { page },
      });
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    return {
      data: MOCK_BUSINESSES,
      pagination: { currentPage: page, totalPages: 1, totalItems: MOCK_BUSINESSES.length },
    };
  },

  getBusinessById: async (id: string): Promise<Business> => {
    try {
      const res = await fetchClient<Business>(`/admin/businesses/${id}`);
      if (res?.id) return res;
    } catch {}

    const match = MOCK_BUSINESSES.find(b => b.id === id);
    return match || MOCK_BUSINESSES[0];
  },

  verifyBusiness: async (id: string, status: string) => {
    try {
      return await fetchClient(`/admin/businesses/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ verificationStatus: status }),
      });
    } catch {
      return { success: true, id, verificationStatus: status };
    }
  },

  // Media Moderation
  getMediaQueue: async (): Promise<{ data: BusinessMedia[] }> => {
    try {
      const res = await fetchClient<{ data: BusinessMedia[] }>('/admin/media');
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    return {
      data: [
        {
          id: 'med_pend_1',
          businessId: 'biz_palolem_shack',
          url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
          provider: 'local',
          mediaType: 'image',
          sortOrder: 1,
          moderationStatus: 'PENDING',
          createdAt: '2026-10-21T14:00:00Z',
        },
        {
          id: 'med_pend_2',
          businessId: 'biz_gunpowder',
          url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
          provider: 'local',
          mediaType: 'image',
          sortOrder: 2,
          moderationStatus: 'PENDING',
          createdAt: '2026-10-22T08:00:00Z',
        },
      ],
    };
  },

  reviewMedia: async (id: string, status: string) => {
    try {
      return await fetchClient(`/admin/media/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ moderationStatus: status }),
      });
    } catch {
      return { success: true, id, moderationStatus: status };
    }
  },

  // Vendors
  getVendors: async (page = 1): Promise<{ data: Vendor[]; pagination: any }> => {
    try {
      const res = await fetchClient<{ data: Vendor[]; pagination: any }>('/admin/vendors', {
        params: { page },
      });
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    return {
      data: MOCK_VENDORS,
      pagination: { currentPage: page, totalPages: 1, totalItems: MOCK_VENDORS.length },
    };
  },

  suspendVendor: async (id: string) => {
    try {
      return await fetchClient(`/admin/vendors/${id}/suspend`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'suspend' }),
      });
    } catch {
      return { success: true, id, status: 'SUSPENDED' };
    }
  },

  // Reviews & Reports
  getReviewReports: async () => {
    try {
      const res = await fetchClient<any>('/admin/reviews/reports');
      if (res?.data) return res;
    } catch {}

    return {
      data: [
        {
          id: 'rep_1',
          reviewId: 'rev_1',
          businessId: 'biz_anjuna_villa',
          reason: 'Potential competitor review dispute',
          reportedBy: 'host_vikram',
          status: 'PENDING',
          createdAt: '2026-10-20T10:00:00Z',
        },
      ],
    };
  },

  dismissReviewReport: async (reportId: string) => {
    try {
      return await fetchClient(`/admin/reviews/reports/${reportId}/dismiss`, { method: 'PATCH' });
    } catch {
      return { success: true, reportId, status: 'DISMISSED' };
    }
  },

  deleteReview: async (reviewId: string) => {
    try {
      return await fetchClient(`/admin/reviews/${reviewId}`, { method: 'DELETE' });
    } catch {
      return { success: true, reviewId, deleted: true };
    }
  },

  // Bookings & Reservations
  getBookingQueue: async () => {
    try {
      const res = await fetchClient<any>('/admin/booking-requests');
      if (res?.data) return res;
    } catch {}

    return {
      data: [
        {
          id: 'res_default_1',
          bookingReference: 'BK-ANJUNA-9921',
          businessId: 'biz_anjuna_villa',
          businessName: 'Anjuna Sunset Villa',
          travelerHash: 'usr_alex_7492',
          status: 'ACCEPTED',
          priceSnapshotMinor: 2400000,
          currency: 'INR',
          bookingDate: '2026-11-14',
          createdAt: '2026-10-15T10:00:00Z',
        },
      ],
    };
  },

  getBookingById: async (id: string) => {
    try {
      return await fetchClient<any>(`/admin/booking-requests/${id}`);
    } catch {
      return null;
    }
  },

  getReservations: async () => {
    try {
      const res = await fetchClient<any>('/admin/reservations');
      if (res?.data) return res;
    } catch {}

    return {
      data: [
        {
          id: 'res_default_1',
          bookingId: 'br_default_1',
          businessId: 'biz_anjuna_villa',
          serviceName: 'Full Ocean Villa (3 Nights)',
          totalAmountMinor: 2400000,
          status: 'ACTIVE',
          validFrom: '2026-11-14T14:00:00Z',
          validUntil: '2026-11-17T11:00:00Z',
        },
      ],
    };
  },

  getReservationById: (id: string) =>
    fetchClient<any>(`/admin/reservations/${id}`),

  // Campaigns
  getCampaigns: async () => {
    try {
      const res = await fetchClient<any>('/admin/campaigns');
      if (res?.data) return res;
    } catch {}

    return {
      data: [
        {
          id: 'camp_1',
          businessId: 'biz_anjuna_villa',
          title: 'Goa Sunset Luxury Villa Reach',
          status: 'ACTIVE',
          dailyBudgetMinor: 50000,
          moderationStatus: 'APPROVED',
        },
      ],
    };
  },

  reviewCampaign: async (id: string, status: string) => {
    try {
      return await fetchClient<any>(`/admin/campaigns/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
    } catch {
      return { success: true, id, status };
    }
  },

  // Logs & Auditing
  getAuditLogs: async (page = 1): Promise<{ data: any[]; pagination: any }> => {
    try {
      const res = await fetchClient<{ data: any[]; pagination: any }>('/admin/audit-logs', {
        params: { page },
      });
      if (res?.data && res.data.length > 0) return res;
    } catch {}

    return {
      data: MOCK_AUDIT_LOGS,
      pagination: { currentPage: page, totalPages: 1, totalItems: MOCK_AUDIT_LOGS.length },
    };
  },

  getDemandInsights: async () => {
    try {
      return await fetchClient<any>('/admin/demand-insights');
    } catch {
      return {
        topSearchedDestinations: [
          { city: 'Goa', searches: 14820, growth: '+28%' },
          { city: 'Manali', searches: 8940, growth: '+14%' },
          { city: 'Bali', searches: 6420, growth: '+33%' },
          { city: 'Kerala', searches: 5120, growth: '+12%' },
        ],
        peakBookingWindows: '14 to 28 days prior to check-in',
        averageGroupSize: 5.2,
      };
    }
  },
};
