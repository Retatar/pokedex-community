import { create } from 'zustand';
import { Favorite, favoritesService } from '../services/api/favorites.service';
import { useToastStore } from './toast.store';

interface FavoriteState {
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;

  fetchFavorites: () => Promise<void>;
  addFavorite: (pokemonId: number, name: string, sprite: string) => Promise<void>;
  removeFavorite: (pokemonId: number) => Promise<void>; // Operates on pokemon_id for optimistic UI
  isFavorite: (pokemonId: number) => boolean;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  isLoading: false,
  error: null,

  fetchFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const favorites = await favoritesService.getFavorites();
      set({ favorites });
    } catch (error: any) {
      set({ error: error.message || 'Gagal memuat favorit' });
    } finally {
      set({ isLoading: false });
    }
  },

  addFavorite: async (pokemonId: number, name: string, sprite: string) => {
    const previousFavorites = get().favorites;
    
    // Optimistic Update
    const optimisticFavorite: Favorite = {
      id: Date.now(), // Temporary ID
      user_id: 0,
      pokemon_id: pokemonId,
      pokemon_name: name,
      pokemon_sprite: sprite,
      created_at: new Date().toISOString(),
    };
    
    set({ favorites: [...previousFavorites, optimisticFavorite] });

    try {
      const newFavorite = await favoritesService.addFavorite(pokemonId, name, sprite);
      // Replace temporary with real data
      set({
        favorites: get().favorites.map(f => f.id === optimisticFavorite.id ? newFavorite : f)
      });
      useToastStore.getState().showToast(`${name} ditambahkan ke favorit!`, 'success');
    } catch (error: any) {
      // Rollback on failure
      set({ favorites: previousFavorites, error: error.response?.data?.message || 'Gagal menambahkan favorit' });
      useToastStore.getState().showToast('Gagal menambahkan ke favorit', 'error');
    }
  },

  removeFavorite: async (pokemonId: number) => {
    const previousFavorites = get().favorites;
    const favoriteToRemove = previousFavorites.find(f => f.pokemon_id === pokemonId);

    if (!favoriteToRemove) return;

    // Optimistic Update
    set({ favorites: previousFavorites.filter(f => f.pokemon_id !== pokemonId) });

    try {
      await favoritesService.removeFavorite(favoriteToRemove.id);
      useToastStore.getState().showToast('Dihapus dari favorit', 'success');
    } catch (error: any) {
      // Rollback on failure
      set({ favorites: previousFavorites, error: error.response?.data?.message || 'Gagal menghapus favorit' });
      useToastStore.getState().showToast('Gagal menghapus favorit', 'error');
    }
  },

  isFavorite: (pokemonId: number) => {
    return get().favorites.some(f => f.pokemon_id === pokemonId);
  },

  clearFavorites: () => {
    set({ favorites: [], error: null });
  }
}));
