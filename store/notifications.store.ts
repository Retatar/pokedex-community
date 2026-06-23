import { create } from 'zustand';
import { Notification, notificationsService } from '../services/api/notifications.service';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  total: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (unreadOnly = false) => {
    set({ isLoading: true, error: null });
    try {
      // For MVP, we fetch the first page fully. 
      // Pagination can be added by expanding this method.
      const data = await notificationsService.getNotifications(1, 50, unreadOnly);
      set({ 
        notifications: data.notifications, 
        unreadCount: data.unreadCount,
        total: data.total
      });
    } catch (error: any) {
      set({ error: error.message || 'Gagal memuat notifikasi' });
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: number) => {
    // Optimistic update
    const previousNotifications = get().notifications;
    const previousUnreadCount = get().unreadCount;

    set({
      notifications: previousNotifications.map(n => n.id === id ? { ...n, is_read: 1 } : n),
      unreadCount: Math.max(0, previousUnreadCount - 1)
    });

    try {
      await notificationsService.markAsRead(id);
    } catch (error) {
      // Rollback
      set({ notifications: previousNotifications, unreadCount: previousUnreadCount });
      console.error(error);
    }
  },

  markAllAsRead: async () => {
    // Optimistic update
    const previousNotifications = get().notifications;

    set({
      notifications: previousNotifications.map(n => ({ ...n, is_read: 1 })),
      unreadCount: 0
    });

    try {
      await notificationsService.markAllAsRead();
    } catch (error) {
      // Rollback
      set({ notifications: previousNotifications, unreadCount: get().unreadCount });
      console.error(error);
    }
  },
}));
