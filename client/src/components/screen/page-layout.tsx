import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';

type Props = {
  children: ReactNode;
  /** Стили контейнера внутри safe area — см. styles/*-screen.ts */
  contentStyle?: StyleProp<ViewStyle>;
  screenStyle?: StyleProp<ViewStyle>;
};

/** Общая обёртка: фон + отступы сверху (вырез экрана). */
export function PageLayout({ children, contentStyle, screenStyle }: Props) {
  return (
    <ThemedView style={screenStyle}>
      <SafeAreaView style={contentStyle} edges={['top']}>
        {children}
      </SafeAreaView>
    </ThemedView>
  );
}
