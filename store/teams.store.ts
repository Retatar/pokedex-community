import { create } from 'zustand';
import { Team, TeamPokemon, teamsService } from '../services/api/teams.service';
import { useToastStore } from './toast.store';

interface TeamState {
  teams: Team[];
  selectedTeam: Team | null;
  isLoading: boolean;
  error: string | null;
  selectingForTeamId: number | null;
  selectingForSlot: number | null;
  selectingForTeamName: string | null;

  fetchTeams: () => Promise<void>;
  fetchTeamDetail: (teamId: number) => Promise<void>;
  createTeam: (name: string, description?: string) => Promise<Team | null>;
  updateTeam: (teamId: number, name?: string, description?: string) => Promise<void>;
  deleteTeam: (teamId: number) => Promise<void>;
  addPokemonToTeam: (teamId: number, pokemonId: number, pokemonName: string, pokemonSprite: string, slot: number) => Promise<void>;
  removePokemonFromTeam: (teamId: number, pokemonId: number) => Promise<void>;
  clearSelected: () => void;
  setSelectingForTeam: (teamId: number | null, slot: number | null, teamName?: string | null) => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  selectedTeam: null,
  isLoading: false,
  error: null,
  selectingForTeamId: null,
  selectingForSlot: null,
  selectingForTeamName: null,

  fetchTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const teams = await teamsService.getTeams();
      set({ teams });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Gagal memuat tim' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTeamDetail: async (teamId: number) => {
    set({ isLoading: true, error: null });
    try {
      const team = await teamsService.getTeamDetail(teamId);
      set({ selectedTeam: team });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Gagal memuat detail tim' });
    } finally {
      set({ isLoading: false });
    }
  },

  createTeam: async (name: string, description?: string) => {
    set({ isLoading: true, error: null });
    try {
      const newTeam = await teamsService.createTeam(name, description);
      set({ teams: [...get().teams, newTeam] });
      useToastStore.getState().showToast('Tim berhasil dibuat!', 'success');
      return newTeam;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Gagal membuat tim' });
      useToastStore.getState().showToast('Gagal membuat tim', 'error');
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTeam: async (teamId: number, name?: string, description?: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTeam = await teamsService.updateTeam(teamId, name, description);
      set({
        teams: get().teams.map(t => t.id === teamId ? { ...t, name: updatedTeam.name, description: updatedTeam.description } : t),
        selectedTeam: get().selectedTeam?.id === teamId ? { ...get().selectedTeam!, name: updatedTeam.name, description: updatedTeam.description } : get().selectedTeam
      });
      useToastStore.getState().showToast('Tim berhasil diupdate!', 'success');
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Gagal update tim' });
      useToastStore.getState().showToast('Gagal mengupdate tim', 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTeam: async (teamId: number) => {
    set({ isLoading: true, error: null });
    try {
      await teamsService.deleteTeam(teamId);
      set({
        teams: get().teams.filter(t => t.id !== teamId),
        selectedTeam: get().selectedTeam?.id === teamId ? null : get().selectedTeam
      });
      useToastStore.getState().showToast('Tim berhasil dihapus', 'success');
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Gagal menghapus tim' });
      useToastStore.getState().showToast('Gagal menghapus tim', 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  addPokemonToTeam: async (teamId, pokemonId, pokemonName, pokemonSprite, slot) => {
    set({ isLoading: true, error: null });
    try {
      const newPokemon = await teamsService.addPokemonToTeam(teamId, pokemonId, pokemonName, pokemonSprite, slot);

      const updateTeamData = (team: Team) => {
        if (!team.pokemon) team.pokemon = [];
        // Remove existing pokemon in that slot if any
        const filteredPokemon = team.pokemon.filter(p => p.slot !== slot && p.pokemon_id !== pokemonId);
        return { ...team, pokemon: [...filteredPokemon, newPokemon] };
      };

      set({
        teams: get().teams.map(t => t.id === teamId ? updateTeamData(t) : t),
        selectedTeam: get().selectedTeam?.id === teamId ? updateTeamData(get().selectedTeam!) : get().selectedTeam
      });
      useToastStore.getState().showToast(`${pokemonName} ditambahkan ke tim!`, 'success');
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Gagal menambahkan pokemon ke tim' });
      useToastStore.getState().showToast('Gagal menambahkan ke tim', 'error');
      throw error; // Re-throw to handle in UI
    } finally {
      set({ isLoading: false });
    }
  },

  removePokemonFromTeam: async (teamId: number, pokemonId: number) => {
    set({ isLoading: true, error: null });
    try {
      await teamsService.removePokemonFromTeam(teamId, pokemonId);

      const updateTeamData = (team: Team) => ({
        ...team,
        pokemon: team.pokemon?.filter(p => p.pokemon_id !== pokemonId) || []
      });

      set({
        teams: get().teams.map(t => t.id === teamId ? updateTeamData(t) : t),
        selectedTeam: get().selectedTeam?.id === teamId ? updateTeamData(get().selectedTeam!) : get().selectedTeam
      });
      useToastStore.getState().showToast('Pokémon dikeluarkan dari tim', 'success');
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Gagal menghapus pokemon dari tim' });
      useToastStore.getState().showToast('Gagal mengeluarkan dari tim', 'error');
    } finally {
      set({ isLoading: false });
    }
  },

  clearSelected: () => {
    set({ selectedTeam: null, error: null });
  },

  setSelectingForTeam: (teamId: number | null, slot: number | null, teamName: string | null = null) => {
    set({ selectingForTeamId: teamId, selectingForSlot: slot, selectingForTeamName: teamName });
  }
}));
