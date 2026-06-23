import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { tokenStorage } from '../../utils/tokenStorage';

const ONBOARDING_DATA = [
  {
    title: 'Welcome to PokeDex',
    description: 'Jelajahi database Pokémon terlengkap dari berbagai generasi.',
  },
  {
    title: 'Team Builder',
    description: 'Buat tim impianmu dengan kombinasi Pokémon terbaik untuk pertempuran.',
  },
  {
    title: 'Komunitas & Reviews',
    description: 'Berikan rating dan ulasan pada Pokémon favoritmu, serta lihat review dari trainer lain.',
  }
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const handleNext = async () => {
    if (step < ONBOARDING_DATA.length - 1) {
      setStep(step + 1);
    } else {
      await tokenStorage.setHasSeenOnboarding();
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = async () => {
    await tokenStorage.setHasSeenOnboarding();
    router.replace('/(auth)/login');
  };

  const current = ONBOARDING_DATA[step];

  return (
    <View className="flex-1 justify-center items-center px-6 bg-background dark:bg-surface">
      <View className="flex-1 justify-center items-center">
        <View className="w-48 h-48 bg-gray-200 rounded-full mb-8" />
        <Text className="text-2xl font-bold text-onSurface dark:text-white text-center mb-4">
          {current.title}
        </Text>
        <Text className="text-base text-muted text-center leading-6">
          {current.description}
        </Text>
      </View>

      <View className="flex-row items-center justify-between w-full pb-12">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-muted font-semibold">Skip</Text>
        </TouchableOpacity>

        <View className="flex-row">
          {ONBOARDING_DATA.map((_, idx) => (
            <View 
              key={idx} 
              className={`h-2 w-2 rounded-full mx-1 ${idx === step ? 'bg-primary' : 'bg-gray-300'}`} 
            />
          ))}
        </View>

        <TouchableOpacity 
          className="bg-primary px-6 py-3 rounded-full"
          onPress={handleNext}
        >
          <Text className="text-white font-bold">
            {step === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
