import pokeApiClient from './pokeapi.client';
import { Pokemon, PokemonDetail, EvolutionChainLink } from '../../types/pokemon.types';

// Helper untuk membangun URL sprite yang aman (menggunakan official-artwork yang kualitasnya lebih baik)
const getSpriteUrl = (id: string | number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export const pokeApiService = {
  async getPokemons(limit: number = 20, offset: number = 0): Promise<{ results: Pokemon[]; count: number }> {
    try {
      const response = await pokeApiClient.get('/pokemon', { params: { limit, offset } });
      const results = response.data.results.map((p: any) => {
        const id = p.url.split('/').filter(Boolean).pop();
        return {
          id,
          name: p.name,
          sprite: getSpriteUrl(id),
          types: [],
        };
      });
      return { results, count: response.data.count };
    } catch (error) {
      console.error('Error fetching pokemons:', error);
      throw error;
    }
  },

  async getPokemonDetail(idOrName: string | number): Promise<PokemonDetail> {
    try {
      const response = await pokeApiClient.get(`/pokemon/${idOrName}`);
      const data = response.data;

      return {
        id: data.id,
        name: data.name,
        sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
        types: data.types.map((t: any) => t.type.name),
        height: data.height,
        weight: data.weight,
        abilities: data.abilities.map((a: any) => ({
          name: a.ability.name,
          url: a.ability.url,
          is_hidden: a.is_hidden,
        })),
        stats: data.stats.map((s: any) => ({
          name: s.stat.name,
          base_stat: s.base_stat,
          effort: s.effort,
        })),
        cries: data.cries,
        moves: (data.moves || []).slice(0, 30).map((m: any) => {
          const details = m.version_group_details?.[0] || {};
          return {
            name: m.move.name,
            levelLearnedAt: details.level_learned_at || 0,
            method: details.move_learn_method?.name || 'unknown',
          };
        }),
        evolution_chain_url: '', // Akan di-fetch dari species
      };
    } catch (error) {
      console.error('Error fetching pokemon detail:', error);
      throw error;
    }
  },

  async getPokemonSpecies(idOrName: string | number): Promise<any> {
    try {
      const response = await pokeApiClient.get(`/pokemon-species/${idOrName}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pokemon species:', error);
      throw error;
    }
  },

  async getPokemonEncounters(idOrName: string | number): Promise<any[]> {
    try {
      const response = await pokeApiClient.get(`/pokemon/${idOrName}/encounters`);
      return response.data;
    } catch (error) {
      console.error('Error fetching encounters:', error);
      return [];
    }
  },

  async getEvolutionChain(chainUrl: string): Promise<EvolutionChainLink> {
    try {
      const chainId = chainUrl.split('/').filter(Boolean).pop();
      const response = await pokeApiClient.get(`/evolution-chain/${chainId}`);
      return this.parseEvolutionChain(response.data.chain);
    } catch (error) {
      console.error('Error fetching evolution chain:', error);
      throw error;
    }
  },

  parseEvolutionChain(chain: any): EvolutionChainLink {
    const speciesId = parseInt(chain.species.url.split('/').filter(Boolean).pop());
    return {
      species_name: chain.species.name,
      species_id: speciesId,
      min_level: chain.evolution_details[0]?.min_level || null,
      trigger_name: chain.evolution_details[0]?.trigger.name || 'unknown',
      item: chain.evolution_details[0]?.item?.name || null,
      known_move: chain.evolution_details[0]?.known_move?.name || null,
      sprites: getSpriteUrl(speciesId),
      evolution_details: chain.evolution_details[0] ? JSON.stringify(chain.evolution_details[0]) : null,
      evolves_to: chain.evolves_to.map((e: any) => this.parseEvolutionChain(e)),
    };
  },

  async getAbility(nameOrUrl: string): Promise<any> {
    try {
      const response = await pokeApiClient.get(`/ability/${nameOrUrl}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ability:', error);
      throw error;
    }
  },

  async searchPokemon(query: string): Promise<Pokemon[]> {
    try {
      // PokeAPI doesn't support fuzzy search, so fetch all and filter locally
      // For better UX, limit to first 150 (Gen 1) for MVP
      const response = await pokeApiClient.get('/pokemon', { params: { limit: 150 } });
      return response.data.results
        .filter((p: any) => p.name.toLowerCase().includes(query.toLowerCase()))
        .map((p: any) => {
          const id = p.url.split('/').filter(Boolean).pop();
          return {
            id,
            name: p.name,
            sprite: getSpriteUrl(id),
            types: [],
          };
        });
    } catch (error) {
      console.error('Error searching pokemon:', error);
      throw error;
    }
  },

  async getPokemonsByType(typeName: string): Promise<Pokemon[]> {
    try {
      const response = await pokeApiClient.get(`/type/${typeName}`);
      return response.data.pokemon.map((p: any) => {
        const id = p.pokemon.url.split('/').filter(Boolean).pop();
        return {
          id,
          name: p.pokemon.name,
          sprite: getSpriteUrl(id),
          types: [typeName],
        };
      });
    } catch (error) {
      console.error('Error fetching pokemons by type:', error);
      throw error;
    }
  },
};
