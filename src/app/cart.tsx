import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useMenu } from '@/hooks/use-menu';
import { usePreferences } from '@/hooks/use-preferences';
import { formatGrams } from '@/lib/menu';
import { useTheme } from '@/hooks/use-theme';
import { getOwnedItems } from '@/lib/shopping-selection';

export default function CartScreen() {
  const theme = useTheme();
  const { preferences } = usePreferences();
  const { menu } = useMenu();
  const [ready, setReady] = useState(false);
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const pulse = useRef(new Animated.Value(0.7)).current;
  const store = menu?.store ?? preferences.selectedStores[0] ?? 'Самокат';

  const items = useMemo(() => {
    const owned = new Set(getOwnedItems());
    return (menu?.shoppingItems ?? []).filter((item) => !owned.has(item.name));
  }, [menu]);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const orderPayload = useMemo(
    () => ({
      sandbox: true,
      store,
      itemsCount: items.length,
      totalCost: total,
      items: items.map((item) => ({ name: item.name, grams: item.grams, category: item.category, price: item.price })),
    }),
    [store, items, total],
  );

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.7,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    const timer = setTimeout(() => setReady(true), 2200);
    return () => {
      loop.stop();
      clearTimeout(timer);
    };
  }, [pulse]);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  if (!ready) {
    return (
      <Screen scroll={false} style={styles.loaderScreen}>
        <Animated.View style={[styles.loaderBadge, { backgroundColor: theme.accentSoft, opacity: pulse, transform: [{ scale: pulse }] }]}>
          <ThemedText style={styles.loaderEmoji}>🛒</ThemedText>
        </Animated.View>
        <ThemedText type="heading" style={styles.center}>
          Собираем корзину для {store}...
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          Подбираем товары и фасуем остатки.
        </ThemedText>
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable accessibilityRole="button" onPress={goBack}>
        <ThemedText type="smallBold" style={{ color: theme.primary }}>
          ← К списку покупок
        </ThemedText>
      </Pressable>

      <ThemedView type="accentSoft" style={styles.hero}>
        <ThemedText style={styles.loaderEmoji}>✨</ThemedText>
        <ThemedText type="heading" style={styles.center}>
          Корзина для {store} готова. Можно отправлять!
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.center}>
          {items.length} позиций · {total.toLocaleString('ru-RU')} ₽
        </ThemedText>
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.listCard}>
        {items.map((item, index) => (
          <View
            key={item.name}
            style={[
              styles.row,
              index < items.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: theme.backgroundSelected,
              },
            ]}>
            <View style={styles.rowCopy}>
              <ThemedText type="smallBold">{item.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatGrams(item.grams, 1)}
              </ThemedText>
            </View>
            <ThemedText type="smallBold" style={{ color: theme.primary }}>
              {item.price} ₽
            </ThemedText>
          </View>
        ))}
      </ThemedView>

      <Pressable
        accessibilityRole="button"
        onPress={() => setSandboxOpen(true)}
        style={[styles.cta, { backgroundColor: theme.accent }]}>
        <ThemedText type="smallBold" style={styles.ctaLabel}>
          Открыть {store}
        </ThemedText>
      </Pressable>
      <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
        Режим песочницы: реальный заказ пока не отправляется, ниже — техническая структура будущего запроса.
      </ThemedText>

      <Modal visible={sandboxOpen} animationType="slide" transparent onRequestClose={() => setSandboxOpen(false)}>
        <View style={styles.backdrop}>
          <ThemedView type="background" style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <ThemedText type="heading">🧪 Песочница заказа</ThemedText>
              <Pressable accessibilityRole="button" onPress={() => setSandboxOpen(false)}>
                <ThemedText type="smallBold" style={{ color: theme.primary }}>
                  Закрыть
                </ThemedText>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.sheetContent}>
              <ThemedView type="accentSoft" style={styles.summary}>
                <ThemedText type="smallBold">Магазин: {store}</ThemedText>
                <ThemedText themeColor="textSecondary">
                  {items.length} позиций · {total.toLocaleString('ru-RU')} ₽
                </ThemedText>
              </ThemedView>

              <ThemedText type="smallBold">Технический JSON заказа</ThemedText>
              <ThemedView type="backgroundElement" style={styles.jsonCard}>
                <ThemedText style={styles.jsonText}>{JSON.stringify(orderPayload, null, 2)}</ThemedText>
              </ThemedView>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loaderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  loaderBadge: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderEmoji: {
    fontSize: 40,
    lineHeight: 48,
    textAlign: 'center',
  },
  center: {
    textAlign: 'center',
  },
  hero: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.two,
    alignItems: 'center',
  },
  listCard: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
  },
  ctaLabel: {
    color: '#fff',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  summary: {
    borderRadius: Spacing.four,
    padding: Spacing.three,
    gap: 2,
  },
  jsonCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 17,
  },
});
