import { ThemeProvider, DarkTheme, DefaultTheme, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { PhoneShell } from '@/components/phone-shell';
import '@/constants/theme';
import { MenuProvider } from '@/hooks/use-menu';
import { PreferencesProvider, usePreferences } from '@/hooks/use-preferences';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PreferencesProvider>
        <MenuProvider>
          <PhoneShell>
            <AppStack />
          </PhoneShell>
        </MenuProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}

function AppStack() {
  const router = useRouter();
  const segments = useSegments();
  const { ready, preferences } = usePreferences();

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const onOnboarding = segments[0] === 'onboarding';
    if (!preferences.complete && !onOnboarding) {
      router.replace('/onboarding');
    }
  }, [ready, preferences.complete, segments, router]);

  if (!ready) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { flex: 1 } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: preferences.complete }} />
      <Stack.Screen name="recipe/[id]" />
      <Stack.Screen name="cart" />
    </Stack>
  );
}
