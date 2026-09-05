import { apiClient } from './client';
import { Product, Pagination } from '../types';

export interface GetProductsParams {
  query?: string;
  category?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

export const productApi = {
  getProducts: async (params?: GetProductsParams): Promise<{ products: Product[]; pagination: Pagination }> => {
    const res = await apiClient.get('/products', { params });
    return res.data;
  },

  getProductById: async (id: string): Promise<{ product: Product }> => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },
};
