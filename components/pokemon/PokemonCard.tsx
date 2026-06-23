import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Pokemon } from '../../types/pokemon.types';
import TypeBadge from './TypeBadge';
import { POKEMON_TYPE_COLORS } from '../../constants/pokemonTypes';

interface PokemonCardProps {
  pokemon: Pokemon;
  onPress: () => void;
  viewMode?: 'grid' | 'list';
}

export default function PokemonCard({ pokemon, onPress, viewMode = 'grid' }: PokemonCardProps) {
  const mainType = pokemon.types[0]?.toLowerCase() || 'normal';
  const bgColor = POKEMON_TYPE_COLORS[mainType] || '#A8A77A';

  if (viewMode === 'list') {
    return (
      <TouchableOpacity 
        className="flex-row rounded-xl mb-3 overflow-hidden shadow-sm border border-border bg-white dark:bg-gray-800"
        onPress={onPress}
      >
        <View className="w-24 h-24 p-2 items-center justify-center" style={{ backgroundColor: `${bgColor}20` }}>
          <Image
            source={{ uri: pokemon.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png` }}
            className="w-20 h-20"
            resizeMode="contain"
          />
        </View>
        <View className="flex-1 p-3 justify-center">
          <Text className="text-muted text-xs font-bold mb-1">#{pokemon.id.toString().padStart(3, '0')}</Text>
          <Text className="text-onSurface dark:text-white text-lg font-bold capitalize mb-2">{pokemon.name}</Text>
          <View className="flex-row flex-wrap">
            {pokemon.types.map(type => (
              <TypeBadge key={type} type={type} size="small" />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Grid View
  return (
    <TouchableOpacity 
      className="flex-1 rounded-xl m-1.5 overflow-hidden shadow-sm"
      style={{ backgroundColor: bgColor }}
      onPress={onPress}
    >
      <View className="p-2 items-end">
        <Text className="text-white/60 font-bold text-xs">#{pokemon.id.toString().padStart(3, '0')}</Text>
      </View>
      
      <View className="items-center px-2 py-4">
        <Image
          source={{ uri: pokemon.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png` }}
          className="w-24 h-24 mb-2"
          resizeMode="contain"
        />
        <Text className="text-white text-base font-bold capitalize text-center mb-2" numberOfLines={1}>
          {pokemon.name}
        </Text>
        
        <View className="flex-row flex-wrap justify-center mt-1">
          {pokemon.types.map(type => (
            <TypeBadge key={type} type={type} size="small" />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}
