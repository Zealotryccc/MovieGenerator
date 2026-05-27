import { FlatList, RefreshControl } from 'react-native';

import { uiText } from '@/constants/ui-text';
import { MovieCard } from '@/components/movie-card';
import { PageLayout } from '@/components/screen/page-layout';
import { PageTitle } from '@/components/screen/page-title';
import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { favoritesScreenStyles as s } from '@/styles/favorites-screen';
import type { useFavoritesScreen } from '@/hooks/use-favorites-screen';

type Props = ReturnType<typeof useFavoritesScreen>;

export function FavoritesScreenView({ movies, loading, refreshing, error, refresh }: Props) {
  return (
    <PageLayout screenStyle={s.screen} contentStyle={s.content}>
      <PageTitle style={s.title}>{uiText.favorites.title}</PageTitle>

      <ScreenState loading={loading && !refreshing} error={error} />

      {!loading && !error && (
        <FlatList
          data={movies}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={s.empty}>
              {uiText.favorites.empty}
            </ThemedText>
          }
          renderItem={({ item }) => <MovieCard movie={item} />}
        />
      )}
    </PageLayout>
  );
}
