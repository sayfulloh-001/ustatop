import { apiClient } from './client';

export const uploadApi = {
  uploadImage: async (file: File, type: 'avatars' | 'masters' | 'products' = 'avatars'): Promise<{ success: boolean; url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    const res = await apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  },
};
