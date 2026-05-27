import { StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';

/** Стили карточки фильма в списках. */
export const movieCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 16,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 12,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
});
