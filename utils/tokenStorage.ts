import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'pokedex_refresh_token';
const HAS_SEEN_ONBOARDING_KEY = 'pokedex_has_seen_onboarding';

export const tokenStorage = {
  getRefreshToken: async () => {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setRefreshToken: async (token: string) => {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (e) {
      console.error('Error saving refresh token', e);
    }
  },
  removeRefreshToken: async () => {
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (e) {
      console.error('Error removing refresh token', e);
    }
  },
  hasSeenOnboarding: async () => {
    try {
      const val = await SecureStore.getItemAsync(HAS_SEEN_ONBOARDING_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  },
  setHasSeenOnboarding: async () => {
    try {
      await SecureStore.setItemAsync(HAS_SEEN_ONBOARDING_KEY, 'true');
    } catch (e) {
      console.error('Error saving onboarding flag', e);
    }
  }
};
