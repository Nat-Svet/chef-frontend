/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/** Палитра «Средиземноморский премиум»: молочно-кремовый фон, спелый
 *  томатный акцент на действиях, приглушённый оливковый — на тегах/КБЖУ. */
export const Colors = {
  light: {
    text: '#3A2E28',
    background: '#FBF8F2',
    backgroundElement: '#F2EBDD',
    backgroundSelected: '#E6DCC8',
    card: '#FFFDF9',
    textSecondary: '#7A6F63',
    primary: '#B5482F',
    primarySoft: '#F3DCD2',
    accent: '#7D8A52',
    accentSoft: '#E6EADA',
  },
  dark: {
    text: '#F3ECE2',
    background: '#1C1613',
    backgroundElement: '#2A221D',
    backgroundSelected: '#372C24',
    card: '#241D19',
    textSecondary: '#C2B6A8',
    primary: '#D97A5C',
    primarySoft: '#3A241D',
    accent: '#9FAE78',
    accentSoft: '#303524',
  },
} as const;

export const SplashColors = {
  background: '#7A3524',
  title: '#FBF8F2',
  tagline: '#EBD4C8',
};

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 390;
