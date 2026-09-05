import { apiClient } from './client';
import { User } from '../types';

export const authApi = {
  requestOtp: async (phone: string): Promise<{ success: boolean; message: string; devOtp?: string }> => {
    const res = await apiClient.post('/auth/request-otp', { phone });
    return res.data;
  },

  // token is now in HTTP-only cookie — no token field in response
  verifyOtp: async (phone: string, code: string): Promise<{ success: boolean; user: User }> => {
    const res = await apiClient.post('/auth/verify-otp', { phone, code });
    return res.data;
  },

  adminLogin: async (secretKey: string, phone?: string): Promise<{ success: boolean; user: User }> => {
    const res = await apiClient.post('/auth/admin-login', { secretKey, phone });
    return res.data;
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  logout: async (): Promise<{ success: boolean }> => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
};
