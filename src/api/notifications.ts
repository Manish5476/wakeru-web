import apiClient, { ApiResponse } from './client';

export interface NotificationItem {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getNotifications: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<ApiResponse<{ notifications: NotificationItem[]; unreadCount?: number }>> => {
    return apiClient.get('/notifications', { params });
  },

  getUnreadCount: async (): Promise<ApiResponse<{ unreadCount: number }>> => {
    return apiClient.get('/notifications/unread-count');
  },

  markAsRead: async (notificationId: string): Promise<ApiResponse<void>> => {
    return apiClient.post(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    return apiClient.post('/notifications/read-all');
  },

  markAsReadByType: async (type: string): Promise<ApiResponse<void>> => {
    return apiClient.post('/notifications/read-by-type', { type });
  },

  deleteNotification: async (notificationId: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/notifications/${notificationId}`);
  },

  clearAll: async (): Promise<ApiResponse<void>> => {
    return apiClient.delete('/notifications/clear-all');
  },
};
