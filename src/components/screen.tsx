import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
};

export function Screen({ children, scroll = true, style }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const paddingBottom = insets.bottom + Spacing.four;

  const contentStyle = [
    styles.content,
    {
      paddingTop: insets.top + Spacing.three,
      paddingBottom,
      paddingLeft: insets.left + Spacing.three,
      paddingRight: insets.right + Spacing.three,
    },
    style,
  ];

  if (scroll) {
    return (
      <ScrollView
        style={[styles.root, { backgroundColor: theme.background }]}
        contentContainerStyle={contentStyle}>
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }, contentStyle]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.three,
  },
});
