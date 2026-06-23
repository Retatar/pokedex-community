import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { pokeApiService } from '../../../services/pokeapi/pokeapi.service';
import { PokemonDetail } from '../../../types/pokemon.types';
import StatBar from '../../../components/pokemon/StatBar';
import TypeBadge from '../../../components/pokemon/TypeBadge';

const getSpriteUrl = (id: string | number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export default function CompareScreen() {
  const { basePokemonId } = useLocalSearchParams();
  const router = useRouter();

  const [pokemon1, setPokemon1] = useState<PokemonDetail | null>(null);
  const [pokemon2, setPokemon2] = useState<PokemonDetail | null>(null);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (basePokemonId) {
      loadBasePokemon(basePokemonId as string);
    }
  }, [basePokemonId]);

  const loadBasePokemon = async (id: string) => {
    setIsLoading(true);
    setError('');
    try {
      const detail = await pokeApiService.getPokemonDetail(id);
      setPokemon1(detail);
    } catch (e) {
      setError('Gagal memuat Pokémon. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.length > 2) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const results = await pokeApiService.searchPokemon(searchQuery);
      setSearchResults(results.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSecondPokemon = async (id: string | number) => {
    setSearchQuery('');
    setSearchResults([]);
    setIsLoading(true);
    try {
      const detail = await pokeApiService.getPokemonDetail(id);
      setPokemon2(detail);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const renderComparison = () => {
    if (!pokemon1 || !pokemon2) return null;

    const totalStats1 = pokemon1.stats.reduce((acc, curr) => acc + curr.base_stat, 0);
    const totalStats2 = pokemon2.stats.reduce((acc, curr) => acc + curr.base_stat, 0);

    const type1 = pokemon1.types[0]?.toLowerCase() || 'normal';
    const type2 = pokemon2.types[0]?.toLowerCase() || 'normal';

    return (
      <View className="mt-6">
        <Text className="text-xl font-bold text-onSurface dark:text-white mb-4 text-center">Statistik Dasar</Text>

        <View className="flex-row justify-between mb-2 px-2">
          <Text className="font-bold text-primary">{pokemon1.name}</Text>
          <Text className="font-bold text-secondary">{pokemon2.name}</Text>
        </View>

        {pokemon1.stats.map((stat) => {
          const stat2 = pokemon2.stats.find(s => s.name === stat.name)?.base_stat || 0;
          const stat1Val = stat.base_stat;

          return (
            <View key={stat.name} className="mb-4">
              <Text className="text-center text-xs font-bold text-muted uppercase mb-1">{stat.name}</Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-2">
                  <StatBar name="" value={stat1Val} type={type1} hideName />
                </View>
                <Text className="font-bold text-onSurface dark:text-white w-8 text-center">{stat1Val}</Text>
                <Text className="text-muted w-4 text-center">vs</Text>
                <Text className="font-bold text-onSurface dark:text-white w-8 text-center">{stat2}</Text>
                <View className="flex-1 ml-2" style={{ transform: [{ scaleX: -1 }] }}>
                  <StatBar name="" value={stat2} type={type2} hideName />
                </View>
              </View>
            </View>
          );
        })}

        <View className="mb-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl">
          <Text className="text-center text-sm font-bold text-muted uppercase mb-2">Total Stats</Text>
          <View className="flex-row justify-between">
            <Text className={`font-bold text-lg ${totalStats1 > totalStats2 ? 'text-green-600' : 'text-onSurface dark:text-white'}`}>{totalStats1}</Text>
            <Text className="text-muted">vs</Text>
            <Text className={`font-bold text-lg ${totalStats2 > totalStats1 ? 'text-green-600' : 'text-onSurface dark:text-white'}`}>{totalStats2}</Text>
          </View>
        </View>

        <View className="flex-row mt-4">
          <View className="flex-1 items-center bg-white dark:bg-gray-800 p-3 rounded-xl mr-2 shadow-sm border border-border">
            <Text className="text-xs text-muted mb-2 font-bold uppercase">Weight</Text>
            <Text className="font-bold text-onSurface dark:text-white">{pokemon1.weight / 10} kg</Text>
            <Text className="text-xs text-muted mb-2 mt-4 font-bold uppercase">Height</Text>
            <Text className="font-bold text-onSurface dark:text-white">{pokemon1.height / 10} m</Text>
          </View>
          <View className="flex-1 items-center bg-white dark:bg-gray-800 p-3 rounded-xl ml-2 shadow-sm border border-border">
            <Text className="text-xs text-muted mb-2 font-bold uppercase">Weight</Text>
            <Text className="font-bold text-onSurface dark:text-white">{pokemon2.weight / 10} kg</Text>
            <Text className="text-xs text-muted mb-2 mt-4 font-bold uppercase">Height</Text>
            <Text className="font-bold text-onSurface dark:text-white">{pokemon2.height / 10} m</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-900 border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => router.push('/(tabs)/pokemon')} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#CC0000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-onSurface dark:text-white">Compare Pokémon</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <View className="flex-row items-end justify-between mb-6">
          {/* Pokemon 1 */}
          <View className="flex-1 items-center">
            {pokemon1 ? (
              <>
                <Image
                  source={{ uri: pokemon1.sprite || getSpriteUrl(pokemon1.id) }}
                  className="w-24 h-24 mb-2"
                  resizeMode="contain"
                />
                <Text className="font-bold text-base capitalize text-onSurface dark:text-white">{pokemon1.name}</Text>
                <View className="flex-row flex-wrap justify-center mt-1">
                  {pokemon1.types.map(t => <View key={t} className="m-0.5"><TypeBadge type={t} size="small" /></View>)}
                </View>
              </>
            ) : error ? (
              <View className="items-center">
                <View className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full items-center justify-center mb-2">
                  <Ionicons name="alert-circle" size={32} color="#DC2626" />
                </View>
                <Text className="text-error text-xs text-center mt-1">{error}</Text>
              </View>
            ) : (
              <View className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full items-center justify-center mb-2">
                <ActivityIndicator size="small" color="#CC0000" />
              </View>
            )}
          </View>

          <View className="px-2 pb-4">
            <Text className="font-bold text-xl text-muted text-center">VS</Text>
          </View>

          {/* Pokemon 2 */}
          <View className="flex-1 items-center">
            {pokemon2 ? (
              <View className="items-center relative w-full">
                <TouchableOpacity
                  className="absolute -top-2 -right-2 z-10 bg-white dark:bg-gray-700 rounded-full p-1"
                  onPress={() => { setPokemon2(null); setSearchResults([]); }}
                >
                  <Ionicons name="close" size={16} color="#DC2626" />
                </TouchableOpacity>
                <Image
                  source={{ uri: pokemon2.sprite || getSpriteUrl(pokemon2.id) }}
                  className="w-24 h-24 mb-2"
                  resizeMode="contain"
                />
                <Text className="font-bold text-base capitalize text-onSurface dark:text-white">{pokemon2.name}</Text>
                <View className="flex-row flex-wrap justify-center mt-1">
                  {pokemon2.types.map(t => <View key={t} className="m-0.5"><TypeBadge type={t} size="small" /></View>)}
                </View>
              </View>
            ) : (
              <View className="w-full">
                <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-lg px-3 h-10 border border-border">
                  <Ionicons name="search" size={16} color="#6B7280" />
                  <TextInput
                    className="flex-1 ml-2 text-onSurface dark:text-white text-xs"
                    placeholder="Pilih Lawan..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                {isSearching && <ActivityIndicator size="small" color="#CC0000" className="mt-2" />}

                {searchResults.length > 0 && (
                  <View className="bg-white dark:bg-gray-800 border border-border rounded-lg shadow-lg mt-1 w-full relative z-50">
                    {searchResults.map(p => (
                      <TouchableOpacity
                        key={p.id}
                        className="p-2 border-b border-border flex-row items-center"
                        onPress={() => selectSecondPokemon(p.id)}
                      >
                        <Image source={{ uri: p.sprite || getSpriteUrl(p.id) }} className="w-8 h-8 mr-2" resizeMode="contain" />
                        <Text className="text-onSurface dark:text-white text-xs capitalize font-semibold">{p.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {searchQuery.length > 2 && !isSearching && searchResults.length === 0 && (
                  <Text className="text-muted text-xs mt-2 text-center">Tidak ada Pokémon ditemukan.</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#CC0000" className="mt-10" />
        ) : (
          pokemon1 && pokemon2 ? renderComparison() : null
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
