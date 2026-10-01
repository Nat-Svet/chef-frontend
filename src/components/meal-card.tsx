import { forwardRef } from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
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

          <View style={styles.macros}>
            <Macro label="ккал" value={meal.kcal} />
            <Macro label="Б" value={meal.protein} />
            <Macro label="Ж" value={meal.fat} />
            <Macro label="У" value={meal.carb} />
          </View>

          <View style={styles.tags}>
            {meal.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: theme.primarySoft }]}>
                <ThemedText type="small" style={{ color: theme.primary }}>
                  {tag}
                </ThemedText>
              </View>
            ))}
          </View>
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

function Macro({ label, value }: { label: string; value: number }) {
  return (
    <ThemedText type="small" themeColor="textSecondary">
      {value} {label}
    </ThemedText>
  );
}

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
    flexDirection: 'row',
    gap: Spacing.three,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
});
