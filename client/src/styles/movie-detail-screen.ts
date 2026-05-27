import { StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';

export const movieDetailScreenStyles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },

  // --- Постер ---
  poster: {
    width: '100%',
    height: 400,
    borderRadius: 16,
  },

  // --- Название и мета ---
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  meta: {
    lineHeight: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },

  primaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: 12,
  },
  section: {
    gap: Spacing.three,
    marginTop: Spacing.two,
    padding: Spacing.four,
    borderRadius: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  reviewCard: {
    padding: Spacing.three,
    borderRadius: 12,
    gap: Spacing.one,
  },
});
