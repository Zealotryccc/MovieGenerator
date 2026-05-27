import { StyleProp, TextStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type Props = {
  children: string;
  style?: StyleProp<TextStyle>;
};

/** Заголовок экрана — текст из ui-text.ts, стиль из styles/*-screen.ts → title */
export function PageTitle({ children, style }: Props) {
  return (
    <ThemedText type="subtitle" style={style}>
      {children}
    </ThemedText>
  );
}
