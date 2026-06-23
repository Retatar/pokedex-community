import apiClient from './client';
import { ApiResponse } from '../../types/auth.types';

export interface TeamPokemon {
  id: number;
  team_id: number;
  pokemon_id: number;
  pokemon_name: string;
  pokemon_sprite: string;
  slot: number;
}

export interface Team {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  pokemon?: TeamPokemon[];
  created_at: string;
  updated_at: string;
}

export const teamsService = {
  async getTeams(): Promise<Team[]> {
    try {
      const response = await apiClient.get<ApiResponse<Team[]>>('/teams');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },

  async getTeamDetail(teamId: number): Promise<Team> {
    try {
      const response = await apiClient.get<ApiResponse<Team>>(`/teams/${teamId}`);
      return response.data.data!;
    } catch (error) {
      console.error('Error fetching team detail:', error);
      throw error;
    }
  },

  async createTeam(name: string, description?: string): Promise<Team> {
    try {
      const response = await apiClient.post<ApiResponse<Team>>('/teams', {
        name,
        description,
      });
      return response.data.data!;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },

  async updateTeam(teamId: number, name?: string, description?: string): Promise<Team> {
    try {
      const response = await apiClient.put<ApiResponse<Team>>(`/teams/${teamId}`, {
        name,
        description,
      });
      return response.data.data!;
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  },

  async deleteTeam(teamId: number): Promise<void> {
    try {
      await apiClient.delete(`/teams/${teamId}`);
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  },

  async addPokemonToTeam(
    teamId: number,
    pokemon_id: number,
    pokemon_name: string,
    pokemon_sprite: string,
    slot: number
  ): Promise<TeamPokemon> {
    try {
      const response = await apiClient.post<ApiResponse<TeamPokemon>>(
        `/teams/${teamId}/pokemon`,
        {
          pokemon_id,
          pokemon_name,
          pokemon_sprite,
          slot,
        }
      );
      return response.data.data!;
    } catch (error) {
      console.error('Error adding pokemon to team:', error);
      throw error;
    }
  },

  async removePokemonFromTeam(teamId: number, pokemonId: number): Promise<void> {
    try {
      await apiClient.delete(`/teams/${teamId}/pokemon/${pokemonId}`);
    } catch (error) {
      console.error('Error removing pokemon from team:', error);
      throw error;
    }
  },
};
