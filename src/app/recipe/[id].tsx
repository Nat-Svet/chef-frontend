import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { EQUIPMENT_OPTIONS } from '@/constants/catalog';
import { Spacing } from '@/constants/theme';
import { useMenu } from '@/hooks/use-menu';
import { useTheme } from '@/hooks/use-theme';
import { formatGrams } from '@/lib/menu';


export default function RecipeScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getMealById, portions, setPortions } = useMenu();
  const meal = getMealById(id);

  const ingredients = useMemo(
    () =>
      meal?.ingredients.map((item) => ({
        name: item.name,
        amount: formatGrams(item.grams, portions),
      })) ?? [],
    [meal, portions],
  );

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  if (!meal) {
    return (
      <Screen>
        <ThemedText type="heading">Рецепт не найден</ThemedText>
        <Pressable accessibilityRole="button" onPress={goBack} style={[styles.cta, { backgroundColor: theme.primary }]}>
          <ThemedText type="smallBold" style={styles.ctaLabel}>
            Назад к меню
          </ThemedText>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable accessibilityRole="button" onPress={goBack}>
        <ThemedText type="smallBold" style={{ color: theme.primary }}>
          ← Назад к меню
        </ThemedText>
      </Pressable>

      <ThemedView type="primarySoft" style={styles.hero}>
        <ThemedText style={styles.heroEmoji}>{meal.emoji}</ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.primary }}>
          {meal.mealType.toUpperCase()}
        </ThemedText>
      </ThemedView>

      <ThemedText type="heading">{meal.title}</ThemedText>

      <View style={styles.stats}>
        <Stat label="Ккал" value={String(meal.kcal)} />
        <Stat label="Белки" value={`${meal.protein} г`} />
        <Stat label="Жиры" value={`${meal.fat} г`} />
        <Stat label="Углеводы" value={`${meal.carb} г`} />
      </View>

      <View style={styles.metaRow}>
        <ThemedView type="backgroundElement" style={styles.metaChip}>
          <ThemedText type="smallBold">⏱ {meal.cookingTime} мин</ThemedText>
        </ThemedView>
        <ThemedView type="backgroundElement" style={styles.metaChip}>
          <ThemedText type="smallBold">
            {EQUIPMENT_OPTIONS.find((option) => option.id === meal.equipment)?.emoji ?? '🍳'} {meal.equipment}
          </ThemedText>
        </ThemedView>
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        КБЖУ указаны на 1 порцию
      </ThemedText>

      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <ThemedText type="smallBold">Ингредиенты</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            на {portions} {portionWord(portions)}
          </ThemedText>
        </View>

        <View style={[styles.stepper, { backgroundColor: theme.backgroundElement }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Меньше порций"
            disabled={portions <= 1}
            onPress={() => void setPortions(portions - 1)}
            style={[styles.stepBtn, { backgroundColor: theme.primarySoft, opacity: portions <= 1 ? 0.4 : 1 }]}>
            <ThemedText type="heading" style={{ color: theme.primary }}>
              −
            </ThemedText>
          </Pressable>
          <View style={styles.stepValue}>
            <ThemedText type="heading">{portions}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {portionWord(portions)}
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Больше порций"
            disabled={portions >= 20}
            onPress={() => void setPortions(portions + 1)}
            style={[styles.stepBtn, { backgroundColor: theme.primary, opacity: portions >= 20 ? 0.4 : 1 }]}>
            <ThemedText type="heading" style={{ color: '#fff' }}>
              +
            </ThemedText>
          </Pressable>
        </View>

        <ThemedView type="backgroundElement" style={styles.listCard}>
          {ingredients.map((item, index) => (
            <View
              key={item.name}
              style={[
                styles.ingredientRow,
                index < ingredients.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.backgroundSelected,
                },
              ]}>
              <ThemedText>{item.name}</ThemedText>
              <ThemedText type="smallBold" style={{ color: theme.primary }}>
                {item.amount}
              </ThemedText>
            </View>
          ))}
        </ThemedView>
      </View>

      <View style={styles.block}>
        <ThemedText type="smallBold">Приготовление</ThemedText>
        {meal.steps.map((step, index) => (
          <ThemedView key={step} type="backgroundElement" style={styles.stepCard}>
            <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
              <ThemedText type="smallBold" style={styles.ctaLabel}>
                {index + 1}
              </ThemedText>
            </View>
            <ThemedText style={styles.stepText}>{step}</ThemedText>
          </ThemedView>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={goBack}
        style={[styles.cta, { backgroundColor: theme.primary }]}>
        <ThemedText type="smallBold" style={styles.ctaLabel}>
          Назад к меню
        </ThemedText>
      </Pressable>
    </Screen>
  );
}

function portionWord(count: number) {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'порций';
  if (mod10 === 1) return 'порция';
  if (mod10 >= 2 && mod10 <= 4) return 'порции';
  return 'порций';
}

function Stat({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.stat}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={{ color: theme.primary }}>
        {value}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 180,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  heroEmoji: {
    fontSize: 64,
    lineHeight: 72,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  stat: {
    width: '48%',
    flexGrow: 1,
    borderRadius: Spacing.three,
    padding: Spacing.two,
    gap: Spacing.half,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metaChip: {
    flex: 1,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
  },
  block: {
    gap: Spacing.two,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Spacing.four,
    padding: Spacing.two,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: {
    alignItems: 'center',
    minWidth: 80,
  },
  listCard: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    borderRadius: Spacing.four,
    padding: Spacing.three,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
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
