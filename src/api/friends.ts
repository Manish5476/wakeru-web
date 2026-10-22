import apiClient, { ApiResponse } from './client';

export const friendsApi = {
  getFriends: async (search?: string): Promise<ApiResponse<{ friends: any[] }>> => {
    return apiClient.get('/friends', { params: { search } });
  },

  getPendingRequests: async (): Promise<ApiResponse<{ requests: any[] }>> => {
    return apiClient.get('/friends/requests');
  },

  sendRequest: async (toUserId: string, message?: string): Promise<ApiResponse<any>> => {
    return apiClient.post('/friends/request', { toUserId, message });
  },

  acceptRequest: async (requestId: string): Promise<ApiResponse<any>> => {
    return apiClient.post(`/friends/request/${requestId}/accept`);
  },

  declineRequest: async (requestId: string): Promise<ApiResponse<any>> => {
    return apiClient.post(`/friends/request/${requestId}/decline`);
  },

  removeFriend: async (friendUserId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/friends/${friendUserId}`);
  },

  searchUsers: async (query: string): Promise<ApiResponse<{ users: any[] }>> => {
    return apiClient.get('/friends/search', { params: { query } });
  },

  getSuggestions: async (): Promise<ApiResponse<{ suggestions: any[] }>> => {
    return apiClient.get('/friends/suggestions');
  },
};
