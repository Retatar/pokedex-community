import apiClient from './client';
import { ApiResponse } from '../../types/auth.types';

export interface Review {
  id: number;
  user_id: number;
  user_name: string;
  avatar_url?: string;
  pokemon_id: number;
  pokemon_name: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewStats {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export const reviewsService = {
  async getReviews(pokemonId: number): Promise<ReviewStats> {
    try {
      const response = await apiClient.get<ApiResponse<ReviewStats>>(`/reviews?pokemon_id=${pokemonId}`);
      return response.data.data!;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  async getAllReviews(): Promise<Review[]> {
    try {
      const response = await apiClient.get<ApiResponse<ReviewStats>>('/reviews');
      return response.data.data?.reviews || [];
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      throw error;
    }
  },

  async createReview(pokemon_id: number, pokemon_name: string, rating: number, comment: string): Promise<Review> {
    try {
      const response = await apiClient.post<ApiResponse<Review>>('/reviews', {
        pokemon_id,
        pokemon_name,
        rating,
        comment,
      });
      return response.data.data!;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  async updateReview(reviewId: number, rating?: number, comment?: string): Promise<Review> {
    try {
      const response = await apiClient.put<ApiResponse<Review>>(`/reviews/${reviewId}`, {
        rating,
        comment,
      });
      return response.data.data!;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  async deleteReview(reviewId: number): Promise<void> {
    try {
      await apiClient.delete(`/reviews/${reviewId}`);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },
};
