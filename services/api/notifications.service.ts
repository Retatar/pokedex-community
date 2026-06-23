import apiClient from './client';
import { ApiResponse } from '../../types/auth.types';

export interface Notification {
  id: number;
  user_id: number;
  type: 'review' | 'team';
  title: string;
  message: string;
  is_read: number;
  reference_id?: number;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export const notificationsService = {
  async getNotifications(page = 1, limit = 20, unreadOnly = false): Promise<NotificationsResponse> {
    try {
      const response = await apiClient.get<ApiResponse<NotificationsResponse>>('/notifications', {
        params: { page, limit, unread_only: unreadOnly }
      });
      return response.data.data!;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  async markAsRead(id: number): Promise<void> {
    try {
      await apiClient.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.put('/notifications/read-all');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
};
