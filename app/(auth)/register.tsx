import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirm) return;
    try {
      await register(name, email, password, passwordConfirm);
      // Auto redirects to (tabs) if successful
    } catch (err) {
      // Handle error natively via store
    }
  };

  return (
    <ScrollView className="flex-1 bg-background dark:bg-surface" contentContainerStyle={{ padding: 24, justifyContent: 'center', minHeight: '100%' }}>
      <Text className="text-3xl font-bold text-primary mb-8 text-center">Buat Akun</Text>

      {error && (
        <Text className="text-error mb-4 text-center">{error}</Text>
      )}

      <View className="mb-4">
        <Text className="text-onSurface dark:text-gray-200 mb-2 font-semibold">Nama Lengkap</Text>
        <TextInput
          className="h-12 px-4 rounded-lg border border-border bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
          placeholder="Ash Ketchum"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View className="mb-4">
        <Text className="text-onSurface dark:text-gray-200 mb-2 font-semibold">Email</Text>
        <TextInput
          className="h-12 px-4 rounded-lg border border-border bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
          placeholder="ash@pallet.town"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View className="mb-4">
        <Text className="text-onSurface dark:text-gray-200 mb-2 font-semibold">Password</Text>
        <TextInput
          className="h-12 px-4 rounded-lg border border-border bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
          placeholder="Minimal 8 karakter"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View className="mb-8">
        <Text className="text-onSurface dark:text-gray-200 mb-2 font-semibold">Konfirmasi Password</Text>
        <TextInput
          className="h-12 px-4 rounded-lg border border-border bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
          placeholder="Ulangi password"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        className={`h-12 rounded-lg items-center justify-center ${isLoading ? 'bg-primaryDark' : 'bg-primary'}`}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text className="text-white font-bold text-lg">{isLoading ? 'Loading...' : 'Register'}</Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Text className="text-muted">Sudah punya akun? </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-secondary font-bold">Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
