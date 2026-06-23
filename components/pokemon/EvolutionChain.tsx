import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { EvolutionChainLink } from '../../types/pokemon.types';

interface EvolutionChainProps {
  chain: EvolutionChainLink | null;
}

export default function EvolutionChain({ chain }: EvolutionChainProps) {
  const router = useRouter();

  if (!chain) {
    return <Text className="text-muted text-center py-4">No evolution data available.</Text>;
  }

  const renderLink = (link: EvolutionChainLink, isLast = false) => {
    return (
      <View key={link.species_id} className="items-center w-full">
        <TouchableOpacity 
          className="items-center"
          onPress={() => router.push(`/(tabs)/pokemon/${link.species_id}`)}
        >
          <View className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center border border-border shadow-sm mb-2">
            {link.sprites ? (
              <Image
                source={{ uri: link.sprites }}
                className="w-20 h-20"
                resizeMode="contain"
              />
            ) : (
              <Ionicons name="help" size={40} color="#9CA3AF" />
            )}
          </View>
          <Text className="text-onSurface dark:text-white font-bold capitalize">
            {link.species_name}
          </Text>
        </TouchableOpacity>

        {link.evolves_to.length > 0 && (
          <View className="items-center my-4">
            <Ionicons name="arrow-down" size={24} color="#CC0000" />
            <Text className="text-xs text-muted dark:text-gray-400 mt-1 capitalize text-center">
              {link.evolves_to[0].trigger_name}
              {link.evolves_to[0].min_level ? ` Lvl ${link.evolves_to[0].min_level}` : ''}
              {link.evolves_to[0].item ? ` (${link.evolves_to[0].item.replace('-', ' ')})` : ''}
            </Text>
          </View>
        )}

        {link.evolves_to.map(evolvesTo => renderLink(evolvesTo, evolvesTo.evolves_to.length === 0))}
      </View>
    );
  };

  return (
    <View className="py-4 items-center">
      {renderLink(chain)}
    </View>
  );
}
