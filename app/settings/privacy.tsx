import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-900 border-b border-border flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#CC0000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-onSurface dark:text-white">Kebijakan Privasi</Text>
      </View>

      <ScrollView className="p-6">
        <Text className="text-2xl font-bold text-onSurface dark:text-white mb-4">Privacy Policy</Text>

        <Text className="font-bold text-onSurface dark:text-white mb-2">Pengumpulan Data</Text>
        <Text className="text-onSurface dark:text-gray-300 leading-6 mb-4">
          Kami mengumpulkan data berupa email dan nama tampilan untuk kebutuhan autentikasi dan fungsionalitas komunitas (Reviews & Teams).
        </Text>

        <Text className="font-bold text-onSurface dark:text-white mb-2">Penyimpanan</Text>
        <Text className="text-onSurface dark:text-gray-300 leading-6 mb-4">
          Data foto profil akan disimpan melalui layanan pihak ketiga (Cloudinary). Password Anda dienkripsi dengan standar yang kuat (bcrypt).
        </Text>
      </ScrollView>
    </View>
  );
}
