import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTeamStore } from '../../../store/teams.store';
import { TeamCardSkeleton } from '../../../components/ui/Skeleton';
import ErrorScreen from '../../../components/ui/ErrorScreen';

export default function TeamsScreen() {
  const router = useRouter();
  const { teams, isLoading, fetchTeams, deleteTeam, error } = useTeamStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTeams();
    setIsRefreshing(false);
  };

  if (error && teams.length === 0) {
    return (
      <ErrorScreen
        message={error}
        onRetry={fetchTeams}
        title="Gagal Memuat Tim"
      />
    );
  }

  const confirmDelete = (teamId: number, teamName: string) => {
    Alert.alert(
      "Hapus Tim",
      `Apakah Anda yakin ingin menghapus tim "${teamName}"? Semua Pokémon di dalamnya akan ikut terhapus.`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive",
          onPress: () => deleteTeam(teamId)
        }
      ]
    );
  };

  const renderTeamCard = ({ item }: { item: any }) => {
    // Fill up to 6 slots for display
    const slots = Array(6).fill(null);
    if (item.pokemon) {
      item.pokemon.forEach((p: any) => {
        slots[p.slot - 1] = p;
      });
    }

    return (
      <TouchableOpacity 
        className="bg-white dark:bg-gray-800 rounded-xl mb-4 p-4 shadow-sm border border-border"
        onPress={() => router.push(`/(tabs)/teams/${item.id}`)}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-2">
            <Text className="text-onSurface dark:text-white font-bold text-lg">{item.name}</Text>
            {item.description ? (
              <Text className="text-muted text-sm mt-1" numberOfLines={1}>{item.description}</Text>
            ) : null}
          </View>
          <TouchableOpacity 
            className="p-2"
            onPress={() => confirmDelete(item.id, item.name)}
          >
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between">
          {slots.map((slot, index) => (
            <View 
              key={index} 
              className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center border border-dashed border-gray-300 dark:border-gray-600"
            >
              {slot ? (
                <Image
                  source={{ uri: slot.pokemon_sprite }}
                  className="w-10 h-10"
                  resizeMode="contain"
                />
              ) : null}
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      <View className="px-4 pt-12 pb-4 bg-white dark:bg-gray-900 border-b border-border shadow-sm flex-row justify-between items-center">
        <View>
          <Text className="text-onSurface dark:text-white text-3xl font-bold">Teams</Text>
          <Text className="text-muted mt-1">{teams.length} Tim</Text>
        </View>
        <TouchableOpacity
          className="bg-primary w-10 h-10 rounded-full items-center justify-center shadow-md"
          onPress={() => router.push('/(tabs)/teams/create')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading && teams.length === 0 ? (
        <View className="flex-1 p-4">
          {Array(3).fill(null).map((_, i) => (
            <TeamCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTeamCard}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View className="items-center justify-center pt-20 px-6">
              <Ionicons name="shield" size={64} color="#D1D5DB" />
              <Text className="text-onSurface dark:text-white text-lg font-bold mt-4 text-center">Belum Ada Tim</Text>
              <Text className="text-muted text-center mt-2">
                Buat tim impianmu dengan menekan tombol plus di kanan atas.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
