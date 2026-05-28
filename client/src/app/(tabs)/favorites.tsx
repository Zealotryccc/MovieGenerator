import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { API_BASE_URL } from '@/api/config';
import { movieApi } from '@/api/movieApi';
import type { MovieListItem } from '@/api/types';
import { MovieCard } from '@/components/movie-card';
import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { uiText } from '@/constants/ui-text';

export default function FavoritesPage() {
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setMovies(await movieApi.getFavorites());
    } catch (e) {
      setError(
        e instanceof ApiError
          ? `${uiText.favorites.loadError} (${e.status}). ${API_BASE_URL}`
          : uiText.favorites.loadError,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.content} edges={['top']}>
        <ThemedText type="subtitle" style={styles.title}>
          {uiText.favorites.title}
        </ThemedText>

        <ScreenState loading={loading && !refreshing} error={error} />

        {!loading && !error && (
          <FlatList
            data={movies}
            keyExtractor={(item) => String(item.id)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  load();
                }}
              />
            }
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.empty}>
                {uiText.favorites.empty}
              </ThemedText>
            }
            renderItem={({ item }) => <MovieCard movie={item} />}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.three },
  title: { fontSize: 32, fontWeight: '700', marginBottom: Spacing.four },
  list: { gap: Spacing.three, paddingBottom: BottomTabInset + Spacing.five },
  empty: { textAlign: 'center', marginTop: Spacing.five },
});
