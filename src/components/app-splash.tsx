import { StyleSheet, Text, View } from 'react-native';

import { SplashColors } from '@/constants/theme';

/** Кастомный JS-сплэш поверх нативного: держится фиксированное время в
 *  _layout.tsx, пока параллельно догружаются настройки пользователя. */
export function AppSplash() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>ШЕФ В КАРМАНЕ</Text>
      <Text style={styles.tagline}>
        Ваш персональный шеф-повар и умная корзина в одном клике
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
    backgroundColor: SplashColors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
    color: SplashColors.title,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 15,
    color: SplashColors.tagline,
    textAlign: 'center',
    maxWidth: 280,
  },
});
