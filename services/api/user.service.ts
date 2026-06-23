import apiClient from './client';
import { ApiResponse, User } from '../../types/auth.types';
import { useAuthStore } from '../../store/auth.store';
import { API_BASE_URL } from '../../constants/config';

export const userService = {
  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/users/profile');
      return response.data.data!;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async updateProfile(data: any): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>('/users/profile', data);
      return response.data.data!;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
};
