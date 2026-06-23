import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-900 border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#CC0000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-onSurface dark:text-white">Tentang</Text>
      </View>

      <ScrollView className="p-6">
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-4">
            <Ionicons name="scan-circle" size={48} color="white" />
          </View>
          <Text className="text-2xl font-bold text-onSurface dark:text-white">PokeDex Community</Text>
          <Text className="text-muted mt-1">Version 1.0.0</Text>
        </View>

        <Text className="text-onSurface dark:text-gray-200 leading-6 mb-8 text-center">
          Aplikasi mobile berbasis React Native yang menggabungkan data Pokémon dari PokeAPI dengan backend internal untuk manajemen tim, ulasan, dan komunitas.
        </Text>

        <Text className="font-bold text-lg text-onSurface dark:text-white mb-2">Tech Stack</Text>
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-border mb-8">
          <Text className="text-onSurface dark:text-gray-300 mb-1">• Expo React Native</Text>
          <Text className="text-onSurface dark:text-gray-300 mb-1">• Zustand</Text>
          <Text className="text-onSurface dark:text-gray-300 mb-1">• NativeWind (TailwindCSS)</Text>
          <Text className="text-onSurface dark:text-gray-300 mb-1">• Node.js / Express</Text>
          <Text className="text-onSurface dark:text-gray-300">• MySQL</Text>
        </View>

        <View className="items-center">
          <Text className="text-muted text-xs">Developed for Portfolio</Text>
          <Text className="text-muted text-xs">© 2026</Text>
        </View>
      </ScrollView>
    </View>
  );
}
