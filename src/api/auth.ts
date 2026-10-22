import apiClient, { ApiResponse } from './client';
import { IUser } from '@/types/user.types';
import { TokenPair, Session, AuthResult } from '@/types/auth.types';

export const authApi = {
  register: async (idToken: string, metadata?: { name?: string; phone?: string; displayName?: string }): Promise<ApiResponse<AuthResult>> => {
    return apiClient.post('/auth/register', { idToken, metadata });
  },

  login: async (idToken: string): Promise<ApiResponse<AuthResult>> => {
    return apiClient.post('/auth/login', { idToken });
  },

  forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
    return apiClient.post('/auth/send-password-reset', { email });
  },

  sendVerificationEmail: async (email: string): Promise<ApiResponse<void>> => {
    return apiClient.post('/auth/send-verification-email', { email });
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<TokenPair>> => {
    return apiClient.post('/auth/refresh-token', { refreshToken });
  },

  logout: async (refreshToken?: string): Promise<ApiResponse<void>> => {
    return apiClient.post('/auth/logout', { refreshToken });
  },

  logoutAll: async (): Promise<ApiResponse<void>> => {
    return apiClient.post('/auth/logout-all');
  },

  getSessions: async (): Promise<ApiResponse<{ sessions: Session[] }>> => {
    return apiClient.get('/auth/sessions');
  },

  getProfile: async (): Promise<ApiResponse<{ user: IUser }>> => {
    return apiClient.get('/auth/me');
  },

  updateProfile: async (data: Partial<IUser>): Promise<ApiResponse<{ user: IUser }>> => {
    return apiClient.patch('/auth/me', data);
  },

  setUpiId: async (upiId: string): Promise<ApiResponse<{ user: IUser }>> => {
    return apiClient.put('/auth/me/upi', { upiId });
  },

  verifyUpi: async (): Promise<ApiResponse<{ upiVerified: boolean }>> => {
    return apiClient.post('/auth/me/upi/verify');
  },

  deleteAccount: async (): Promise<ApiResponse<void>> => {
    return apiClient.delete('/auth/me');
  },
};
