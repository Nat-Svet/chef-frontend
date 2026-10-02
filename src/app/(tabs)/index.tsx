import { Link, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { MealCard } from '@/components/meal-card';
import { MenuSpinner } from '@/components/menu-spinner';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WEEK_DAYS, type WeekDay } from '@/constants/catalog';
import { Spacing } from '@/constants/theme';
import { useMenu } from '@/hooks/use-menu';
import { usePreferences } from '@/hooks/use-preferences';
import { useTheme } from '@/hooks/use-theme';
import { mealsForDay } from '@/lib/menu';

export default function MenuScreen() {
  const theme = useTheme();
  const { preferences } = usePreferences();
  const { ready, menu, generating, error, generateMenu, regenerateMeal, regeneratingSlot } = useMenu();
  const [day, setDay] = useState<WeekDay>('Пн');
  const autoStarted = useRef(false);

  useEffect(() => {
    if (!ready || menu || error || autoStarted.current) return;
    if (!preferences.profileId) return;
    autoStarted.current = true;
    void generateMenu(preferences.profileId);
  }, [ready, menu, error, preferences.profileId, generateMenu]);

  function regenerate() {
    if (!preferences.profileId || generating) return;
    autoStarted.current = true;
    void generateMenu(preferences.profileId);
  }

  if (!ready || generating || (!menu && !error && preferences.profileId)) {
    return <MenuSpinner />;
  }

  if (!preferences.profileId) {
    return (
      <Screen>
        <ThemedText type="heading">Нужен профиль в облаке</ThemedText>
        <ThemedText themeColor="textSecondary">
          Сохраните ответы опроса — тогда мы сможем составить меню специально для вас.
        </ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/onboarding')}
          style={[styles.cta, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={styles.ctaLabel}>
            Открыть опрос
          </ThemedText>
        </Pressable>
      </Screen>
    );
  }

  if (error && !menu) {
    return (
      <Screen>
        <ThemedText type="heading">Рацион не собрался</ThemedText>
        <ThemedText themeColor="textSecondary">{error}</ThemedText>
        <Pressable
          accessibilityRole="button"
          onPress={() => void regenerate()}
          style={[styles.cta, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={styles.ctaLabel}>
            Попробовать снова
          </ThemedText>
        </Pressable>
      </Screen>
    );
  }

  if (!menu) {
    return <MenuSpinner />;
  }

  const spent = menu.totalCost;
  const remaining = Math.max(0, preferences.budgetLimit - spent);
  const progress = preferences.budgetLimit > 0 ? spent / preferences.budgetLimit : 0;
  const meals = mealsForDay(menu, day);

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="heading">Ваше меню на неделю</ThemedText>
        <Pressable accessibilityRole="button" onPress={() => router.push('/onboarding')} style={styles.settingsLink}>
          <ThemedText style={[styles.smallNote, { color: theme.primary }]}>
            ✨ Изменить рацион и бюджет · диета, техника, магазины — всё можно поменять
          </ThemedText>
        </Pressable>
      </View>

      {menu.isFallback ? (
        <ThemedView type="accentSoft" style={styles.fallbackBanner}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            ⚠️ Шеф сейчас перегружен
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Мы временно собрали для вас сбалансированный рацион из нашего проверенного каталога рецептов!
          </ThemedText>
        </ThemedView>
      ) : null}

      <ThemedView type="backgroundElement" style={styles.budgetCard}>
        <View style={styles.budgetRow}>
          <ThemedText type="smallBold">Недельный бюджет</ThemedText>
          <ThemedText type="smallBold" style={{ color: theme.primary }}>
            {remaining.toLocaleString('ru-RU')} ₽ осталось
          </ThemedText>
        </View>
        <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
          <View
            style={[
              styles.fill,
              { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: theme.primary },
            ]}
          />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Корзина {spent.toLocaleString('ru-RU')} из {preferences.budgetLimit.toLocaleString('ru-RU')} ₽
        </ThemedText>
      </ThemedView>

      <View style={styles.days}>
        {WEEK_DAYS.map((item) => {
          const selected = item === day;
          return (
            <Pressable
              key={item}
              onPress={() => setDay(item)}
              style={[
                styles.day,
                { backgroundColor: selected ? theme.primary : theme.backgroundElement },
              ]}>
              <ThemedText type="smallBold" style={{ color: selected ? '#fff' : theme.text }}>
                {item}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <ThemedText type="smallBold">Рацион · {day}</ThemedText>

      {meals.map((meal) => {
        const slotKey = `${day}-${meal.mealType}`;
        return (
          <Link key={slotKey} href={`/recipe/${meal.id}`} asChild>
            <MealCard
              meal={meal}
              regenerating={regeneratingSlot === slotKey}
              onRegenerate={() => void regenerateMeal(day, meal.mealType)}
            />
          </Link>
        );
      })}

      {menu.scarcityNotice ? (
        <ThemedText style={[styles.smallNote, styles.centerNote, { color: theme.textSecondary }]}>
          Подобрали максимум уникальных блюд по вашим фильтрам! Чтобы рацион стал ещё разнообразнее, попробуйте
          расширить настройки.
        </ThemedText>
      ) : null}

      <Pressable
        onPress={() => router.push('/shopping-list')}
        style={[styles.cta, { backgroundColor: theme.accent }]}>
        <ThemedText type="smallBold" style={styles.ctaLabel}>
          Купить в один клик
        </ThemedText>
      </Pressable>

      <Pressable accessibilityRole="button" onPress={() => void regenerate()} disabled={generating}>
        <ThemedText type="smallBold" style={[styles.retry, { color: theme.primary }]}>
          Собрать рацион заново
        </ThemedText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  fallbackBanner: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  settingsLink: {
    paddingVertical: Spacing.one,
  },
  smallNote: {
    fontSize: 12,
    lineHeight: 17,
  },
  centerNote: {
    textAlign: 'center',
  },
  budgetCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  days: {
    flexDirection: 'row',
    gap: 4,
  },
  day: {
    flex: 1,
    minWidth: 0,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
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
  retry: {
    textAlign: 'center',
  },
});
