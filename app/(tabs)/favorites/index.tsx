import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavoriteStore } from '../../../store/favorites.store';
import ErrorScreen from '../../../components/ui/ErrorScreen';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, isLoading, fetchFavorites, removeFavorite, error } = useFavoriteStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFavorites();
    setIsRefreshing(false);
  };

  const confirmRemove = (pokemonId: number, name: string) => {
    Alert.alert(
      "Hapus Favorit",
      `Apakah Anda yakin ingin menghapus ${name} dari favorit?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive",
          onPress: () => removeFavorite(pokemonId) 
        }
      ]
    );
  };

  if (error && favorites.length === 0) {
    return (
      <ErrorScreen
        message={error}
        onRetry={fetchFavorites}
        title="Gagal Memuat Favorit"
      />
    );
  }

  if (isLoading && favorites.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-surface">
        <ActivityIndicator size="large" color="#CC0000" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      <View className="px-4 pt-12 pb-4 bg-white dark:bg-gray-900 border-b border-border shadow-sm">
        <Text className="text-onSurface dark:text-white text-3xl font-bold">Favorites</Text>
        <Text className="text-muted mt-1">{favorites.length} Pokémon Favorit</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="flex-1 m-1.5 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-border"
            onPress={() => router.push(`/(tabs)/pokemon/${item.pokemon_id}`)}
          >
            <TouchableOpacity 
              className="absolute top-2 right-2 z-10 w-8 h-8 items-center justify-center bg-white/80 dark:bg-black/50 rounded-full"
              onPress={() => confirmRemove(item.pokemon_id, item.pokemon_name)}
            >
              <Ionicons name="trash" size={16} color="#DC2626" />
            </TouchableOpacity>
            
            <View className="items-center px-2 py-4">
              <Image
                source={{ uri: item.pokemon_sprite }}
                className="w-24 h-24 mb-2"
                resizeMode="contain"
              />
              <Text className="text-onSurface dark:text-white text-base font-bold capitalize text-center mb-1" numberOfLines={1}>
                {item.pokemon_name}
              </Text>
              <Text className="text-muted text-xs font-bold">
                #{item.pokemon_id.toString().padStart(3, '0')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View className="flex-1 items-center justify-center pt-20 px-6">
              <Ionicons name="heart-dislike" size={64} color="#D1D5DB" />
              <Text className="text-onSurface dark:text-white text-lg font-bold mt-4 text-center">Belum ada Favorit</Text>
              <Text className="text-muted text-center mt-2">
                Tambahkan Pokémon ke daftar favorit dengan menekan tombol hati di halaman detail.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
