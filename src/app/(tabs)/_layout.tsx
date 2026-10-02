import { Redirect, Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';

import { usePreferences } from '@/hooks/use-preferences';
import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();
  const { preferences } = usePreferences();

  if (!preferences.complete) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.backgroundSelected,
          height: Platform.OS === 'web' ? 64 : 56,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'web' ? 10 : 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 600,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Меню',
          tabBarIcon: () => <Text style={{ fontSize: 16 }}>🥗</Text>,
        }}
      />
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: 'Покупки',
          tabBarIcon: () => <Text style={{ fontSize: 16 }}>🛒</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: () => <Text style={{ fontSize: 16 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
