import { StyleSheet } from 'react-native';

import { BottomTabInset, Spacing } from '@/constants/theme';

export const moviesScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.three,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },

  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    marginBottom: Spacing.three,
    fontSize: 16,
  },

  genreList: {
    maxHeight: 48,
    marginBottom: Spacing.three,
  },
  genreListContent: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },
  genreChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: Spacing.two,
  },
  genreChipActive: {
    opacity: 0.75,
  },

  // --- Список карточек фильмов ---
  movieList: {
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
});
