import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/auth.store';
import { useTeamStore } from '../../../store/teams.store';
import { useFavoriteStore } from '../../../store/favorites.store';
import { useReviewStore } from '../../../store/review.store';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { teams, fetchTeams } = useTeamStore();
  const { favorites, fetchFavorites } = useFavoriteStore();
  const [reviewCount, setReviewCount] = useState(0);

  const loadStats = async () => {
    try {
      await Promise.all([fetchTeams(), fetchFavorites()]);
      const { reviewsService } = await import('../../../services/api/reviews.service');
      const allReviews = await reviewsService.getAllReviews();
      setReviewCount(allReviews.filter(r => r.user_id === user?.id).length);
    } catch {}
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin keluar?',
      [{ text: 'Batal', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: () => logout() }]
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <View className="px-6 pt-14 pb-6 bg-primary rounded-b-3xl shadow-md">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white text-3xl font-bold">Profile</Text>
          <TouchableOpacity onPress={() => router.push('/settings')} className="w-10 h-10 items-center justify-center bg-white/20 rounded-full">
            <Ionicons name="settings-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center">
          <View className="mr-4 shadow-lg">
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} className="w-20 h-20 rounded-full border-4 border-white" resizeMode="cover" />
            ) : (
              <View className="w-20 h-20 rounded-full border-4 border-white items-center justify-center bg-primaryDark">
                <Text className="text-3xl font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</Text>
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">{user?.name}</Text>
            <Text className="text-white/80 text-sm mt-0.5">{user?.email}</Text>
            {user?.bio ? (
              <Text className="text-white/70 text-xs mt-2 leading-4" numberOfLines={2}>{user.bio}</Text>
            ) : null}
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 -mt-6">
        {/* Edit Profile Button */}
        <View className="flex-row justify-end mb-4">
          <TouchableOpacity
            className="bg-white dark:bg-gray-800 px-6 py-2.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 flex-row items-center"
            onPress={() => router.push('/(tabs)/profile/edit')}
          >
            <Ionicons name="create-outline" size={16} color="#CC0000" />
            <Text className="text-primary font-bold ml-1.5">Edit Profil</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View className="flex-row mb-5">
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 mr-2 shadow-sm border border-gray-200 dark:border-gray-700 items-center">
            <View className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mb-2">
              <Ionicons name="heart" size={20} color="#CC0000" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">{favorites.length}</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">Favorit</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 mx-1 shadow-sm border border-gray-200 dark:border-gray-700 items-center">
            <View className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-2">
              <Ionicons name="shield" size={20} color="#059669" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">{teams.length}</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tim</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 ml-1 shadow-sm border border-gray-200 dark:border-gray-700 items-center">
            <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-2">
              <Ionicons name="star" size={20} color="#003A8C" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">{reviewCount}</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">Review</Text>
          </View>
        </View>

        {/* Quick Menu */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-5 overflow-hidden">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700" onPress={() => router.push('/(tabs)/favorites')}>
            <View className="w-9 h-9 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mr-3">
              <Ionicons name="heart" size={18} color="#CC0000" />
            </View>
            <Text className="flex-1 text-base font-semibold text-gray-900 dark:text-white">Koleksi Favorit</Text>
            <Text className="text-sm text-gray-400 mr-2">{favorites.length}</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700" onPress={() => router.push('/(tabs)/teams')}>
            <View className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mr-3">
              <Ionicons name="shield" size={18} color="#059669" />
            </View>
            <Text className="flex-1 text-base font-semibold text-gray-900 dark:text-white">Tim Saya</Text>
            <Text className="text-sm text-gray-400 mr-2">{teams.length}</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4" onPress={() => router.push('/notifications')}>
            <View className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-full items-center justify-center mr-3">
              <Ionicons name="notifications" size={18} color="#7C3AED" />
            </View>
            <Text className="flex-1 text-base font-semibold text-gray-900 dark:text-white">Notifikasi</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Account Info */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-5 p-4">
          <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Info Akun</Text>
          <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <Text className="text-gray-500 dark:text-gray-400">Bergabung</Text>
            <Text className="text-gray-900 dark:text-white font-medium">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
            </Text>
          </View>
          <View className="flex-row justify-between py-2">
            <Text className="text-gray-500 dark:text-gray-400">Role</Text>
            <Text className="text-gray-900 dark:text-white font-medium capitalize">{user?.role || 'user'}</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-white dark:bg-gray-800 rounded-2xl p-4 mb-10 shadow-sm border border-red-200 dark:border-red-900"
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="#DC2626" />
          <Text className="text-error font-bold text-base ml-2">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
