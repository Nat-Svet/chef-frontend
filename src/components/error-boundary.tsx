import { Component, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { children: ReactNode };
type State = { error: Error | null };

/** Ловит ошибки рендера, которые иначе валят всё приложение на старте
 *  (белый экран / мгновенный краш после сплэша), и показывает кнопку
 *  «Повторить» вместо падения нативного процесса. */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('AppErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.root}>
          <Text style={styles.title}>Что-то пошло не так</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => this.setState({ error: null })}
            style={styles.button}>
            <Text style={styles.buttonLabel}>Повторить</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#FBF7F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  message: {
    textAlign: 'center',
    color: '#6b6b6b',
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#2e7d5b',
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '700',
  },
});
