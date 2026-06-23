import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePokemonStore } from '../../../store/pokemon.store';
import { useTeamStore } from '../../../store/teams.store';
import PokemonCard from '../../../components/pokemon/PokemonCard';
import { PokemonCardSkeleton } from '../../../components/ui/Skeleton';

export default function PokemonListScreen() {
  const router = useRouter();
  const { pokemons, isLoading, hasMore, fetchPokemons, activeFilters } = usePokemonStore();
  const { addPokemonToTeam, selectingForTeamId, selectingForSlot, selectingForTeamName, setSelectingForTeam } = useTeamStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (pokemons.length === 0) {
      fetchPokemons(true);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPokemons(true);
    setIsRefreshing(false);
  };

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="large" color="#CC0000" />
      </View>
    );
  };

  const renderSkeleton = () => {
    if (!isLoading || pokemons.length > 0) return null;
    const skeletonCount = viewMode === 'grid' ? 6 : 4;
    return (
      <View className={viewMode === 'grid' ? 'flex-row flex-wrap px-3' : ''}>
        {Array(skeletonCount).fill(null).map((_, index) => (
          <View key={`skeleton-${index}`} className={viewMode === 'grid' ? 'w-1/2 p-1.5' : 'w-full'}>
            <PokemonCardSkeleton viewMode={viewMode} />
          </View>
        ))}
      </View>
    );
  };

  const handlePokemonSelect = async (pokemon: any) => {
    if (selectingForTeamId && selectingForSlot) {
      // Mode pemilihan untuk tim
      setIsSaving(true);
      try {
        await addPokemonToTeam(
          selectingForTeamId,
          pokemon.id,
          pokemon.name,
          pokemon.sprite,
          selectingForSlot
        );
        // Clear mode pemilihan
        const currentTeamId = selectingForTeamId;
        setSelectingForTeam(null, null, null);

        // Kembali ke detail tim setelah berhasil
        router.replace(`/(tabs)/teams/${currentTeamId}`);
      } catch (error) {
        Alert.alert('Error', 'Gagal menambahkan Pokémon ke tim');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Mode normal - buka detail Pokémon
      router.push(`/(tabs)/pokemon/${pokemon.id}`);
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      {/* Header */}
      <View className="px-4 pt-12 pb-4 bg-primary rounded-b-3xl shadow-sm z-10">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-3xl font-bold">Pokédex</Text>
          <View className="flex-row">
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-full bg-white/20 mr-2"
              onPress={() => router.push('/(tabs)/favorites')}
            >
              <Ionicons name="heart" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-full bg-white/20 mr-2"
              onPress={() => router.push('/(tabs)/pokemon/search')}
            >
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
              onPress={() => router.push('/(tabs)/pokemon/filter')}
            >
              <Ionicons name="options" size={20} color="white" />
              {activeFilters.length > 0 && (
                <View className="absolute top-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-primary" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* View Toggle */}
        <View className="flex-row justify-end">
          <TouchableOpacity 
            className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-white/30' : 'bg-white/10'}`}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-white/30' : 'bg-white/10'}`}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      {selectingForTeamId && selectingForSlot && (
        <View className="bg-secondary/10 border-b-2 border-secondary px-4 py-3 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-secondary font-bold text-sm">Pilih Pokémon untuk Tim</Text>
            <Text className="text-onSurface dark:text-white font-semibold text-base">{selectingForTeamName} - Slot {selectingForSlot}</Text>
          </View>
          <TouchableOpacity onPress={() => {
            setSelectingForTeam(null, null, null);
            router.back();
          }}>
            <Ionicons name="close" size={20} color="#003A8C" />
          </TouchableOpacity>
        </View>
      )}

      {isLoading && pokemons.length === 0 ? renderSkeleton() : (
        <FlatList
          key={viewMode} // Force re-render when changing columns
          data={pokemons}
          keyExtractor={(item) => item.id.toString()}
          numColumns={viewMode === 'grid' ? 2 : 1}
          contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
          columnWrapperStyle={viewMode === 'grid' ? { justifyContent: 'space-between' } : undefined}
          renderItem={({ item }) => (
            <PokemonCard
              pokemon={item}
              viewMode={viewMode}
              onPress={() => handlePokemonSelect(item)}
            />
          )}
          onEndReached={() => {
            if (hasMore && !isLoading) {
              fetchPokemons();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            !isLoading ? (
              <View className="flex-1 items-center justify-center pt-20">
                <Text className="text-muted dark:text-gray-400">Belum ada data Pokémon.</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
