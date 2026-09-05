import { apiClient } from './client';
import { User, MasterProfile } from '../types';

export const userApi = {
  getProfile: async (): Promise<{ success: boolean; user: User }> => {
    const res = await apiClient.get('/users/profile');
    return res.data;
  },

  updateProfile: async (data: {
    firstName?: string | null;
    lastName?: string | null;
    age?: number | null;
    avatarUrl?: string | null;
  }): Promise<{ success: boolean; user: User; message: string }> => {
    const res = await apiClient.patch('/users/profile', data);
    return res.data;
  },

  getFavorites: async (): Promise<{ success: boolean; favorites: MasterProfile[] }> => {
    const res = await apiClient.get('/users/favorites');
    return res.data;
  },

  toggleFavorite: async (masterId: string): Promise<{ success: boolean; isFavorite: boolean; message: string }> => {
    const res = await apiClient.post(`/users/favorites/${masterId}`);
    return res.data;
  },
};
