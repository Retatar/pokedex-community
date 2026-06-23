import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

export default function SettingsScreen() {
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-900 border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#CC0000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-onSurface dark:text-white">Settings</Text>
      </View>

      <View className="p-4">
        {/* Toggle Dark Mode */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-border flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center mr-3">
              <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color="#FFCB05" />
            </View>
            <View>
              <Text className="font-bold text-onSurface dark:text-white text-base">Dark Mode</Text>
              <Text className="text-muted text-xs">Ubah tema tampilan aplikasi</Text>
            </View>
          </View>
          <Switch 
            value={isDarkMode} 
            onValueChange={toggleColorScheme}
            trackColor={{ false: '#D1D5DB', true: '#CC0000' }}
            thumbColor={isDarkMode ? '#FFCB05' : '#F4F3F0'}
          />
        </View>

        {/* About App */}
        <TouchableOpacity 
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-border flex-row justify-between items-center mb-4"
          onPress={() => router.push('/settings/about')}
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center mr-3">
              <Ionicons name="information-circle" size={20} color="#003A8C" />
            </View>
            <View>
              <Text className="font-bold text-onSurface dark:text-white text-base">Tentang Aplikasi</Text>
              <Text className="text-muted text-xs">Informasi versi dan developer</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
