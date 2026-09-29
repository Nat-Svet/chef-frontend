import { forwardRef } from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Meal } from '@/lib/menu';
import { useTheme } from '@/hooks/use-theme';

type MealCardProps = PressableProps & {
  meal: Meal;
};

const MEAL_EMOJI: Record<Meal['mealType'], string> = {
  завтрак: '🌅',
  обед: '🍽️',
  ужин: '🌙',
};

export const MealCard = forwardRef<View, MealCardProps>(function MealCard(
  { meal, style, ...rest },
  ref,
) {
  const theme = useTheme();

  return (
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
          <ThemedText type="small" themeColor="textSecondary">
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
