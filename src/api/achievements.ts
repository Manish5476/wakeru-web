import apiClient, { ApiResponse } from './client';

export const achievementsApi = {
  getAchievements: async (): Promise<ApiResponse<any>> => {
    return apiClient.get('/achievements');
  },

  getLeaderboard: async (tripId: string): Promise<ApiResponse<any>> => {
    return apiClient.get(`/achievements/leaderboard/${tripId}`);
  },
};
