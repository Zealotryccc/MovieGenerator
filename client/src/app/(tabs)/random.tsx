import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { ApiError } from '@/api/client';
import { movieApi } from '@/api/movieApi';
import type { MovieListItem } from '@/api/types';
import { MovieCard } from '@/components/movie-card';
import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { uiText } from '@/constants/ui-text';
import { useTheme } from '@/hooks/use-theme';

export default function RandomMoviePage() {
  const theme = useTheme();
  const [movie, setMovie] = useState<MovieListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setMovie(await movieApi.getRandomMovie());
    } catch (e) {
      setMovie(null);
      setError(
        e instanceof ApiError && e.status === 404
          ? uiText.random.empty
          : e instanceof ApiError
            ? `${uiText.random.loadError} (${e.status})`
            : uiText.random.loadError,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.content} edges={['top']}>
        <ThemedText type="subtitle" style={styles.title}>
          {uiText.random.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
          {uiText.random.subtitle}
        </ThemedText>

        <ScreenState loading={loading} error={error} />

        {!loading && !error && movie && (
          <View style={styles.cardWrap}>
            <MovieCard movie={movie} />
          </View>
        )}

        {!loading && (
          <Pressable
            onPress={load}
            style={[styles.button, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="smallBold">{uiText.random.button}</ThemedText>
          </Pressable>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  subtitle: {
    marginBottom: Spacing.four,
  },
  cardWrap: {
    width: '55%',
    alignSelf: 'center',
    marginBottom: Spacing.four,
  },
  button: {
    alignSelf: 'center',
    backgroundColor:'red',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 12,
  },
});
