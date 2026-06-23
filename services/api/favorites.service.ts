import apiClient from './client';
import { ApiResponse } from '../../types/auth.types';

export interface Favorite {
  id: number;
  user_id: number;
  pokemon_id: number;
  pokemon_name: string;
  pokemon_sprite: string;
  created_at: string;
}

export const favoritesService = {
  async getFavorites(): Promise<Favorite[]> {
    try {
      const response = await apiClient.get<ApiResponse<Favorite[]>>('/favorites');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  async addFavorite(pokemon_id: number, pokemon_name: string, pokemon_sprite: string): Promise<Favorite> {
    try {
      const response = await apiClient.post<ApiResponse<Favorite>>('/favorites', {
        pokemon_id,
        pokemon_name,
        pokemon_sprite,
      });
      return response.data.data!;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  },

  async removeFavorite(favoriteId: number): Promise<void> {
    try {
      await apiClient.delete(`/favorites/${favoriteId}`);
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  },

  async isFavorite(pokemonId: number, favorites: Favorite[]): Promise<boolean> {
    return favorites.some(f => f.pokemon_id === pokemonId);
  },
};
