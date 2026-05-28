import { StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';

export const movieCardStyles = StyleSheet.create({
  pressable: {
    width: '30%',
  },
  card: {
    width: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  body: {
    width: '100%',
    marginTop: Spacing.half,
    alignItems: 'center',
    gap: 2,
  },
  title: {
    width: '100%',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  meta: {
    width: '100%',
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
});
