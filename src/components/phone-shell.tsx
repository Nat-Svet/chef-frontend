import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type PhoneShellProps = {
  children: ReactNode;
};

/** На вебе держит приложение в ширине телефона; на смартфоне — на весь экран. */
export function PhoneShell({ children }: PhoneShellProps) {
  return (
    <View nativeID="phone-shell-page" style={styles.page}>
      <View nativeID="phone-shell" style={styles.phone}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    height: '100%',
  },
  phone: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
  },
});
