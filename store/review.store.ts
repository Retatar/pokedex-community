import { create } from 'zustand';
import { Review, reviewsService } from '../services/api/reviews.service';
import { useToastStore } from './toast.store';

interface ReviewState {
  reviews: Record<number, Review[]>; // Key is pokemon_id
  stats: Record<number, { averageRating: number; totalReviews: number }>; // Key is pokemon_id
  isLoading: boolean;
  error: string | null;

  fetchReviews: (pokemonId: number) => Promise<void>;
  createReview: (pokemonId: number, pokemonName: string, rating: number, comment: string) => Promise<Review | null>;
  updateReview: (pokemonId: number, reviewId: number, rating?: number, comment?: string) => Promise<void>;
  deleteReview: (pokemonId: number, reviewId: number) => Promise<void>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: {},
  stats: {},
  isLoading: false,
  error: null,

  fetchReviews: async (pokemonId: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await reviewsService.getReviews(pokemonId);
      
      set((state) => ({
        reviews: { ...state.reviews, [pokemonId]: data.reviews },
        stats: { ...state.stats, [pokemonId]: { averageRating: data.averageRating, totalReviews: data.totalReviews } },
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Gagal memuat ulasan' });
    } finally {
      set({ isLoading: false });
    }
  },

  createReview: async (pokemonId, pokemonName, rating, comment) => {
    set({ isLoading: true, error: null });
    try {
      const newReview = await reviewsService.createReview(pokemonId, pokemonName, rating, comment);
      
      const currentReviews = get().reviews[pokemonId] || [];
      const updatedReviews = [newReview, ...currentReviews];
      
      // Calculate new average
      const sum = updatedReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const newAverage = sum / updatedReviews.length;

      set((state) => ({
        reviews: { ...state.reviews, [pokemonId]: updatedReviews },
        stats: { ...state.stats, [pokemonId]: { averageRating: newAverage, totalReviews: updatedReviews.length } },
      }));
      useToastStore.getState().showToast('Review berhasil ditambahkan', 'success');
      return newReview;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Gagal membuat ulasan' });
      useToastStore.getState().showToast('Gagal menambahkan review', 'error');
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateReview: async (pokemonId, reviewId, rating, comment) => {
    set({ isLoading: true, error: null });
    try {
      const updatedReview = await reviewsService.updateReview(reviewId, rating, comment);

      const currentReviews = get().reviews[pokemonId] || [];
      const updatedReviews = currentReviews.map(r => r.id === reviewId ? updatedReview : r);

      // Calculate new average
      const sum = updatedReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const newAverage = sum / updatedReviews.length;

      set((state) => ({
        reviews: { ...state.reviews, [pokemonId]: updatedReviews },
        stats: { ...state.stats, [pokemonId]: { averageRating: newAverage, totalReviews: updatedReviews.length } },
      }));
      useToastStore.getState().showToast('Review berhasil diperbarui', 'success');
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Gagal mengupdate ulasan' });
      useToastStore.getState().showToast('Gagal mengupdate review', 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteReview: async (pokemonId, reviewId) => {
    set({ isLoading: true, error: null });
    try {
      await reviewsService.deleteReview(reviewId);

      const currentReviews = get().reviews[pokemonId] || [];
      const updatedReviews = currentReviews.filter(r => r.id !== reviewId);

      // Calculate new average
      let newAverage = 0;
      if (updatedReviews.length > 0) {
        const sum = updatedReviews.reduce((acc, curr) => acc + curr.rating, 0);
        newAverage = sum / updatedReviews.length;
      }

      set((state) => ({
        reviews: { ...state.reviews, [pokemonId]: updatedReviews },
        stats: { ...state.stats, [pokemonId]: { averageRating: newAverage, totalReviews: updatedReviews.length } },
      }));
      useToastStore.getState().showToast('Review dihapus', 'success');
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Gagal menghapus ulasan' });
      useToastStore.getState().showToast('Gagal menghapus review', 'error');
    } finally {
      set({ isLoading: false });
    }
  },
}));
