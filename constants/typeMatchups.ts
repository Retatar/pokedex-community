// Type effectiveness data for Pokemon
export const TYPE_EFFECTIVENESS: Record<string, {
  strongAgainst: string[];
  weakTo: string[];
  resistantTo: string[];
}> = {
  normal: {
    strongAgainst: [],
    weakTo: ['fighting'],
    resistantTo: [],
  },
  fire: {
    strongAgainst: ['grass', 'ice', 'bug', 'steel'],
    weakTo: ['water', 'ground', 'rock'],
    resistantTo: ['grass', 'ice', 'bug', 'steel', 'fairy'],
  },
  water: {
    strongAgainst: ['fire', 'ground', 'rock'],
    weakTo: ['electric', 'grass'],
    resistantTo: ['steel', 'fire', 'water', 'ice'],
  },
  electric: {
    strongAgainst: ['water', 'flying'],
    weakTo: ['ground'],
    resistantTo: ['flying', 'steel', 'electric'],
  },
  grass: {
    strongAgainst: ['water', 'ground', 'rock'],
    weakTo: ['fire', 'ice', 'poison', 'flying', 'bug'],
    resistantTo: ['ground', 'water', 'grass', 'electric'],
  },
  ice: {
    strongAgainst: ['flying', 'ground', 'grass', 'dragon'],
    weakTo: ['fire', 'fighting', 'rock', 'steel'],
    resistantTo: ['ice'],
  },
  fighting: {
    strongAgainst: ['normal', 'ice', 'rock', 'dark', 'steel'],
    weakTo: ['flying', 'psychic', 'fairy'],
    resistantTo: ['rock', 'bug', 'dark'],
  },
  poison: {
    strongAgainst: ['grass', 'fairy'],
    weakTo: ['ground', 'psychic'],
    resistantTo: ['fighting', 'poison', 'bug', 'grass'],
  },
  ground: {
    strongAgainst: ['fire', 'electric', 'poison', 'rock', 'steel'],
    weakTo: ['water', 'grass', 'ice'],
    resistantTo: ['poison', 'rock'],
  },
  flying: {
    strongAgainst: ['fighting', 'bug', 'grass'],
    weakTo: ['electric', 'ice', 'rock'],
    resistantTo: ['fighting', 'bug', 'grass'],
  },
  psychic: {
    strongAgainst: ['fighting', 'poison'],
    weakTo: ['bug', 'ghost', 'dark'],
    resistantTo: ['fighting', 'psychic'],
  },
  bug: {
    strongAgainst: ['grass', 'psychic', 'dark'],
    weakTo: ['fire', 'flying', 'rock'],
    resistantTo: ['fighting', 'ground', 'grass'],
  },
  rock: {
    strongAgainst: ['flying', 'bug', 'fire', 'ice'],
    weakTo: ['water', 'grass', 'fighting', 'ground', 'steel'],
    resistantTo: ['normal', 'flying', 'poison', 'fire'],
  },
  ghost: {
    strongAgainst: ['psychic', 'ghost'],
    weakTo: ['ghost', 'dark'],
    resistantTo: ['poison', 'bug'],
  },
  dragon: {
    strongAgainst: ['dragon'],
    weakTo: ['ice', 'dragon', 'fairy'],
    resistantTo: ['fire', 'water', 'grass', 'electric'],
  },
  dark: {
    strongAgainst: ['psychic', 'ghost'],
    weakTo: ['fighting', 'bug', 'fairy'],
    resistantTo: ['ghost', 'dark'],
  },
  steel: {
    strongAgainst: ['ice', 'rock', 'fairy'],
    weakTo: ['fire', 'water', 'ground'],
    resistantTo: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'],
  },
  fairy: {
    strongAgainst: ['fighting', 'bug', 'dark'],
    weakTo: ['poison', 'steel'],
    resistantTo: ['fighting', 'bug', 'dark'],
  },
};
