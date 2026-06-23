import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePokemonStore, SortOption } from '../../../store/pokemon.store';
import { POKEMON_TYPES, POKEMON_TYPE_COLORS } from '../../../constants/pokemonTypes';

export default function PokemonFilterScreen() {
  const router = useRouter();
  const { activeFilters, sortBy, setFilterAndSort } = usePokemonStore();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(activeFilters);
  const [selectedSort, setSelectedSort] = useState<SortOption>(sortBy);

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleApply = () => {
    setFilterAndSort(selectedTypes, selectedSort);
    router.replace('/(tabs)/pokemon');
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setSelectedSort('id-asc');
  };

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-900 border-b border-border flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="close" size={24} color="#CC0000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-onSurface dark:text-white">Filter</Text>
        </View>
        <TouchableOpacity onPress={handleReset}>
          <Text className="text-muted font-semibold">Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-lg font-bold text-onSurface dark:text-white mb-4">Urutkan Berdasarkan</Text>

        <View className="flex-row flex-wrap mb-6">
          {[
            { label: 'Nomor Pokedex (Naik)', value: 'id-asc' },
            { label: 'Nomor Pokedex (Turun)', value: 'id-desc' },
            { label: 'Nama (A-Z)', value: 'name-asc' },
            { label: 'Nama (Z-A)', value: 'name-desc' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              className={`rounded-xl px-4 py-3 mr-2 mb-2 border ${selectedSort === option.value ? 'bg-primary border-primary' : 'bg-white dark:bg-gray-800 border-border'}`}
              onPress={() => setSelectedSort(option.value as SortOption)}
            >
              <Text className={`font-semibold ${selectedSort === option.value ? 'text-white' : 'text-onSurface dark:text-gray-300'}`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-lg font-bold text-onSurface dark:text-white mb-4">Tipe Pokémon</Text>
        
        <View className="flex-row flex-wrap">
          {POKEMON_TYPES.map((type) => {
            const isSelected = selectedTypes.includes(type);
            const bgColor = isSelected ? POKEMON_TYPE_COLORS[type] : '#E5E7EB';
            const textColor = isSelected ? '#FFFFFF' : '#374151';
            
            return (
              <TouchableOpacity
                key={type}
                className="rounded-full px-4 py-2 mr-2 mb-3 border"
                style={{ 
                  backgroundColor: bgColor,
                  borderColor: isSelected ? bgColor : '#D1D5DB'
                }}
                onPress={() => toggleType(type)}
              >
                <Text className="font-bold capitalize" style={{ color: textColor }}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        <Text className="text-sm text-muted mt-2">
          * Catatan: Untuk MVP, filter hanya akan mencari berdasarkan tipe pertama yang dipilih.
        </Text>
      </ScrollView>

      <View className="p-4 border-t border-border bg-white dark:bg-gray-900">
        <TouchableOpacity 
          className="bg-primary h-12 rounded-lg items-center justify-center"
          onPress={handleApply}
        >
          <Text className="text-white font-bold text-lg">Terapkan Filter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
