import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string | null;
  type: ToastType;
  isVisible: boolean;
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'info',
  isVisible: false,
  showToast: (message, type = 'info', duration = 3000) => {
    set({ message, type, isVisible: true });

    // Auto hide
    setTimeout(() => {
      set({ isVisible: false });
    }, duration);
  },
  hideToast: () => set({ isVisible: false }),
}));
