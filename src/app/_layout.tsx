import { ThemeProvider, DarkTheme, DefaultTheme, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ScrollView, Text, useColorScheme, View } from 'react-native';

import { AppErrorBoundary } from '@/components/error-boundary';
import { PhoneShell } from '@/components/phone-shell';
import '@/constants/theme';
import { MenuProvider } from '@/hooks/use-menu';
import { PreferencesProvider, usePreferences } from '@/hooks/use-preferences';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* сплэш уже скрыт системой — не критично */
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // ВРЕМЕННЫЙ отладочный try/catch: ловит только синхронные ошибки в теле
  // самого RootLayout (например, если useColorScheme() или сам вызов
  // createElement по какой-то причине бросает исключение на этом устройстве).
  // Ошибки из дочерних компонентов при рендере/эффектах сюда не попадают —
  // для них уже стоит AppErrorBoundary ниже по дереву. Убрать после отладки.
  try {
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
  } catch (e) {
    const message = e instanceof Error ? `${e.message}\n\n${e.stack ?? ''}` : String(e);
    return (
      <View style={{ flex: 1, backgroundColor: '#FBF7F0', paddingTop: 64 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
            Ошибка запуска (debug):
          </Text>
          <Text selectable style={{ color: '#b00020' }}>
            {message}
          </Text>
        </ScrollView>
      </View>
    );
  }
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
