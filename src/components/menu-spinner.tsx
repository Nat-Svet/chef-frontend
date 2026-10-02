import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type MenuSpinnerProps = {
  message?: string;
};

export function MenuSpinner({
  message = 'Составляем меню под ваш бюджет',
}: MenuSpinnerProps) {
  const theme = useTheme();
  const pulse = useRef(new Animated.Value(0.86)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.86,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Screen scroll={false} style={styles.screen}>
      <Animated.View
        style={[
          styles.badge,
          {
            backgroundColor: theme.accentSoft,
            opacity: pulse,
            transform: [{ scale: pulse }],
          },
        ]}>
        <ThemedText style={styles.emoji}>👨‍🍳</ThemedText>
      </Animated.View>
      <ActivityIndicator size="large" color={theme.primary} />
      <ThemedText type="heading" style={styles.title}>
        {message}
      </ThemedText>
      <ThemedText themeColor="textSecondary" style={[styles.hint, styles.hintSmall]}>
        Обычно это занимает меньше минуты: считаем КБЖУ, технику и корзину без отходов.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  badge: {
    width: 104,
    height: 104,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 46,
    lineHeight: 56,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    maxWidth: 320,
  },
  hintSmall: {
    fontSize: 12,
    lineHeight: 17,
  },
  hint: {
    textAlign: 'center',
    maxWidth: 300,
  },
});
