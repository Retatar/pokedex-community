import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import apiClient from '../../services/api/client';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (!email) return;
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setMessage(response.data.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-background dark:bg-surface">
      <Text className="text-3xl font-bold text-primary mb-4 text-center">Reset Password</Text>
      <Text className="text-muted text-center mb-8">
        Masukkan email yang terdaftar. Kami akan mengirimkan instruksi untuk reset password Anda.
      </Text>

      {message ? (
        <Text className="text-success mb-4 text-center font-semibold">{message}</Text>
      ) : null}
      
      {error ? (
        <Text className="text-error mb-4 text-center">{error}</Text>
      ) : null}

      <View className="mb-8">
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

      <TouchableOpacity
        className={`h-12 rounded-lg items-center justify-center ${isLoading ? 'bg-primaryDark' : 'bg-primary'}`}
        onPress={handleReset}
        disabled={isLoading}
      >
        <Text className="text-white font-bold text-lg">{isLoading ? 'Loading...' : 'Kirim Link Reset'}</Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-6 items-center" onPress={() => router.back()}>
        <Text className="text-secondary font-bold">Kembali ke Login</Text>
      </TouchableOpacity>
    </View>
  );
}
