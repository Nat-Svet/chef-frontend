import { forwardRef } from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EQUIPMENT_TAGS, NO_COOK_TAG } from '@/constants/catalog';
import { Spacing } from '@/constants/theme';
import { usePreferences } from '@/hooks/use-preferences';
import type { Meal } from '@/lib/menu';
import { useTheme } from '@/hooks/use-theme';

type MealCardProps = PressableProps & {
  meal: Meal;
  onRegenerate?: () => void;
  regenerating?: boolean;
};

const MEAL_EMOJI: Record<Meal['mealType'], string> = {
  завтрак: '🌅',
  обед: '🍽️',
  ужин: '🌙',
};

export const MealCard = forwardRef<View, MealCardProps>(function MealCard(
  { meal, onRegenerate, regenerating, style, ...rest },
  ref,
) {
  const theme = useTheme();
  const { preferences } = usePreferences();

  const equipment = meal.tags.filter((tag) => (EQUIPMENT_TAGS as readonly string[]).includes(tag));
  const dietTags = meal.tags.filter((tag) => !(EQUIPMENT_TAGS as readonly string[]).includes(tag));
  const primaryTags = dietTags.filter((tag) => preferences.dietTags.includes(tag));
  const secondaryTags = dietTags.filter((tag) => !preferences.dietTags.includes(tag));

  // Кнопка замены — СОСЕДНИЙ Pressable, а не вложенный в навигационный:
  // на react-native-web клик по вложенному Pressable всё равно
  // "прорывался" до родительской ссылки Link даже со stopPropagation.
  return (
    <View style={styles.wrap}>
      <Pressable
        ref={ref}
        accessibilityRole="link"
        {...rest}
        style={(state) => [
          styles.pressable,
          state.pressed && styles.pressed,
          typeof style === 'function' ? style(state) : style,
        ]}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.topRow}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {MEAL_EMOJI[meal.mealType]} {meal.mealType}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={onRegenerate ? styles.timeWithRegen : undefined}>
              {meal.cookingTime} мин
            </ThemedText>
          </View>

          <ThemedText type="default" style={styles.title}>
            {meal.title}
          </ThemedText>

          <ThemedText style={[styles.macros, { color: theme.textSecondary }]}>
            {meal.kcal} ккал · Б {meal.protein} · Ж {meal.fat} · У {meal.carb}
          </ThemedText>

          {dietTags.length ? (
            <View style={styles.tags}>
              {primaryTags.map((tag) => (
                <View key={tag} style={[styles.tagPrimary, { backgroundColor: theme.primary }]}>
                  <ThemedText style={styles.tagPrimaryLabel}>{tag}</ThemedText>
                </View>
              ))}
              {secondaryTags.map((tag) => (
                <View key={tag} style={[styles.tagSecondary, { backgroundColor: theme.backgroundSelected }]}>
                  <ThemedText style={[styles.tagSecondaryLabel, { color: theme.textSecondary }]}>{tag}</ThemedText>
                </View>
              ))}
            </View>
          ) : null}

          {equipment.length ? (
            <ThemedText style={[styles.equipment, { color: theme.textSecondary }]}>
              {equipment.length === 1 && equipment[0] === NO_COOK_TAG ? 'Готовить не нужно' : `Понадобится: ${equipment.join(', ')}`}
            </ThemedText>
          ) : null}
        </ThemedView>
      </Pressable>

      {onRegenerate ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Заменить блюдо"
          hitSlop={8}
          disabled={regenerating}
          onPress={onRegenerate}
          style={({ pressed }) => [styles.regenButton, pressed && styles.pressed]}>
          <ThemedText style={styles.regenIcon}>{regenerating ? '⏳' : '🔄'}</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    position: 'relative',
  },
  pressable: {
    width: '100%',
  },
  pressed: {
    opacity: 0.85,
  },
  card: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeWithRegen: {
    paddingRight: 28,
  },
  regenButton: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  regenIcon: {
    fontSize: 14,
  },
  title: {
    fontWeight: 700,
    fontSize: 18,
    lineHeight: 24,
  },
  macros: {
    fontSize: 11,
    lineHeight: 15,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.one,
  },
  tagPrimary: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagPrimaryLabel: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  tagSecondary: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagSecondaryLabel: {
    fontSize: 10,
    lineHeight: 14,
  },
  equipment: {
    fontSize: 11,
    lineHeight: 15,
  },
});
