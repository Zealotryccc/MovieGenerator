import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { API_BASE_URL } from '@/api/config';
import { movieApi } from '@/api/movieApi';
import type { MovieListItem, NamedEntity } from '@/api/types';
import { MovieCard } from '@/components/movie-card';
import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { uiText } from '@/constants/ui-text';
import { useTheme } from '@/hooks/use-theme';

/**
 * Главная вкладка фильмов.
 * Здесь можно сразу менять:
 * - порядок блоков
 * - стили
 * - поведение поиска и фильтров
 */
export default function MoviesPage() {
  const theme = useTheme();
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [genres, setGenres] = useState<NamedEntity[]>([]);
  const [search, setSearch] = useState('');
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [moviesData, genresData] = await Promise.all([
        movieApi.getMovies({
          search: search || undefined,
          genre: selectedGenreId ?? undefined,
        }),
        movieApi.getGenres(),
      ]);
      setMovies(moviesData);
      setGenres(genresData);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? `${uiText.movies.loadError} (${e.status}). ${uiText.common.apiHint}: ${API_BASE_URL}`
          : uiText.movies.loadError,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedGenreId]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.content} edges={['top']}>
        <ThemedText type="subtitle" style={styles.title}>
          {uiText.movies.title}
        </ThemedText>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={uiText.movies.searchPlaceholder}
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.search,
            { color: theme.text, borderColor: theme.backgroundSelected },
          ]}
        />

        <FlatList
          horizontal
          data={genres}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          style={styles.genreList}
          contentContainerStyle={styles.genreListContent}
          ListHeaderComponent={
            <Pressable
              onPress={() => setSelectedGenreId(null)}
              style={[
                styles.genreChip,
                selectedGenreId === null && styles.genreChipActive,
              ]}>
              <ThemedText type="small">{uiText.movies.genreAll}</ThemedText>
            </Pressable>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedGenreId(item.id)}
              style={[
                styles.genreChip,
                selectedGenreId === item.id && styles.genreChipActive,
              ]}>
              <ThemedText type="small">{item.name}</ThemedText>
            </Pressable>
          )}
        />

        <ScreenState loading={loading && !refreshing} error={error} />

        {!loading && !error && (
          <FlatList
            data={movies}
            keyExtractor={(item) => String(item.id)}
            numColumns={3}
            columnWrapperStyle={styles.gridRow}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  load();
                }}
              />
            }
            contentContainerStyle={styles.movieList}
            ListEmptyComponent={
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.empty}>
                {uiText.movies.empty}
              </ThemedText>
            }
            renderItem={({ item }) => (
              <View style={styles.gridItem}>
                <MovieCard movie={item} />
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.three },
  title: { fontSize: 32, fontWeight: '700', marginBottom: Spacing.three },
  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    marginBottom: Spacing.two,
    fontSize: 16,
  },
  genreList: { maxHeight: 48, marginBottom: Spacing.three },
  genreListContent: { gap: Spacing.two, paddingRight: Spacing.three },
  genreChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: Spacing.two,
  },
  genreChipActive: { opacity: 0.75 },
  movieList: { gap: Spacing.one, paddingBottom: BottomTabInset + Spacing.five },
  gridRow: {
    justifyContent: 'flex-start',
    gap:Spacing.three,
    marginBottom: Spacing.one,
  },
  gridItem: {
    width: '15%',
  },
  empty: { textAlign: 'center', marginTop: Spacing.five },
});
