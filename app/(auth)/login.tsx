import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;
    try {
      await login(email, password);
      // layout.tsx will auto redirect to (tabs) upon successful login
    } catch (err) {
      // Error is handled in store
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-background dark:bg-surface">
      <Text className="text-3xl font-bold text-primary mb-8 text-center">PokeDex Login</Text>

      {error && (
        <Text className="text-error mb-4 text-center">{error}</Text>
      )}

      <View className="mb-4">
        <Text className="text-onSurface dark:text-gray-200 mb-2 font-semibold">Email</Text>
        <TextInput
          className="h-12 px-4 rounded-lg border border-border bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
          placeholder="email@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View className="mb-8">
        <Text className="text-onSurface dark:text-gray-200 mb-2 font-semibold">Password</Text>
        <TextInput
          className="h-12 px-4 rounded-lg border border-border bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
          placeholder="********"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        className={`h-12 rounded-lg items-center justify-center ${isLoading ? 'bg-primaryDark' : 'bg-primary'}`}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text className="text-white font-bold text-lg">{isLoading ? 'Loading...' : 'Login'}</Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Text className="text-muted">Belum punya akun? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text className="text-secondary font-bold">Daftar sekarang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
