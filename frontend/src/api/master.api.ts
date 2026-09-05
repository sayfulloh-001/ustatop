import { apiClient } from './client';
import { MasterProfile, Pagination } from '../types';

export interface GetMastersParams {
  query?: string;
  profession?: string;
  city?: string;
  minExperience?: number;
  page?: number;
  limit?: number;
}

export const masterApi = {
  getMasters: async (params?: GetMastersParams): Promise<{ masters: MasterProfile[]; pagination: Pagination }> => {
    const res = await apiClient.get('/masters', { params });
    return res.data;
  },

  getMasterById: async (id: string): Promise<{ master: MasterProfile }> => {
    const res = await apiClient.get(`/masters/${id}`);
    return res.data;
  },

  applyForMaster: async (data: {
    firstName: string;
    lastName: string;
    profession: string;
    experienceYears: number;
    age: number;
    description: string;
    city: string;
    district?: string | null;
    profileImageUrl?: string | null;
  }): Promise<{ success: boolean; masterProfile: MasterProfile; message: string }> => {
    const res = await apiClient.post('/masters/apply', data);
    return res.data;
  },

  getMyStatus: async (): Promise<{ hasApplied: boolean; status: string; profile?: MasterProfile }> => {
    const res = await apiClient.get('/masters/my-status');
    return res.data;
  },
};
