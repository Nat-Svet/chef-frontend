import { ThemeProvider, DarkTheme, DefaultTheme, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { AppErrorBoundary } from '@/components/error-boundary';
import { AppSplash } from '@/components/app-splash';
import { PhoneShell } from '@/components/phone-shell';
import '@/constants/theme';
import { MenuProvider } from '@/hooks/use-menu';
import { PreferencesProvider, usePreferences } from '@/hooks/use-preferences';

const SPLASH_MIN_DURATION = 4500;

SplashScreen.preventAutoHideAsync().catch(() => {
  /* сплэш уже скрыт системой — не критично */
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PreferencesProvider>
          <MenuProvider>
            <PhoneShell>
              <AppStack />
            </PhoneShell>
          </MenuProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}

function AppStack() {
  const router = useRouter();
  const segments = useSegments();
  const { ready, preferences } = usePreferences();
  const [splashElapsed, setSplashElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSplashElapsed(true), SPLASH_MIN_DURATION);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  const showAppSplash = !ready || !splashElapsed;

  useEffect(() => {
    if (showAppSplash) return;
    // Умный старт: впервые — на опрос; повторно — сразу на сохранённое меню.
    const onOnboarding = segments[0] === 'onboarding';
    if (!preferences.complete && !onOnboarding) {
      router.replace('/onboarding');
    }
  }, [showAppSplash, preferences.complete, segments, router]);

  if (showAppSplash) {
    return <AppSplash />;
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
