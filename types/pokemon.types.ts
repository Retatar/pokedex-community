export interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

export interface PokemonDetail extends Pokemon {
  height: number;
  weight: number;
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  evolution_chain_url: string;
  cries?: {
    latest: string;
    legacy: string;
  };
  moves?: PokemonMove[];
}

export interface PokemonAbility {
  name: string;
  url: string;
  is_hidden: boolean;
}

export interface PokemonStat {
  name: string;
  base_stat: number;
  effort: number;
}

export interface PokemonMove {
  name: string;
  levelLearnedAt: number;
  method: string; // 'level-up', 'machine', 'egg', etc.
}

export interface EvolutionChainLink {
  species_name: string;
  species_id: number;
  min_level: number | null;
  trigger_name: string;
  item: string | null;
  known_move: string | null;
  sprites: string | null;
  evolution_details: string | null;
  evolves_to: EvolutionChainLink[];
}
