import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePokemonStore } from '../../../store/pokemon.store';
import PokemonCard from '../../../components/pokemon/PokemonCard';

export default function PokemonSearchScreen() {
  const router = useRouter();
  const { pokemons, isLoading, searchPokemon } = usePokemonStore();
  const [query, setQuery] = useState('');

  // Debounce implementation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPokemon(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-900 border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#CC0000" />
        </TouchableOpacity>
        
        <View className="flex-1 flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 h-10">
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 text-onSurface dark:text-white"
            placeholder="Cari Pokemon..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#CC0000" />
        </View>
      ) : (
        <FlatList
          data={pokemons}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <PokemonCard 
              pokemon={item} 
              viewMode="list"
              onPress={() => router.push(`/(tabs)/pokemon/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            query.length > 0 ? (
              <View className="items-center justify-center pt-10">
                <Text className="text-muted">Tidak ditemukan Pokemon "{query}"</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
