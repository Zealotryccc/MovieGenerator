import { StyleSheet } from 'react-native';

import { BottomTabInset, Spacing } from '@/constants/theme';

/** Стили экрана «Избранное». */
export const favoritesScreenStyles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.three,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: Spacing.four,
  },
  list: {
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
});
