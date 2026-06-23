import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-900 border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#CC0000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-onSurface dark:text-white">Syarat dan Ketentuan</Text>
      </View>

      <ScrollView className="p-6">
        <Text className="text-2xl font-bold text-onSurface dark:text-white mb-4">Terms of Service</Text>
        <Text className="text-muted mb-4">Berlaku sejak: 22 Juni 2026</Text>

        <Text className="font-bold text-onSurface dark:text-white mb-2">1. Penggunaan Aplikasi</Text>
        <Text className="text-onSurface dark:text-gray-300 leading-6 mb-4">
          Dengan menggunakan aplikasi ini, Anda setuju untuk mematuhi semua aturan komunitas yang berlaku. Dilarang memberikan ulasan yang mengandung unsur kebencian atau spam.
        </Text>

        <Text className="font-bold text-onSurface dark:text-white mb-2">2. Data Pokémon</Text>
        <Text className="text-onSurface dark:text-gray-300 leading-6 mb-4">
          Seluruh data dan aset gambar Pokémon adalah hak cipta dari The Pokémon Company / Nintendo dan disediakan melalui layanan gratis PokeAPI.
        </Text>
      </ScrollView>
    </View>
  );
}
