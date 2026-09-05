import { apiClient } from './client';
import { DashboardStats, MasterProfile, Product, User, Pagination } from '../types';

export const adminApi = {
  getDashboardStats: async (): Promise<{ success: boolean; stats: DashboardStats }> => {
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  },

  getMasterApplications: async (
    status?: string,
    page?: number,
    limit?: number
  ): Promise<{ masters: MasterProfile[]; pagination: Pagination }> => {
    const res = await apiClient.get('/admin/masters', { params: { status, page, limit } });
    return res.data;
  },

  approveMaster: async (id: string): Promise<{ success: boolean; master: MasterProfile; message: string }> => {
    const res = await apiClient.patch(`/admin/masters/${id}/approve`);
    return res.data;
  },

  rejectMaster: async (id: string): Promise<{ success: boolean; master: MasterProfile; message: string }> => {
    const res = await apiClient.patch(`/admin/masters/${id}/reject`);
    return res.data;
  },

  getProducts: async (
    query?: string,
    category?: string,
    page?: number,
    limit?: number
  ): Promise<{ products: Product[]; pagination: Pagination }> => {
    const res = await apiClient.get('/admin/products', { params: { query, category, page, limit } });
    return res.data;
  },

  createProduct: async (data: Partial<Product>): Promise<{ success: boolean; product: Product; message: string }> => {
    const res = await apiClient.post('/admin/products', data);
    return res.data;
  },

  updateProduct: async (
    id: string,
    data: Partial<Product>
  ): Promise<{ success: boolean; product: Product; message: string }> => {
    const res = await apiClient.patch(`/admin/products/${id}`, data);
    return res.data;
  },

  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(`/admin/products/${id}`);
    return res.data;
  },

  getUsers: async (page?: number, limit?: number): Promise<{ users: User[]; pagination: Pagination }> => {
    const res = await apiClient.get('/admin/users', { params: { page, limit } });
    return res.data;
  },

  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(`/admin/users/${id}`);
    return res.data;
  },
};
