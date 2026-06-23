import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useNotificationStore } from '../../store/notifications.store';
import { useEffect, useState } from 'react';
import { reviewsService, Review } from '../../services/api/reviews.service';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [feedReviews, setFeedReviews] = useState<Review[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);

  useEffect(() => {
    fetchNotifications();
    loadActivityFeed();
  }, []);

  const loadActivityFeed = async () => {
    setIsLoadingFeed(true);
    try {
      const reviews = await reviewsService.getAllReviews();
      setFeedReviews(reviews.slice(0, 5)); // Top 5 latest reviews
    } catch (error) {
      console.error('Failed to load activity feed:', error);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      {/* Header */}
      <View className="px-6 pt-14 pb-6 bg-primary rounded-b-3xl shadow-sm flex-row justify-between items-center z-10">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-3">
            <Text className="text-xl font-bold text-primary capitalize">{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <View>
            <Text className="text-white/80 text-sm">Selamat Datang,</Text>
            <Text className="text-white text-xl font-bold">{user?.name}</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center bg-white/20 rounded-full relative"
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications" size={20} color="white" />
          {unreadCount > 0 && (
            <View className="absolute top-0 right-0 w-4 h-4 bg-accent rounded-full items-center justify-center border border-primary">
              <Text className="text-[8px] font-bold text-surface">{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-onSurface dark:text-white mb-6">Mulai Petualanganmu!</Text>
        
        <TouchableOpacity 
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm border border-border flex-row items-center"
          onPress={() => router.push('/(tabs)/pokemon')}
        >
          <View className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mr-4">
            <Ionicons name="search" size={24} color="#003A8C" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-onSurface dark:text-white">Cari Pokémon</Text>
            <Text className="text-muted text-sm mt-0.5">Jelajahi Pokédex lengkap</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm border border-border flex-row items-center"
          onPress={() => router.push('/(tabs)/teams')}
        >
          <View className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mr-4">
            <Ionicons name="shield" size={24} color="#059669" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-onSurface dark:text-white">Team Builder</Text>
            <Text className="text-muted text-sm mt-0.5">Rakit tim 6 Pokémon terbaikmu</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-8 shadow-sm border border-border flex-row items-center"
          onPress={() => router.push('/(tabs)/favorites')}
        >
          <View className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mr-4">
            <Ionicons name="heart" size={24} color="#CC0000" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-onSurface dark:text-white">Koleksi Favorit</Text>
            <Text className="text-muted text-sm mt-0.5">Lihat daftar Pokémon favoritmu</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Activity Feed Section */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-onSurface dark:text-white">Aktivitas Komunitas</Text>
            <TouchableOpacity onPress={loadActivityFeed}>
              <Ionicons name="refresh" size={20} color="#CC0000" />
            </TouchableOpacity>
          </View>

          {isLoadingFeed ? (
            <View className="items-center py-6">
              <ActivityIndicator size="large" color="#CC0000" />
            </View>
          ) : feedReviews.length > 0 ? (
            feedReviews.map((review) => (
              <TouchableOpacity
                key={review.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm border border-border"
                onPress={() => router.push(`/(tabs)/pokemon/${review.pokemon_id}`)}
              >
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="font-bold text-onSurface dark:text-white">
                      {review.user_name}
                    </Text>
                    <Text className="text-muted text-xs mt-0.5">
                      {new Date(review.created_at).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    {Array(5).fill(0).map((_, i) => (
                      <Ionicons
                        key={i}
                        name="star"
                        size={14}
                        color={i < review.rating ? '#FFCB05' : '#D1D5DB'}
                      />
                    ))}
                  </View>
                </View>
                <Text className="text-onSurface dark:text-white font-semibold capitalize mb-1">
                  {review.pokemon_name}
                </Text>
                <Text className="text-muted text-sm line-clamp-2">
                  {review.comment}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-muted text-center py-6">Belum ada review dari komunitas</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
