import apiClient, { ApiResponse } from './client';

export const receiptsApi = {
  uploadReceipt: async (file: File, tripId?: string, expenseId?: string): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('receipt', file);
    if (tripId) formData.append('tripId', tripId);
    if (expenseId) formData.append('expenseId', expenseId);
    return apiClient.upload('/receipts/upload', formData);
  },

  getReceipts: async (params?: Record<string, any>): Promise<ApiResponse<any>> => {
    return apiClient.get('/receipts', { params });
  },

  getTripReceipts: async (tripId: string): Promise<ApiResponse<any>> => {
    return apiClient.get(`/receipts/trip/${tripId}`);
  },

  getReceipt: async (receiptId: string): Promise<ApiResponse<any>> => {
    return apiClient.get(`/receipts/${receiptId}`);
  },
};
