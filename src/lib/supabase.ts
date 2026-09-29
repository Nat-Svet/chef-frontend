import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupportedStorage } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Задайте EXPO_PUBLIC_SUPABASE_URL и EXPO_PUBLIC_SUPABASE_ANON_KEY в файле .env');
}

// expo-router прогоняет web-сборку через Node (SSR) — там нет ни window, ни
// реального localStorage. На нативных iOS/Android window тоже undefined,
// но AsyncStorage там работает всегда, поэтому SSR отличаем через Platform.OS.
const isServerRender = Platform.OS === 'web' && typeof window === 'undefined';

const memoryStorage: SupportedStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isServerRender ? memoryStorage : (AsyncStorage as SupportedStorage),
    autoRefreshToken: !isServerRender,
    persistSession: !isServerRender,
    detectSessionInUrl: false,
  },
});
