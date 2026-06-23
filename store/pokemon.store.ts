import { create } from 'zustand';
import { Pokemon, PokemonDetail } from '../types/pokemon.types';
import { pokeApiService } from '../services/pokeapi/pokeapi.service';

export type SortOption = 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc';

interface PokemonState {
  pokemons: Pokemon[];
  selectedPokemon: PokemonDetail | null;
  isLoading: boolean;
  page: number;
  hasMore: boolean;
  searchQuery: string;
  activeFilters: string[]; // selected types
  sortBy: SortOption;
  totalCount: number;
  error: string | null;

  fetchPokemons: (reset?: boolean) => Promise<void>;
  fetchPokemonDetail: (id: number | string) => Promise<void>;
  searchPokemon: (query: string) => Promise<void>;
  setFilterAndSort: (types: string[], sort: SortOption) => Promise<void>;
  clearSelected: () => void;
}

export const usePokemonStore = create<PokemonState>((set, get) => ({
  pokemons: [],
  selectedPokemon: null,
  isLoading: false,
  page: 0,
  hasMore: true,
  searchQuery: '',
  activeFilters: [],
  sortBy: 'id-asc',
  totalCount: 0,
  error: null,

  fetchPokemons: async (reset = false) => {
    const { page, pokemons, isLoading, hasMore, activeFilters, sortBy } = get();

    if (isLoading || (!hasMore && !reset)) return;

    set({ isLoading: true, error: null });

    try {
      const currentPage = reset ? 0 : page;
      const limit = 20;
      const offset = currentPage * limit;

      let newPokemons: Pokemon[] = [];
      let nextHasMore = true;
      let totalCount = get().totalCount;

      if (activeFilters.length > 0) {
        newPokemons = await pokeApiService.getPokemonsByType(activeFilters[0]);
        totalCount = newPokemons.length;
      } else if (sortBy !== 'id-asc') {
        // Jika kita mau sort custom, kita harus ambil bulk data dulu (misal 150)
        // karena API pagination default hanya sort ID asc
        const { results } = await pokeApiService.getPokemons(150, 0);
        newPokemons = results;
        totalCount = 150;
      } else {
        const { results, count } = await pokeApiService.getPokemons(limit, offset);
        newPokemons = results;
        totalCount = count;
      }

      // Sort data
      if (sortBy === 'id-desc') {
        newPokemons.sort((a, b) => Number(b.id) - Number(a.id));
      } else if (sortBy === 'name-asc') {
        newPokemons.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'name-desc') {
        newPokemons.sort((a, b) => b.name.localeCompare(a.name));
      }

      // Pagination slice for custom sort/filter
      if (activeFilters.length > 0 || sortBy !== 'id-asc') {
        nextHasMore = offset + limit < totalCount;
        newPokemons = newPokemons.slice(offset, offset + limit);
      } else {
        nextHasMore = offset + limit < totalCount;
      }

      // Fetch detailed info to get types
      const detailedResults = await Promise.all(
        newPokemons.map(async (p) => {
          try {
            const detail = await pokeApiService.getPokemonDetail(p.name);
            return { ...p, types: detail.types };
          } catch (err) {
            return p; // fallback
          }
        })
      );

      set({
        pokemons: reset ? detailedResults : [...pokemons, ...detailedResults],
        page: currentPage + 1,
        hasMore: nextHasMore,
        totalCount,
        searchQuery: '',
      });
    } catch (error: any) {
      console.error('Error fetching pokemons state:', error);
      set({ error: error.message || 'Gagal memuat daftar Pokémon' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPokemonDetail: async (id: number | string) => {
    // Check if it's already selected
    if (get().selectedPokemon?.id.toString() === id.toString() || get().selectedPokemon?.name === id) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const detail = await pokeApiService.getPokemonDetail(id);
      const species = await pokeApiService.getPokemonSpecies(id);

      detail.evolution_chain_url = species.evolution_chain?.url || '';

      set({ selectedPokemon: detail });
    } catch (error: any) {
      console.error('Error fetching pokemon detail state:', error);
      set({ error: error.message || 'Gagal memuat detail Pokémon' });
    } finally {
      set({ isLoading: false });
    }
  },

  searchPokemon: async (query: string) => {
    if (!query) {
      set({ searchQuery: '' });
      await get().fetchPokemons(true);
      return;
    }

    set({ isLoading: true, searchQuery: query });
    try {
      const results = await pokeApiService.searchPokemon(query);
      
      // Fetch detailed info to get types
      const detailedResults = await Promise.all(
        results.map(async (p) => {
          try {
            const detail = await pokeApiService.getPokemonDetail(p.name);
            return { ...p, types: detail.types };
          } catch (err) {
            return p;
          }
        })
      );

      set({
        pokemons: detailedResults,
        page: 0,
        hasMore: false,
      });
    } catch (error) {
      console.error('Error searching pokemon state:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setFilterAndSort: async (types: string[], sort: SortOption) => {
    set({ activeFilters: types, sortBy: sort, searchQuery: '' });
    await get().fetchPokemons(true);
  },

  clearSelected: () => {
    set({ selectedPokemon: null });
  },
}));
