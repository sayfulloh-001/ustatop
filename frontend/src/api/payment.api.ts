import { apiClient } from './client';

export interface PaymentStatus {
  required: boolean;
  paid: boolean;
  paymeEnabled: boolean;
  paymeUrl?: string;
  payment?: {
    id: string;
    merchantTransId: string;
    amount: number;
    status: string;
  };
}

export const paymentApi = {
  /**
   * Foydalanuvchining to'lov holati
   */
  getStatus: async (): Promise<{ success: boolean } & PaymentStatus> => {
    const res = await apiClient.get('/payment/status');
    return res.data;
  },
};
