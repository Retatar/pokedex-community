import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const COLORS = {
  primary: '#CC0000',
  primaryDark: '#990000',
  secondary: '#003A8C',
  accent: '#FFCB05',
  surface: '#1A1A2E',
  onSurface: '#374151',
  muted: '#6B7280',
  border: '#E5E7EB',
  background: '#F9FAFB',
  success: '#059669',
  error: '#DC2626',
  warning: '#D97706',
};

// Environment variable untuk production API URL
const productionApiUrl = process.env.EXPO_PUBLIC_API_URL;

// Deteksi otomatis IP komputer tempat Expo Packager berjalan (development)
const debuggerHost = Constants.expoConfig?.hostUri;
let HOST = 'localhost';
let API_BASE_URL_INTERNAL = '';

if (productionApiUrl) {
  // Gunakan URL production dari env variable jika ada
  API_BASE_URL_INTERNAL = productionApiUrl;
} else {
  // Development: deteksi localhost atau emulator
  if (debuggerHost) {
    // Ambil IP (hilangkan port)
    HOST = debuggerHost.split(':')[0];
  } else if (Platform.OS === 'android') {
    // Fallback untuk Android Emulator jika bukan Expo Go
    HOST = '10.0.2.2';
  }

  API_BASE_URL_INTERNAL = `http://${HOST}:3000/v1`;
}

export const API_BASE_URL = API_BASE_URL_INTERNAL;

export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
