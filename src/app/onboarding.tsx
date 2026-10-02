import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DIET_OPTIONS, EQUIPMENT_OPTIONS, STORE_OPTIONS } from '@/constants/catalog';
import { Spacing } from '@/constants/theme';
import { useMenu } from '@/hooks/use-menu';
import { usePreferences } from '@/hooks/use-preferences';
import { useTheme } from '@/hooks/use-theme';
import { upsertGuestProfile } from '@/lib/save-profile';

const BUDGET_STEP = 500;
const BUDGET_MIN = 1000;
const BUDGET_MAX = 30000;

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export default function OnboardingScreen() {
  const theme = useTheme();
  const { preferences, savePreferences } = usePreferences();
  const { clearMenu } = useMenu();
  const [diet, setDiet] = useState<string[]>(preferences.dietTags.slice(0, 1));
  const [budget, setBudget] = useState(preferences.budgetLimit);
  const [equipment, setEquipment] = useState<string[]>(preferences.equipmentTags);
  const [stores, setStores] = useState<string[]>(preferences.selectedStores.slice(0, 1));

  const [saving, setSaving] = useState(false);

  const cardColors = { backgroundColor: theme.card, borderColor: theme.backgroundSelected };
  const isEditing = preferences.complete;
  const canGenerate = diet.length > 0 && equipment.length > 0 && stores.length > 0 && !saving;

  async function generateMenu() {
    if (diet.length === 0 || equipment.length === 0 || stores.length === 0 || saving) return;
    setSaving(true);

    const nextPreferences = {
      complete: true,
      budgetLimit: budget,
      dietTags: diet,
      equipmentTags: equipment,
      selectedStores: stores,
      profileId: preferences.profileId,
      portions: preferences.portions ?? 1,
    };

    try {
      nextPreferences.profileId = await upsertGuestProfile(
        {
          budgetLimit: budget,
          selectedStores: stores,
          dietTags: diet,
          equipmentTags: equipment,
        },
        preferences.profileId,
      );
    } catch (error) {
      console.error('Supabase profile save failed:', error);
    }

    await savePreferences(nextPreferences);
    await clearMenu();
    setSaving(false);
    router.replace('/');
  }

  return (
    <Screen>
      <View style={styles.header}>
        {isEditing ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}>
            <ThemedText type="smallBold" style={{ color: theme.primary }}>
              ← К меню
            </ThemedText>
          </Pressable>
        ) : null}
        <ThemedText type="smallBold" themeColor="textSecondary">
          {isEditing ? 'КОРРЕКТИРОВКА' : 'ШАГ 1 ИЗ 1 · ОПРОС'}
        </ThemedText>
        <ThemedText type="heading">
          {isEditing ? 'Изменим параметры недели' : 'Соберём меню на неделю'}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
          Четыре коротких ответа — и меню уложится в ваш бюджет, технику и магазины.
        </ThemedText>
      </View>

      <View style={[styles.block, cardColors]}>
        <ThemedText type="smallBold">Главная цель недели</ThemedText>
        <View style={styles.tags}>
          {DIET_OPTIONS.map((option) => {
            const active = diet.includes(option.id);
            return (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => setDiet([option.id])}
                style={[
                  styles.tag,
                  {
                    backgroundColor: active ? theme.primary : theme.backgroundElement,
                  },
                ]}>
                <ThemedText type="smallBold" style={{ color: active ? '#fff' : theme.text }}>
                  {option.emoji} {option.label}
                </ThemedText>
                <ThemedText type="small" style={[styles.tagHint, { color: active ? 'rgba(255,255,255,0.85)' : theme.textSecondary }]}>
                  {option.hint}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.block, cardColors]}>
        <ThemedText type="smallBold">Недельный бюджет</ThemedText>
        <ThemedView type="backgroundElement" style={styles.budgetCard}>
          <ThemedText type="small" themeColor="textSecondary">
            Лимит на продукты
          </ThemedText>
          <View style={styles.budgetRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setBudget((value) => Math.max(BUDGET_MIN, value - BUDGET_STEP))}
              style={[styles.stepBtn, { backgroundColor: theme.primarySoft }]}>
              <ThemedText type="heading" style={{ color: theme.primary }}>
                −
              </ThemedText>
            </Pressable>
            <View style={styles.budgetValue}>
              <ThemedText type="heading" style={styles.budgetNumber}>
                {budget.toLocaleString('ru-RU')} ₽
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                шагами по {BUDGET_STEP} ₽
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setBudget((value) => Math.min(BUDGET_MAX, value + BUDGET_STEP))}
              style={[styles.stepBtn, { backgroundColor: theme.primary }]}>
              <ThemedText type="heading" style={{ color: '#fff' }}>
                +
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </View>

      <View style={[styles.block, cardColors]}>
        <ThemedText type="smallBold">Доступная кухонная техника</ThemedText>
        {EQUIPMENT_OPTIONS.map((option) => {
          const active = equipment.includes(option.id);
          return (
            <Pressable
              key={option.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              onPress={() => setEquipment(toggleValue(equipment, option.id))}
              style={[
                styles.selectCard,
                {
                  backgroundColor: active ? theme.primarySoft : theme.backgroundElement,
                  borderColor: active ? theme.primary : 'transparent',
                },
              ]}>
              <ThemedText style={styles.cardEmoji}>{option.emoji}</ThemedText>
              <ThemedText type="smallBold" style={styles.cardTitle}>
                {option.id}
              </ThemedText>
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: active ? theme.primary : theme.background,
                    borderColor: active ? theme.primary : theme.backgroundSelected,
                  },
                ]}>
                {active ? (
                  <ThemedText type="smallBold" style={styles.checkMark}>
                    ✓
                  </ThemedText>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.block, cardColors]}>
        <ThemedText type="smallBold">Любимый магазин</ThemedText>
        {STORE_OPTIONS.map((option) => {
          const active = stores.includes(option.id);
          return (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => setStores([option.id])}
              style={[
                styles.selectCard,
                {
                  backgroundColor: active ? theme.accentSoft : theme.backgroundElement,
                  borderColor: active ? theme.accent : 'transparent',
                },
              ]}>
              <View style={[styles.logo, { backgroundColor: active ? theme.accent : theme.backgroundSelected }]}>
                <ThemedText style={styles.cardEmoji}>{option.emoji}</ThemedText>
              </View>
              <View style={styles.cardCopy}>
                <ThemedText type="smallBold">{option.id}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {option.hint}
                </ThemedText>
              </View>
              <View style={[styles.radio, { borderColor: active ? theme.accent : theme.backgroundSelected }]}>
                {active ? <View style={[styles.radioDot, { backgroundColor: theme.accent }]} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={generateMenu}
        disabled={!canGenerate}
        style={[
          styles.cta,
          { backgroundColor: theme.accent, opacity: canGenerate ? 1 : 0.4 },
        ]}>
        <ThemedText type="smallBold" style={styles.ctaLabel}>
          {saving ? 'Сохраняем в облако...' : 'Сгенерировать меню'}
        </ThemedText>
      </Pressable>
      {!canGenerate ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Выберите цель, технику и магазин
        </ThemedText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  block: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  tags: {
    gap: Spacing.two,
  },
  tagHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  tag: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: 2,
  },
  budgetCard: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  stepBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetValue: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  budgetNumber: {
    fontSize: 28,
    lineHeight: 34,
  },
  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.four,
    padding: Spacing.three,
    borderWidth: 2,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 22,
    lineHeight: 28,
  },
  cardTitle: {
    flex: 1,
  },
  cardCopy: {
    flex: 1,
    gap: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkMark: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 16,
  },
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    minHeight: 52,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
  },
  ctaLabel: {
    color: '#fff',
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
  },
});
