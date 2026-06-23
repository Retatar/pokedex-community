import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
  title?: string;
}

export default function ErrorScreen({
  message,
  onRetry,
  title = 'Ups, terjadi kesalahan!'
}: ErrorScreenProps) {
  return (
    <View className="flex-1 items-center justify-center p-6 bg-background dark:bg-surface">
      <Ionicons name="alert-circle-outline" size={64} color="#DC2626" />
      <Text className="text-onSurface dark:text-white text-xl font-bold mt-4 text-center">
        {title}
      </Text>
      <Text className="text-muted text-center mt-2 mb-8 leading-5">
        {message}
      </Text>
      <TouchableOpacity
        className="bg-primary w-full max-w-xs h-12 rounded-lg items-center justify-center shadow-md"
        onPress={onRetry}
      >
        <Text className="text-white font-bold text-lg">Coba Lagi</Text>
      </TouchableOpacity>
    </View>
  );
}
