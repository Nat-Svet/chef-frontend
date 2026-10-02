import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useMenu } from '@/hooks/use-menu';
import { usePreferences } from '@/hooks/use-preferences';
import { formatGrams, groupShoppingList } from '@/lib/menu';
import { useTheme } from '@/hooks/use-theme';
import { rememberOwnedItems } from '@/lib/shopping-selection';

export default function ShoppingListScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { preferences } = usePreferences();
  const { menu } = useMenu();
  const [owned, setOwned] = useState<string[]>([]);

  const items = menu?.shoppingItems ?? [];
  const toBuy = useMemo(() => items.filter((item) => !owned.includes(item.name)), [items, owned]);
  const store = menu?.store ?? preferences.selectedStores[0] ?? 'Самокат';

  const total = toBuy.reduce((sum, item) => sum + item.price, 0);

  function toggleOwned(name: string) {
    setOwned((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  }

  function orderDelivery() {
    rememberOwnedItems(owned);
    router.push('/cart');
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.three,
            paddingLeft: insets.left + Spacing.three,
            paddingRight: insets.right + Spacing.three,
            paddingBottom: Spacing.three,
          },
        ]}>
        <View style={styles.header}>
          <ThemedText type="heading">Список покупок</ThemedText>
          <ThemedText style={[styles.summary, { color: theme.textSecondary }]}>
            Ингредиенты для вашего меню оптимизированы по лучшим ценам. Магазин: {store} · Товаров: {items.length} шт.
          </ThemedText>
        </View>

        {items.length === 0 ? (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText themeColor="textSecondary" style={{ paddingVertical: Spacing.three }}>
              Сначала соберите рацион на главном экране — здесь появится список покупок.
            </ThemedText>
          </ThemedView>
        ) : null}

        {groupShoppingList(items).map((group) => (
          <View key={group.category} style={styles.group}>
            <ThemedText type="smallBold">
              {group.emoji} {group.category}
            </ThemedText>
            <ThemedView type="backgroundElement" style={styles.card}>
              {group.items.map((item, index) => {
                const haveIt = owned.includes(item.name);
                return (
                  <Pressable
                    key={item.name}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: haveIt }}
                    onPress={() => toggleOwned(item.name)}
                    style={[
                      styles.row,
                      index < group.items.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: theme.backgroundSelected,
                      },
                      haveIt && styles.rowOwned,
                    ]}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: haveIt ? theme.primary : theme.background,
                          borderColor: haveIt ? theme.primary : theme.backgroundSelected,
                        },
                      ]}>
                      {haveIt ? (
                        <ThemedText type="smallBold" style={styles.checkMark}>
                          ✓
                        </ThemedText>
                      ) : null}
                    </View>
                    <View style={styles.rowCopy}>
                      <ThemedText
                        type="smallBold"
                        style={haveIt ? [styles.ownedText, { color: theme.textSecondary }] : undefined}>
                        {item.name}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {haveIt ? 'У меня это есть' : formatGrams(item.grams, 1)}
                      </ThemedText>
                    </View>
                    <ThemedText
                      type="smallBold"
                      style={{
                        color: haveIt ? theme.textSecondary : theme.primary,
                        textDecorationLine: haveIt ? 'line-through' : 'none',
                      }}>
                      {item.price} ₽
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ThemedView>
          </View>
        ))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.backgroundSelected,
            paddingBottom: Spacing.three,
          },
        ]}>
        <View style={styles.footerInner}>
          <View style={styles.totalRow}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                К оплате · {toBuy.length} позиций
              </ThemedText>
              <ThemedText type="heading">{total.toLocaleString('ru-RU')} ₽</ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.budgetHint}>
              лимит {preferences.budgetLimit.toLocaleString('ru-RU')} ₽
            </ThemedText>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={orderDelivery}
            disabled={toBuy.length === 0}
            style={[
              styles.cta,
              { backgroundColor: theme.accent, opacity: toBuy.length === 0 ? 0.4 : 1 },
            ]}>
            <ThemedText type="smallBold" style={styles.ctaLabel}>
              {`Заказать доставку в ${store}`}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  summary: {
    fontSize: 12,
    lineHeight: 17,
  },
  group: {
    gap: Spacing.two,
  },
  card: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  rowOwned: {
    opacity: 0.55,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 16,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  ownedText: {
    textDecorationLine: 'line-through',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  footerInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.two,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  budgetHint: {
    textAlign: 'right',
    flexShrink: 1,
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
});
