import { type ReactNode } from 'react';

/** На iOS/Android рамка не нужна — приложение занимает весь экран. */
export function PhoneShell({ children }: { children: ReactNode }) {
  return children;
}
