import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, useWindowDimensions, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePokemonStore } from '../../../store/pokemon.store';
import { POKEMON_TYPE_COLORS } from '../../../constants/pokemonTypes';
import TypeBadge from '../../../components/pokemon/TypeBadge';
import StatBar from '../../../components/pokemon/StatBar';
import AbilityCard from '../../../components/pokemon/AbilityCard';
import EvolutionChain from '../../../components/pokemon/EvolutionChain';
import ReviewCard from '../../../components/review/ReviewCard';
import { useFavoriteStore } from '../../../store/favorites.store';
import { useReviewStore } from '../../../store/review.store';
import { useAuthStore } from '../../../store/auth.store';
import { pokeApiService } from '../../../services/pokeapi/pokeapi.service';
import { EvolutionChainLink } from '../../../types/pokemon.types';
import { PokemonDetailSkeleton } from '../../../components/ui/Skeleton';
import ErrorScreen from '../../../components/ui/ErrorScreen';
import { Audio } from 'expo-av';
import { TYPE_EFFECTIVENESS } from '../../../constants/typeMatchups';

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { selectedPokemon, isLoading, fetchPokemonDetail, clearSelected, error } = usePokemonStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoriteStore();
  const { fetchReviews, reviews, stats, deleteReview } = useReviewStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'abilities' | 'matchups' | 'moves' | 'evolutions' | 'locations' | 'reviews'>('stats');
  const [evolutionData, setEvolutionData] = useState<EvolutionChainLink | null>(null);
  const [evoLoading, setEvoLoading] = useState(false);
  const [encounters, setEncounters] = useState<any[] | null>(null);
  const [encountersLoading, setEncountersLoading] = useState(false);
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playSound = async () => {
    if (!selectedPokemon?.cries?.latest || isPlaying) return;

    try {
      setIsPlaying(true);
      const { sound } = await Audio.Sound.createAsync(
        { uri: selectedPokemon.cries.latest },
        { shouldPlay: true }
      );
      setSound(sound);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (e) {
      console.error("Couldn't play sound", e);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (id) {
      const pokemonId = Number(id);
      setEvolutionData(null); // Reset evolution data when ID changes
      fetchPokemonDetail(id as string);
      fetchReviews(pokemonId);
    }
    return () => clearSelected();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'evolutions' && selectedPokemon?.evolution_chain_url && !evolutionData) {
      fetchEvolution();
    }
  }, [activeTab, selectedPokemon?.evolution_chain_url]);

  useEffect(() => {
    if (activeTab === 'locations' && !encounters) {
      fetchEncounters();
    }
  }, [activeTab]);

  const fetchEncounters = async () => {
    if (!selectedPokemon) return;
    setEncountersLoading(true);
    try {
      const data = await pokeApiService.getPokemonEncounters(selectedPokemon.id);
      setEncounters(data);
    } catch (e) {
      console.error(e);
      setEncounters([]);
    } finally {
      setEncountersLoading(false);
    }
  };

  const fetchEvolution = async () => {
    if (!selectedPokemon?.evolution_chain_url) return;
    setEvoLoading(true);
    try {
      const data = await pokeApiService.getEvolutionChain(selectedPokemon.evolution_chain_url);
      setEvolutionData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setEvoLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!selectedPokemon) return;
    if (isFavorite(selectedPokemon.id)) {
      removeFavorite(selectedPokemon.id);
    } else {
      addFavorite(selectedPokemon.id, selectedPokemon.name, selectedPokemon.sprite);
    }
  };

  if (error && !selectedPokemon) {
    return (
      <ErrorScreen
        message={error}
        onRetry={() => id && fetchPokemonDetail(id as string)}
        title="Gagal Memuat Detail Pokémon"
      />
    );
  }

  if (isLoading || !selectedPokemon) {
    return <PokemonDetailSkeleton />;
  }

  const mainType = selectedPokemon.types[0]?.toLowerCase() || 'normal';
  const bgColor = POKEMON_TYPE_COLORS[mainType] || '#A8A77A';
  const isFav = isFavorite(selectedPokemon.id);

  const getMatchups = () => {
    const weakTo = new Set<string>();
    const strongAgainst = new Set<string>();
    const resistantTo = new Set<string>();

    selectedPokemon.types.forEach(t => {
      const data = TYPE_EFFECTIVENESS[t.toLowerCase()];
      if (data) {
        data.weakTo.forEach(w => weakTo.add(w));
        data.strongAgainst.forEach(s => strongAgainst.add(s));
        data.resistantTo.forEach(r => resistantTo.add(r));
      }
    });

    const finalWeakTo = Array.from(weakTo).filter(t => !resistantTo.has(t));
    return {
      weak: finalWeakTo,
      strong: Array.from(strongAgainst),
      resistant: Array.from(resistantTo)
    };
  };

  const matchups = getMatchups();

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      {/* Header with Color */}
      <View style={{ backgroundColor: bgColor }} className="pt-12 pb-8 px-4 rounded-b-[40px] items-center relative z-10 shadow-md">
        <View className="flex-row justify-between w-full mb-2">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-black/20 rounded-full">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => router.push(`/(tabs)/pokemon/compare?basePokemonId=${selectedPokemon.id}`)}
              className="w-10 h-10 items-center justify-center bg-black/20 rounded-full mr-2"
            >
              <Ionicons name="git-compare-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleToggleFavorite}
              className="w-10 h-10 items-center justify-center bg-black/20 rounded-full mr-2"
            >
              <Ionicons name={isFav ? "heart" : "heart-outline"} size={24} color={isFav ? "#CC0000" : "white"} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/pokemon/select-team')}
              className="w-10 h-10 items-center justify-center bg-black/20 rounded-full"
            >
              <Ionicons name="shield-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="relative">
          <Image
            source={{ uri: selectedPokemon.sprite }}
            className="w-48 h-48 drop-shadow-xl"
            resizeMode="contain"
          />
          {selectedPokemon.cries?.latest && (
            <TouchableOpacity
              className={`absolute bottom-0 right-0 w-12 h-12 rounded-full items-center justify-center shadow-lg ${isPlaying ? 'bg-primary' : 'bg-white'}`}
              onPress={playSound}
              disabled={isPlaying}
            >
              <Ionicons name="volume-high" size={24} color={isPlaying ? "white" : bgColor} />
            </TouchableOpacity>
          )}
        </View>

        <Text className="text-white text-3xl font-bold capitalize mt-4">{selectedPokemon.name}</Text>
        <Text className="text-white/80 font-bold text-lg mb-3">#{selectedPokemon.id.toString().padStart(3, '0')}</Text>
        
        <View className="flex-row">
          {selectedPokemon.types.map(type => (
            <TypeBadge key={type} type={type} size="large" />
          ))}
        </View>
      </View>

      {/* Tabs Menu */}
      <View className="flex-row justify-around bg-white dark:bg-gray-900 pt-4 pb-2 border-b border-border shadow-sm overflow-x-auto">
        {['stats', 'abilities', 'matchups', 'moves', 'evolutions', 'locations', 'reviews'].map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`pb-2 px-2 border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-primary' : 'border-transparent'}`}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text className={`font-bold capitalize text-xs ${activeTab === tab ? 'text-primary' : 'text-muted'}`}>
              {tab === 'matchups' ? 'Type' : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView className="flex-1 px-6 py-6 bg-background dark:bg-surface">
        {activeTab === 'stats' && (
          <View>
            <Text className="text-xl font-bold text-onSurface dark:text-white mb-4">Base Stats</Text>
            {selectedPokemon.stats.map(stat => (
              <StatBar 
                key={stat.name} 
                name={stat.name} 
                value={stat.base_stat} 
                type={mainType} 
              />
            ))}
            <View className="mt-6 flex-row justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <View className="items-center">
                <Text className="text-muted mb-1 text-xs font-bold uppercase">Weight</Text>
                <Text className="text-onSurface dark:text-white font-bold text-base">{selectedPokemon.weight / 10} kg</Text>
              </View>
              <View className="items-center">
                <Text className="text-muted mb-1 text-xs font-bold uppercase">Height</Text>
                <Text className="text-onSurface dark:text-white font-bold text-base">{selectedPokemon.height / 10} m</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'abilities' && (
          <View>
            <Text className="text-xl font-bold text-onSurface dark:text-white mb-4">Abilities</Text>
            {selectedPokemon.abilities.map(ability => (
              <AbilityCard key={ability.name} ability={ability} />
            ))}
          </View>
        )}

        {activeTab === 'matchups' && (
          <View className="pb-10">
            <Text className="text-xl font-bold text-onSurface dark:text-white mb-4">Efektivitas Tipe</Text>

            <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4 border border-border">
              <Text className="font-bold text-error mb-3">Kelemahan (Menerima Damage Lebih Besar):</Text>
              <View className="flex-row flex-wrap">
                {matchups.weak.length > 0 ? matchups.weak.map(t => (
                  <View key={t} className="mb-2"><TypeBadge type={t} size="small" /></View>
                )) : <Text className="text-muted">Tidak ada kelemahan mayor</Text>}
              </View>
            </View>

            <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4 border border-border">
              <Text className="font-bold text-success mb-3">Resisten Terhadap (Menerima Damage Lebih Sedikit):</Text>
              <View className="flex-row flex-wrap">
                {matchups.resistant.length > 0 ? matchups.resistant.map(t => (
                  <View key={t} className="mb-2"><TypeBadge type={t} size="small" /></View>
                )) : <Text className="text-muted">Tidak ada resistensi khusus</Text>}
              </View>
            </View>

            <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4 border border-border">
              <Text className="font-bold text-primary mb-3">Super Efektif Menyerang:</Text>
              <View className="flex-row flex-wrap">
                {matchups.strong.length > 0 ? matchups.strong.map(t => (
                  <View key={t} className="mb-2"><TypeBadge type={t} size="small" /></View>
                )) : <Text className="text-muted">Tidak ada serangan super efektif khusus</Text>}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'moves' && (
          <View className="pb-10">
            <Text className="text-xl font-bold text-onSurface dark:text-white mb-4">Moveset (Top 30)</Text>
            {selectedPokemon.moves && selectedPokemon.moves.length > 0 ? (
              selectedPokemon.moves.map((move, idx) => (
                <View key={`${move.name}-${idx}`} className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm border border-border flex-row justify-between items-center">
                  <View>
                    <Text className="font-bold text-onSurface dark:text-white text-base capitalize">{move.name.replace('-', ' ')}</Text>
                    <Text className="text-muted text-xs mt-1 capitalize">Method: {move.method}</Text>
                  </View>
                  {move.levelLearnedAt > 0 && (
                    <View className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      <Text className="text-primary font-bold text-xs">Lv {move.levelLearnedAt}</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text className="text-muted">Tidak ada data moveset tersedia.</Text>
            )}
          </View>
        )}

        {activeTab === 'locations' && (
          <View className="pb-10">
            <Text className="text-xl font-bold text-onSurface dark:text-white mb-4">Lokasi Ditemukan</Text>
            {encountersLoading ? (
              <ActivityIndicator size="large" color={bgColor} />
            ) : encounters && encounters.length > 0 ? (
              encounters.map((encounter, idx) => (
                <View key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm border border-border">
                  <Text className="font-bold text-onSurface dark:text-white text-base capitalize mb-2">
                    {encounter.location_area.name.replace(/-/g, ' ')}
                  </Text>
                  {encounter.version_details.slice(0, 2).map((vd: any, vIdx: number) => (
                    <View key={vIdx} className="flex-row items-center mt-1">
                      <Ionicons name="game-controller-outline" size={14} color="#6B7280" />
                      <Text className="text-muted text-xs ml-1 capitalize">
                        Versi: {vd.version.name.replace(/-/g, ' ')} (Peluang: {vd.max_chance}%)
                      </Text>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <View className="items-center py-6">
                <Ionicons name="map-outline" size={48} color="#D1D5DB" />
                <Text className="text-muted text-center mt-4">Pokémon ini tidak dapat ditangkap di alam liar atau data lokasi belum tersedia.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'evolutions' && (
          <View>
            <Text className="text-xl font-bold text-onSurface dark:text-white mb-4">Evolution Chain</Text>
            {evoLoading ? (
              <ActivityIndicator size="large" color={bgColor} />
            ) : (
              <EvolutionChain chain={evolutionData} />
            )}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View className="pb-20">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-xl font-bold text-onSurface dark:text-white">Reviews</Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="star" size={16} color="#FFCB05" />
                  <Text className="text-onSurface dark:text-gray-300 font-bold ml-1">
                    {stats[Number(id)]?.averageRating ? stats[Number(id)].averageRating.toFixed(1) : '0'} 
                  </Text>
                  <Text className="text-muted ml-1">
                    ({stats[Number(id)]?.totalReviews || 0} ulasan)
                  </Text>
                </View>
              </View>
              
              {!reviews[Number(id)]?.some(r => r.user_id === user?.id) && (
                <TouchableOpacity 
                  className="bg-primary px-4 py-2 rounded-lg"
                  onPress={() => router.push({ pathname: '/(tabs)/pokemon/create-review', params: { pokemonId: id, pokemonName: selectedPokemon.name } })}
                >
                  <Text className="text-white font-bold text-sm">Tulis Review</Text>
                </TouchableOpacity>
              )}
            </View>

            {reviews[Number(id)]?.length > 0 ? (
              reviews[Number(id)].map((review) => (
                <ReviewCard 
                  key={review.id} 
                  review={review} 
                  onEdit={() => router.push({ pathname: '/(tabs)/pokemon/edit-review', params: { reviewId: review.id, pokemonId: id } })}
                  onDelete={() => deleteReview(Number(id), review.id)}
                />
              ))
            ) : (
              <View className="items-center justify-center pt-8 pb-4">
                <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
                <Text className="text-muted mt-4 text-center">Belum ada review untuk Pokémon ini.</Text>
                <Text className="text-muted text-center">Jadilah yang pertama memberikan review!</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
