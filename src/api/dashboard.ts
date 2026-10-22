import apiClient, { ApiResponse } from './client';

export interface DashboardData {
  stats?: {
    totalSpent?: number;
    activeTripsCount?: number;
    totalTripsCount?: number;
    pendingSettlementsCount?: number;
    netBalance?: number;
  };
  activeTrips?: any[];
  recentExpenses?: any[];
  pendingSettlements?: any[];
  user?: any;
}

export const dashboardApi = {
  getDashboard: async (params?: Record<string, any>): Promise<ApiResponse<DashboardData>> => {
    return apiClient.get('/dashboard', { params });
  },
};
