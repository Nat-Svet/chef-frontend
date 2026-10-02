import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePreferences } from '@/hooks/use-preferences';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const { preferences } = usePreferences();

  return (
    <Screen>
      <ThemedText type="heading">Профиль</ThemedText>
      <ThemedText themeColor="textSecondary">
        Данные будут храниться в таблице profiles и привязываться к auth.users.
      </ThemedText>

      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="small" themeColor="textSecondary">
          Недельный лимит
        </ThemedText>
        <ThemedText type="heading">{preferences.budgetLimit.toLocaleString('ru-RU')} ₽</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Supabase: подключено
        </ThemedText>
        {preferences.profileId ? (
          <ThemedText type="small" themeColor="textSecondary">
            ID профиля: {preferences.profileId.slice(0, 8)}…
          </ThemedText>
        ) : null}
      </ThemedView>

      <Section title="Магазины" items={preferences.selectedStores} />
      <Section title="Питание" items={preferences.dietTags} />
      <Section title="Техника" items={preferences.equipmentTags} />

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/onboarding')}
        style={[styles.cta, { backgroundColor: theme.primary }]}>
        <ThemedText type="smallBold" style={styles.ctaLabel}>
          Настроить предпочтения
        </ThemedText>
      </Pressable>
    </Screen>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">{title}</ThemedText>
      <View style={styles.chips}>
        {(items.length ? items : ['не выбрано']).map((item) => (
          <View key={item} style={[styles.chip, { backgroundColor: theme.primarySoft }]}>
            <ThemedText type="small" style={{ color: theme.primary }}>
              {item}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  section: {
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
  },
  ctaLabel: {
    color: '#fff',
  },
});
