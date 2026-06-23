import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTeamStore } from '../../../../store/teams.store';

export default function EditTeamScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { selectedTeam, updateTeam, isLoading, error } = useTeamStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (selectedTeam) {
      setName(selectedTeam.name);
      setDescription(selectedTeam.description || '');
    }
  }, [selectedTeam]);

  const handleSave = async () => {
    if (!name.trim()) return;
    await updateTeam(Number(id), name, description);
    router.back();
  };

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-900 border-b border-border flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-onSurface dark:text-white">Edit Tim</Text>
        </View>
      </View>

      <View className="p-4">
        {error ? <Text className="text-error mb-4">{error}</Text> : null}

        <View className="mb-4">
          <Text className="text-onSurface dark:text-gray-200 mb-2 font-semibold">Nama Tim</Text>
          <TextInput
            className="h-12 px-4 rounded-lg border border-border bg-white dark:bg-gray-800 dark:text-white"
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
          <Text className="text-xs text-muted mt-1 text-right">{name.length}/100</Text>
        </View>

        <View className="mb-8">
          <Text className="text-onSurface dark:text-gray-200 mb-2 font-semibold">Deskripsi (Opsional)</Text>
          <TextInput
            className="px-4 py-3 rounded-lg border border-border bg-white dark:bg-gray-800 dark:text-white min-h-[100px]"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
          <Text className="text-xs text-muted mt-1 text-right">{description.length}/500</Text>
        </View>

        <TouchableOpacity
          className={`h-12 rounded-lg items-center justify-center ${!name.trim() || isLoading ? 'bg-primaryDark opacity-50' : 'bg-primary'}`}
          onPress={handleSave}
          disabled={!name.trim() || isLoading}
        >
          <Text className="text-white font-bold text-lg">{isLoading ? 'Menyimpan...' : 'Update Tim'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
