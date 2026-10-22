import apiClient, { ApiResponse } from './client';
import { ISettlement } from '@/types/settlement.types';

export const settlementsApi = {
  getSettlement: async (tripId: string): Promise<ApiResponse<{ settlement: ISettlement; summary?: any }>> => {
    return apiClient.get(`/settlements/trip/${tripId}`);
  },

  calculateSettlement: async (tripId: string): Promise<ApiResponse<{ settlement: ISettlement }>> => {
    return apiClient.post(`/settlements/trip/${tripId}/calculate`);
  },

  initiatePayment: async (tripId: string, transactionId: string): Promise<ApiResponse<{ transaction: any; upiDeepLink: string }>> => {
    return apiClient.post(`/settlements/trip/${tripId}/pay`, { transactionId });
  },

  confirmTransaction: async (tripId: string, transactionId: string, notes?: string): Promise<ApiResponse<{ settlement: ISettlement; isFullySettled: boolean }>> => {
    return apiClient.post(`/settlements/trip/${tripId}/transactions/${transactionId}/confirm`, { notes });
  },

  disputePayment: async (tripId: string, transactionId: string): Promise<ApiResponse<{ settlement: ISettlement }>> => {
    return apiClient.post(`/settlements/trip/${tripId}/dispute`, { transactionId });
  },

  settleSingle: async (tripId: string, transactionId: string): Promise<ApiResponse<{ transaction: any; settlement: ISettlement }>> => {
    return apiClient.post(`/settlements/trip/${tripId}/transactions/${transactionId}/settle`);
  },

  settleAll: async (tripId: string): Promise<ApiResponse<{ settlement: ISettlement; isFullySettled: boolean }>> => {
    return apiClient.post(`/settlements/trip/${tripId}/settle-all`);
  },

  getMySettlements: async (): Promise<ApiResponse<any>> => {
    return apiClient.get('/settlements/mine');
  },

  getSummary: async (tripId: string): Promise<ApiResponse<any>> => {
    return apiClient.get(`/settlements/trip/${tripId}/summary`);
  },

  exportSettlement: async (tripId: string, format: 'json' | 'csv' = 'json'): Promise<ApiResponse<any>> => {
    return apiClient.get(`/settlements/trip/${tripId}/export`, { params: { format } });
  },

  getSettlementHistory: async (tripId: string): Promise<ApiResponse<any>> => {
    return apiClient.get(`/settlements/trip/${tripId}/history`);
  },
};
