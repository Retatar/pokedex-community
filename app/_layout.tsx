import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { tokenStorage } from '../utils/tokenStorage';
import Toast from '../components/ui/Toast';
import * as SplashScreen from 'expo-splash-screen';
import '../global.css'; // Requires global css for tailwind

// Prevent auto hide until we're ready
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function initializeApp() {
      const seen = await tokenStorage.hasSeenOnboarding();
      setHasSeenOnboarding(seen);
      await checkAuthStatus();
      setIsReady(true);
    }
    initializeApp();
  }, []);

  useEffect(() => {
    if (!isReady || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';

    // Jangan redirect ke onboarding jika user sudah di halaman auth (login/register)
    // Ini mencegah infinite loop setelah onboarding selesai karena state hasSeenOnboarding
    // di RootLayout belum terupdate setelah SecureStore di-set oleh onboarding screen
    if (!hasSeenOnboarding && !inOnboarding && !inAuthGroup) {
      router.replace('/onboarding');
      return;
    }

    if (hasSeenOnboarding) {
      if (isAuthenticated && !inTabsGroup) {
        // User is logged in, but not in tabs
        router.replace('/(tabs)');
      } else if (!isAuthenticated && !inAuthGroup) {
        // User is not logged in and not in auth
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, isReady, isLoading, segments, hasSeenOnboarding]);

  useEffect(() => {
    if (isReady && !isLoading) {
      // Hide splash screen when ready
      setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});
      }, 500); // small delay for smoother transition
    }
  }, [isReady, isLoading]);

  if (!isReady || isLoading) {
    return null; // Return null to keep splash screen visible
  }

  return (
    <>
      <Slot />
      <Toast />
    </>
  );
}
