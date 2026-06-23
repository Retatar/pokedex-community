import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore } from '../../store/notifications.store';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [filterUnread, setFilterUnread] = useState(false);

  useEffect(() => {
    fetchNotifications(filterUnread);
  }, [filterUnread]);

  const handleNotificationPress = (id: number, isRead: number, type: string, refId?: number) => {
    if (isRead === 0) {
      markAsRead(id);
    }
    
    // Navigate based on type
    if (type === 'review' && refId) {
      // In a real app, you might navigate to the review directly or the pokemon
      // router.push(`/(tabs)/pokemon/reviews/${refId}`);
    } else if (type === 'team' && refId) {
      router.push(`/(tabs)/teams/${refId}`);
    }
  };

  const renderNotification = ({ item }: { item: any }) => {
    const isUnread = item.is_read === 0;
    
    return (
      <TouchableOpacity 
        className={`p-4 border-b border-border flex-row items-start ${isUnread ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-white dark:bg-surface'}`}
        onPress={() => handleNotificationPress(item.id, item.is_read, item.type, item.reference_id)}
      >
        <View className="mr-3 mt-1">
          {item.type === 'review' ? (
            <Ionicons name="star" size={24} color={isUnread ? "#CC0000" : "#9CA3AF"} />
          ) : (
            <Ionicons name="shield" size={24} color={isUnread ? "#CC0000" : "#9CA3AF"} />
          )}
        </View>
        
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <Text className={`font-bold text-base flex-1 mr-2 ${isUnread ? 'text-onSurface dark:text-white' : 'text-muted dark:text-gray-300'}`}>
              {item.title}
            </Text>
            {isUnread && <View className="w-2.5 h-2.5 bg-primary rounded-full mt-1.5" />}
          </View>
          
          <Text className={`leading-5 ${isUnread ? 'text-onSurface dark:text-gray-200' : 'text-muted dark:text-gray-400'}`}>
            {item.message}
          </Text>
          
          <Text className="text-xs text-muted mt-2">
            {new Date(item.created_at).toLocaleString('id-ID', { 
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-900 border-b border-border flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#CC0000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-onSurface dark:text-white">Notifikasi</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => markAllAsRead()}>
            <Text className="text-secondary font-bold text-sm">Tandai Dibaca</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row p-4 bg-white dark:bg-gray-800 border-b border-border">
        <TouchableOpacity 
          className={`px-4 py-1.5 rounded-full mr-2 border ${!filterUnread ? 'bg-primary border-primary' : 'bg-transparent border-gray-300'}`}
          onPress={() => setFilterUnread(false)}
        >
          <Text className={`font-bold ${!filterUnread ? 'text-white' : 'text-muted'}`}>Semua</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`px-4 py-1.5 rounded-full border flex-row items-center ${filterUnread ? 'bg-primary border-primary' : 'bg-transparent border-gray-300'}`}
          onPress={() => setFilterUnread(true)}
        >
          <Text className={`font-bold ${filterUnread ? 'text-white' : 'text-muted'}`}>Belum Dibaca</Text>
          {unreadCount > 0 && (
            <View className={`ml-2 px-1.5 rounded-full ${filterUnread ? 'bg-white' : 'bg-primary'}`}>
              <Text className={`text-xs font-bold ${filterUnread ? 'text-primary' : 'text-white'}`}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {isLoading && notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#CC0000" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotification}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="items-center justify-center pt-20 px-6">
              <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
              <Text className="text-onSurface dark:text-white text-lg font-bold mt-4 text-center">
                {filterUnread ? 'Tidak ada notifikasi baru' : 'Belum ada notifikasi'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
