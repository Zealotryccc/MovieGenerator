import {
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
} from 'react-native';

import { uiText } from '@/constants/ui-text';
import { MovieCard } from '@/components/movie-card';
import { PageLayout } from '@/components/screen/page-layout';
import { PageTitle } from '@/components/screen/page-title';
import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { moviesScreenStyles as s } from '@/styles/movies-screen';
import { useTheme } from '@/hooks/use-theme';
import type { useMoviesScreen } from '@/hooks/use-movies-screen';

type Props = ReturnType<typeof useMoviesScreen>;

/**
 * Вёрстка главного экрана — только UI.
 * Тексты: constants/ui-text.ts
 * Стили: styles/movies-screen.ts
 */
export function MoviesScreenView({
  movies,
  genres,
  search,
  setSearch,
  selectedGenreId,
  setSelectedGenreId,
  loading,
  refreshing,
  error,
  refresh,
}: Props) {
  const theme = useTheme();

  return (
    <PageLayout screenStyle={s.screen} contentStyle={s.content}>
      <PageTitle style={s.title}>{uiText.movies.title}</PageTitle>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder={uiText.movies.searchPlaceholder}
        placeholderTextColor={theme.textSecondary}
        style={[s.search, { color: theme.text, borderColor: theme.backgroundSelected }]}
      />

      <FlatList
        horizontal
        data={genres}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        style={s.genreList}
        contentContainerStyle={s.genreListContent}
        ListHeaderComponent={
          <Pressable
            onPress={() => setSelectedGenreId(null)}
            style={[s.genreChip, selectedGenreId === null && s.genreChipActive]}>
            <ThemedText type="small">{uiText.movies.genreAll}</ThemedText>
          </Pressable>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedGenreId(item.id)}
            style={[s.genreChip, selectedGenreId === item.id && s.genreChipActive]}>
            <ThemedText type="small">{item.name}</ThemedText>
          </Pressable>
        )}
      />

      <ScreenState loading={loading && !refreshing} error={error} />

      {!loading && !error && (
        <FlatList
          data={movies}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          contentContainerStyle={s.movieList}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={s.empty}>
              {uiText.movies.empty}
            </ThemedText>
          }
          renderItem={({ item }) => <MovieCard movie={item} />}
        />
      )}
    </PageLayout>
  );
}
