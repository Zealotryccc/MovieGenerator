import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type Props = {
  loading?: boolean;
  error?: string | null;
};

export function ScreenState({ loading, error }: Props) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.error}>
          {error}
        </ThemedText>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  center: {
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    textAlign: 'center',
  },
});
