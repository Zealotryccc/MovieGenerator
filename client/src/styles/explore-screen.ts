import { StyleSheet } from 'react-native';

import { BottomTabInset, Spacing } from '@/constants/theme';

/** Стили экрана «Обзор». */
export const exploreScreenStyles = StyleSheet.create({
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
  section: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
    padding: Spacing.four,
    borderRadius: 16,
  },
  scrollContent: {
    paddingBottom: BottomTabInset + Spacing.five,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  tag: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 12,
  },
});
