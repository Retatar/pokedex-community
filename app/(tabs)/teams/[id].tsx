import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTeamStore } from '../../../store/teams.store';
import TeamSynergyModal from '../../../components/team/TeamSynergy';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { selectedTeam, isLoading, fetchTeamDetail, removePokemonFromTeam, clearSelected, setSelectingForTeam } = useTeamStore();
  const [showSynergy, setShowSynergy] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTeamDetail(Number(id));
    }
    return () => clearSelected();
  }, [id]);

  const confirmRemovePokemon = (pokemonId: number, pokemonName: string) => {
    Alert.alert(
      "Keluarkan Pokémon",
      `Keluarkan ${pokemonName} dari tim ini?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Keluarkan", 
          style: "destructive",
          onPress: () => removePokemonFromTeam(Number(id), pokemonId)
        }
      ]
    );
  };

  if (isLoading || !selectedTeam) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-surface">
        <ActivityIndicator size="large" color="#CC0000" />
      </View>
    );
  }

  // Siapkan array 6 slot persis
  const slots = Array(6).fill(null);
  if (selectedTeam.pokemon) {
    selectedTeam.pokemon.forEach((p) => {
      if (p.slot >= 1 && p.slot <= 6) {
        slots[p.slot - 1] = p;
      }
    });
  }

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-900 border-b border-border flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#CC0000" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-onSurface dark:text-white">{selectedTeam.name}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push(`/(tabs)/teams/${id}/edit`)}>
          <Ionicons name="create-outline" size={24} color="#003A8C" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {selectedTeam.description ? (
          <Text className="text-muted mb-6 leading-5">{selectedTeam.description}</Text>
        ) : null}

        {selectedTeam.pokemon && selectedTeam.pokemon.length > 0 && (
          <TouchableOpacity
            className="bg-secondary rounded-xl p-3 mb-4 flex-row items-center justify-center shadow-sm"
            onPress={() => setShowSynergy(true)}
          >
            <Ionicons name="analytics" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Analisis Tim</Text>
          </TouchableOpacity>
        )}

        <Text className="text-lg font-bold text-onSurface dark:text-white mb-4">Anggota Tim</Text>

        <View className="flex-row flex-wrap justify-between">
          {slots.map((slot, index) => (
            <View key={index} className="w-[48%] mb-4">
              {slot ? (
                <TouchableOpacity 
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 items-center shadow-sm border border-border"
                  onPress={() => router.push(`/(tabs)/pokemon/${slot.pokemon_id}`)}
                >
                  <TouchableOpacity 
                    className="absolute top-2 right-2 p-1"
                    onPress={() => confirmRemovePokemon(slot.pokemon_id, slot.pokemon_name)}
                  >
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                  <Image
                    source={{ uri: slot.pokemon_sprite }}
                    className="w-20 h-20 mb-2"
                    resizeMode="contain"
                  />
                  <Text className="font-bold text-onSurface dark:text-white capitalize text-center" numberOfLines={1}>
                    {slot.pokemon_name}
                  </Text>
                  <Text className="text-xs text-muted mt-1">Lvl 50</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 items-center justify-center shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 h-[140px]"
                  onPress={() => {
                    setSelectingForTeam(Number(id), index + 1, selectedTeam?.name || '');
                    router.push('/(tabs)/pokemon');
                  }}
                >
                  <Ionicons name="add" size={32} color="#9CA3AF" />
                  <Text className="text-muted font-semibold mt-2">Slot {index + 1}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <TeamSynergyModal
        visible={showSynergy}
        onClose={() => setShowSynergy(false)}
        pokemons={selectedTeam.pokemon || []}
      />
    </View>
  );
}
