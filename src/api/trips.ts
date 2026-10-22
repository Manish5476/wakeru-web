import apiClient, { ApiResponse } from './client';
import { ITrip, IStop, ITripMember } from '@/types/trip.types';
import { ITravelPlan } from '@/types/travelPlan.types';

export const tripsApi = {
  // ────────────────── TRIP CRUD ──────────────────
  getMyTrips: async (params?: Record<string, any>): Promise<ApiResponse<{
    trips: ITrip[];
    pagination?: { totalCount: number; totalPages: number; page: number; limit: number };
    stats?: { activeTripsCount: number; totalSpentBase: number; totalCountries: number; totalTravelers: number };
  }>> => {
    return apiClient.get('/trips', { params });
  },

  getTrip: async (tripId: string): Promise<ApiResponse<{ trip: ITrip }>> => {
    return apiClient.get(`/trips/${tripId}`);
  },

  create: async (data: Partial<ITrip>): Promise<ApiResponse<{ trip: ITrip }>> => {
    return apiClient.post('/trips', data);
  },

  updateTrip: async (tripId: string, data: Partial<ITrip>): Promise<ApiResponse<{ trip: ITrip }>> => {
    return apiClient.patch(`/trips/${tripId}`, data);
  },

  archiveTrip: async (tripId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/trips/${tripId}`);
  },

  unarchiveTrip: async (tripId: string): Promise<ApiResponse<void>> => {
    return apiClient.post(`/trips/${tripId}/unarchive`);
  },

  deleteTripPermanent: async (tripId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/trips/${tripId}/permanent`);
  },

  // ────────────────── DASHBOARD & INSIGHTS ──────────────────
  getTripSummary: async (tripId: string): Promise<ApiResponse<{ summary: any }>> => {
    return apiClient.get(`/trips/${tripId}/summary`);
  },

  getInsights: async (tripId: string): Promise<ApiResponse<any>> => {
    return apiClient.get(`/trips/${tripId}/insights`);
  },

  getTripStory: async (tripId: string): Promise<ApiResponse<{ story: any }>> => {
    return apiClient.get(`/trips/${tripId}/story`);
  },

  // ────────────────── STOPS ──────────────────
  addStop: async (tripId: string, data: Partial<IStop>): Promise<ApiResponse<{ stop: IStop; trip: ITrip }>> => {
    return apiClient.post(`/trips/${tripId}/stops`, data);
  },

  updateStop: async (tripId: string, stopId: string, data: Partial<IStop>): Promise<ApiResponse<{ stop: IStop }>> => {
    return apiClient.patch(`/trips/${tripId}/stops/${stopId}`, data);
  },

  reorderStops: async (tripId: string, stopIds: string[]): Promise<ApiResponse<{ stops: IStop[] }>> => {
    return apiClient.patch(`/trips/${tripId}/stops/reorder`, { stopIds });
  },

  deleteStop: async (tripId: string, stopId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/trips/${tripId}/stops/${stopId}`);
  },

  // ────────────────── MEMBERS & ROLES ──────────────────
  getMembers: async (tripId: string): Promise<ApiResponse<{ members: ITripMember[] }>> => {
    return apiClient.get(`/trips/${tripId}/members`);
  },

  addMember: async (tripId: string, userId: string, role = 'member'): Promise<ApiResponse<{ trip: ITrip }>> => {
    return apiClient.post(`/trips/${tripId}/members`, { userId, role });
  },

  updateMemberRole: async (tripId: string, userId: string, role: string): Promise<ApiResponse<void>> => {
    return apiClient.patch(`/trips/${tripId}/members/${userId}/role`, { role });
  },

  removeMember: async (tripId: string, userId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/trips/${tripId}/members/${userId}`);
  },

  // ────────────────── INVITATIONS & JOIN ──────────────────
  generateInvite: async (tripId: string, expiresInDays?: number): Promise<ApiResponse<{ inviteCode: string; expiresAt: string; joinUrl: string }>> => {
    return apiClient.post(`/trips/${tripId}/invite/generate`, { expiresInDays });
  },

  revokeInvite: async (tripId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/trips/${tripId}/invite`);
  },

  getTripPreview: async (inviteCode: string): Promise<ApiResponse<{ trip: any }>> => {
    return apiClient.get(`/trips/join/${inviteCode}`);
  },

  joinTrip: async (inviteCode: string): Promise<ApiResponse<{ joinRequest?: any; trip?: ITrip }>> => {
    return apiClient.post(`/trips/join/${inviteCode}`);
  },

  getPendingJoinRequests: async (tripId: string): Promise<ApiResponse<{ requests: any[]; count: number }>> => {
    return apiClient.get(`/trips/${tripId}/join-requests`);
  },

  approveJoinRequest: async (tripId: string, requestId: string): Promise<ApiResponse<{ trip: ITrip }>> => {
    return apiClient.post(`/trips/${tripId}/join-requests/${requestId}/approve`);
  },

  rejectJoinRequest: async (tripId: string, requestId: string): Promise<ApiResponse<void>> => {
    return apiClient.post(`/trips/${tripId}/join-requests/${requestId}/reject`);
  },

  // ────────────────── TRAVEL PLAN & CHECKLISTS ──────────────────
  getTravelPlan: async (tripId: string): Promise<ApiResponse<{ plan: ITravelPlan }>> => {
    return apiClient.get(`/trips/${tripId}/plan`);
  },

  updateTravelPlan: async (tripId: string, data: any): Promise<ApiResponse<{ plan: ITravelPlan }>> => {
    return apiClient.patch(`/trips/${tripId}/plan`, data);
  },

  addChecklistItem: async (tripId: string, data: any): Promise<ApiResponse<{ plan: ITravelPlan }>> => {
    return apiClient.post(`/trips/${tripId}/plan/checklist`, data);
  },

  toggleChecklistItem: async (tripId: string, itemId: string): Promise<ApiResponse<{ plan: ITravelPlan }>> => {
    return apiClient.patch(`/trips/${tripId}/plan/checklist/${itemId}/toggle`);
  },

  deleteChecklistItem: async (tripId: string, itemId: string): Promise<ApiResponse<{ plan: ITravelPlan }>> => {
    return apiClient.delete(`/trips/${tripId}/plan/checklist/${itemId}`);
  },

  initializePackingList: async (tripId: string): Promise<ApiResponse<{ plan: ITravelPlan }>> => {
    return apiClient.post(`/trips/${tripId}/plan/packing/init`);
  },

  togglePackingItem: async (tripId: string, categoryId: string, itemId: string): Promise<ApiResponse<{ plan: ITravelPlan }>> => {
    return apiClient.patch(`/trips/${tripId}/plan/packing/${categoryId}/items/${itemId}/toggle`);
  },

  addContact: async (tripId: string, data: any): Promise<ApiResponse<{ plan: ITravelPlan }>> => {
    return apiClient.post(`/trips/${tripId}/plan/contacts`, data);
  },

  getTemplates: async (): Promise<ApiResponse<{ templates: any[] }>> => {
    return apiClient.get('/trips/templates');
  },
};
