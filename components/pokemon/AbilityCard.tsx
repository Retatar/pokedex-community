import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { PokemonAbility } from '../../types/pokemon.types';
import { pokeApiService } from '../../services/pokeapi/pokeapi.service';

interface AbilityCardProps {
  ability: PokemonAbility;
}

export default function AbilityCard({ ability }: AbilityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState<string | null>(null);

  const toggleExpand = async () => {
    if (!expanded && !description) {
      setLoading(true);
      try {
        const detail = await pokeApiService.getAbility(ability.name);
        // Cari deskripsi dalam bahasa inggris
        const entry = detail.effect_entries.find((e: any) => e.language.name === 'en');
        if (entry) {
          setDescription(entry.effect);
        } else {
          setDescription('No description available.');
        }
      } catch (error) {
        setDescription('Failed to load description.');
      } finally {
        setLoading(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <View className="mb-3 rounded-lg border border-border bg-white dark:bg-gray-800 overflow-hidden">
      <TouchableOpacity 
        className="flex-row items-center justify-between p-4"
        onPress={toggleExpand}
      >
        <View className="flex-row items-center flex-1">
          <Text className="text-onSurface dark:text-white font-bold text-base capitalize">
            {ability.name.replace('-', ' ')}
          </Text>
          {ability.is_hidden && (
            <View className="ml-3 bg-accent px-2 py-0.5 rounded text-xs">
              <Text className="text-surface font-bold text-[10px]">HIDDEN</Text>
            </View>
          )}
        </View>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#6B7280" 
        />
      </TouchableOpacity>

      {expanded && (
        <View className="p-4 pt-0 border-t border-border mt-2">
          {loading ? (
            <ActivityIndicator size="small" color="#CC0000" className="my-2" />
          ) : (
            <Text className="text-onSurface dark:text-gray-300 text-sm leading-5">
              {description}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
