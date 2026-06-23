import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Image, Modal } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/auth.store';

const POKEMON_AVATARS = [
  1, 4, 7, 25, 39, 54, 94, 133, 143, 149, 150, 151 // Bulbasaur, Charmander, Squirtle, Pikachu, Jigglypuff, Psyduck, Gengar, Eevee, Snorlax, Dragonite, Mewtwo, Mew
];

const getSpriteUrl = (id: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, isLoading, error } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [imageUri, setImageUri] = useState<string | null>(user?.avatar_url || null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || name.length < 2) return;

    try {
      await updateProfile({
        name,
        bio,
        avatar_url: imageUri
      } as any);
      router.replace('/(tabs)/profile');
    } catch (e) {
      // Handle in store
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-surface">
      <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-900 border-b border-border flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')} className="mr-3">
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-onSurface dark:text-white">Edit Profil</Text>
        </View>
      </View>

      <ScrollView className="p-4">
        {error ? <Text className="text-error mb-4">{error}</Text> : null}

        <View className="items-center mb-8">
          <TouchableOpacity onPress={() => setShowAvatarModal(true)} className="relative">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-primary"
                resizeMode="cover"
              />
            ) : (
              <View className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center border-2 border-primary">
                <Text className="text-3xl font-bold text-primary capitalize">{user?.name?.charAt(0)}</Text>
              </View>
            )}
            <View className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-white dark:border-gray-900">
              <Ionicons name="color-palette" size={16} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="text-onSurface dark:text-gray-200 mb-2 font-semibold">Nama Tampilan (Minimal 2 karakter)</Text>
          <TextInput
            className="h-12 px-4 rounded-lg border border-border bg-white dark:bg-gray-800 dark:text-white"
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
          <Text className="text-xs text-muted mt-1 text-right">{name.length}/100</Text>
        </View>

        <View className="mb-8">
          <Text className="text-onSurface dark:text-gray-200 mb-2 font-semibold">Bio Singkat (Opsional)</Text>
          <TextInput
            className="px-4 py-3 rounded-lg border border-border bg-white dark:bg-gray-800 dark:text-white min-h-[100px]"
            value={bio}
            onChangeText={setBio}
            multiline
            textAlignVertical="top"
            maxLength={200}
          />
          <Text className="text-xs text-muted mt-1 text-right">{bio.length}/200</Text>
        </View>

        <TouchableOpacity
          className={`h-12 rounded-lg items-center justify-center ${name.length < 2 || isLoading ? 'bg-primaryDark opacity-50' : 'bg-primary'}`}
          onPress={handleSave}
          disabled={name.length < 2 || isLoading}
        >
          {isLoading ? (
             <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
             <Text className="text-white font-bold text-lg">Simpan Perubahan</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Avatar Selection Modal */}
      <Modal visible={showAvatarModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl h-[60%]">
            <View className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-row justify-between items-center">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">Pilih Avatar Pokémon</Text>
              <TouchableOpacity onPress={() => setShowAvatarModal(false)} className="w-8 h-8 items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <View className="flex-row flex-wrap justify-center">
                {POKEMON_AVATARS.map((id) => (
                  <TouchableOpacity
                    key={id}
                    className={`w-24 h-24 m-2 rounded-xl items-center justify-center border-2 ${imageUri === getSpriteUrl(id) ? 'border-primary bg-primary/10' : 'border-transparent bg-gray-100 dark:bg-gray-800'}`}
                    onPress={() => {
                      setImageUri(getSpriteUrl(id));
                      setShowAvatarModal(false);
                    }}
                  >
                    <Image source={{ uri: getSpriteUrl(id) }} className="w-20 h-20" resizeMode="contain" />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
