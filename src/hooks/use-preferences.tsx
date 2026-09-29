import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  type UserPreferences,
} from '@/lib/preferences';

type PreferencesContextValue = {
  ready: boolean;
  preferences: UserPreferences;
  savePreferences: (next: UserPreferences) => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(PREFERENCES_STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const parsed = JSON.parse(raw) as Partial<UserPreferences>;
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      })
      .catch(() => {
        /* оставляем значения по умолчанию */
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const savePreferences = useCallback(async (next: UserPreferences) => {
    setPreferences(next);
    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const value = useMemo(
    () => ({ ready, preferences, savePreferences }),
    [ready, preferences, savePreferences],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences нужно вызывать внутри PreferencesProvider');
  }
  return context;
}
