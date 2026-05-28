import { StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';

export const movieCardStyles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 0,
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  body: {
    marginTop: Spacing.one || 4,
    paddingHorizontal: Spacing.one || 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
  },
});