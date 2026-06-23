import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTeamStore } from '../../../store/teams.store';
import { usePokemonStore } from '../../../store/pokemon.store';

export default function SelectTeamScreen() {
  const router = useRouter();
  const { teams, isLoading, fetchTeams, addPokemonToTeam } = useTeamStore();
  const { selectedPokemon } = usePokemonStore();
  
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSelectSlot = async (slot: number) => {
    if (!selectedTeamId || !selectedPokemon) return;
    
    setIsSaving(true);
    try {
      await addPokemonToTeam(
        selectedTeamId,
        selectedPokemon.id,
        selectedPokemon.name,
        selectedPokemon.sprite,
        slot
      );
      // Kembali ke detail tim yang bersangkutan
      router.replace(`/(tabs)/teams/${selectedTeamId}`);
    } catch (e) {
      // Error handled by store
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedPokemon) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Tidak ada Pokemon yang dipilih.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 p-2 bg-gray-200 rounded">
          <Text>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-900 border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-onSurface dark:text-white">Tambahkan ke Tim</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#CC0000" />
        </View>
      ) : !selectedTeamId ? (
        <FlatList
          data={teams}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm border border-border flex-row justify-between items-center"
              onPress={() => setSelectedTeamId(item.id)}
            >
              <View>
                <Text className="font-bold text-lg text-onSurface dark:text-white">{item.name}</Text>
                <Text className="text-muted text-sm">{item.pokemon?.length || 0}/6 Pokémon</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center pt-10">
              <Text className="text-muted mb-4">Anda belum memiliki tim.</Text>
              <TouchableOpacity 
                className="bg-primary px-4 py-2 rounded-lg"
                onPress={() => router.replace('/(tabs)/teams/create')}
              >
                <Text className="text-white font-bold">Buat Tim Baru</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        <View className="p-4 flex-1">
          <Text className="text-lg font-bold text-onSurface dark:text-white mb-4">Pilih Slot untuk {selectedPokemon.name}</Text>
          
          <View className="flex-row flex-wrap justify-between">
            {[1, 2, 3, 4, 5, 6].map(slot => {
              const team = teams.find(t => t.id === selectedTeamId);
              const existingPokemon = team?.pokemon?.find(p => p.slot === slot);
              
              return (
                <TouchableOpacity 
                  key={slot}
                  className={`w-[48%] mb-4 p-4 rounded-xl border items-center justify-center h-24 ${existingPokemon ? 'bg-gray-100 dark:bg-gray-700 border-gray-300' : 'bg-white dark:bg-gray-800 border-primary border-dashed'}`}
                  onPress={() => handleSelectSlot(slot)}
                  disabled={isSaving}
                >
                  {existingPokemon ? (
                    <>
                      <Text className="text-xs text-muted mb-1">Ganti (Slot {slot})</Text>
                      <Text className="font-bold capitalize text-onSurface dark:text-white" numberOfLines={1}>{existingPokemon.pokemon_name}</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="add" size={24} color="#CC0000" />
                      <Text className="text-primary font-bold mt-1">Slot {slot}</Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          
          <TouchableOpacity 
            className="mt-auto items-center p-4"
            onPress={() => setSelectedTeamId(null)}
          >
            <Text className="text-secondary font-bold">Kembali pilih tim</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
