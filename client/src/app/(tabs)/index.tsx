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
          ? `${uiText.movies.loadError}\n${e.message}`
          : e instanceof Error
            ? `${uiText.movies.loadError}: ${e.message}\n${API_BASE_URL}`
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
  }, [load, search, selectedGenreId]);

  return (
    <ThemedView style={styles.screen}>
      <View
        pointerEvents="none"
        style={[styles.decorBlob, styles.decorBlobTop, { backgroundColor: theme.backgroundSelected }]}
      />
      <View
        pointerEvents="none"
        style={[styles.decorBlob, styles.decorBlobRight, { backgroundColor: theme.backgroundElement }]}
      />

      <SafeAreaView style={styles.content} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <ThemedText type="subtitle" style={styles.title}>
              {uiText.movies.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {uiText.movies.subtitle}
            </ThemedText>
          </View>
          <View style={[styles.accentLine, { backgroundColor: theme.textSecondary }]} />
          {!loading && !error && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.count}>
              {uiText.movies.countLabel(movies.length)}
            </ThemedText>
          )}
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={uiText.movies.searchPlaceholder}
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.search,
            {
              color: theme.text,
              borderColor: theme.backgroundSelected,
              backgroundColor: theme.backgroundElement,
            },
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
                { backgroundColor: theme.backgroundElement },
                selectedGenreId === null && [
                  styles.genreChipActive,
                  { backgroundColor: theme.backgroundSelected },
                ],
              ]}>
              <ThemedText type="small">{uiText.movies.genreAll}</ThemedText>
            </Pressable>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedGenreId(item.id)}
              style={[
                styles.genreChip,
                { backgroundColor: theme.backgroundElement },
                selectedGenreId === item.id && [
                  styles.genreChipActive,
                  { backgroundColor: theme.backgroundSelected },
                ],
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
  screen: { flex: 1, overflow: 'hidden' },
  content: { flex: 1, paddingHorizontal: Spacing.three },
  decorBlob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.35,
  },
  decorBlobTop: {
    width: 180,
    height: 180,
    top: -60,
    right: -40,
  },
  decorBlobRight: {
    width: 120,
    height: 120,
    top: 120,
    left: -50,
  },
  header: {
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  titleBlock: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  accentLine: {
    height: 3,
    width: 56,
    borderRadius: 2,
    opacity: 0.5,
  },
  count: {
    marginTop: -Spacing.one,
  },
  search: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    marginBottom: Spacing.two,
    fontSize: 16,
  },
  genreList: { maxHeight: 48, marginBottom: Spacing.three },
  genreListContent: { gap: Spacing.two, paddingRight: Spacing.three, },
  genreChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: Spacing.two,
  },
  genreChipActive: {
    transform: [{ scale: 1.02 }],
  },
  movieList: { paddingBottom: BottomTabInset + Spacing.five },
  gridRow: {
    gap: Spacing.two,
    justifyContent: 'flex-start',
    marginBottom: Spacing.two,
  },
  gridItem: {
    width: '30%',
  },
  empty: { textAlign: 'center', marginTop: Spacing.five },
});
