import apiClient, { ApiResponse } from './client';
import { IUser, IUserPreferences, IBankingDetails } from '@/types/user.types';

export const usersApi = {
  getPreferences: async (): Promise<ApiResponse<{ preferences: IUserPreferences }>> => {
    return apiClient.get('/users/preferences');
  },

  updatePreferences: async (data: Partial<IUserPreferences>): Promise<ApiResponse<{ user: IUser }>> => {
    return apiClient.put('/users/preferences', data);
  },

  updateBankingDetails: async (data: IBankingDetails): Promise<ApiResponse<{ user: IUser }>> => {
    return apiClient.put('/users/banking', data);
  },

  uploadProfilePicture: async (file: File): Promise<ApiResponse<{ photoURL: string }>> => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return apiClient.upload('/users/profile-picture', formData);
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    return apiClient.get('/users/stats');
  },

  searchUsers: async (query: string, page = 1, limit = 10): Promise<ApiResponse<any>> => {
    return apiClient.get('/users/search', { params: { query, page, limit } });
  },

  getPublicProfile: async (userId: string): Promise<ApiResponse<{ user: IUser }>> => {
    return apiClient.get(`/users/${userId}`);
  },
};
