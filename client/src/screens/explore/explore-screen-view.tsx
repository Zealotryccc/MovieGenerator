import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { router } from 'expo-router';

import { uiText } from '@/constants/ui-text';
import { PageLayout } from '@/components/screen/page-layout';
import { PageTitle } from '@/components/screen/page-title';
import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { exploreScreenStyles as s } from '@/styles/explore-screen';
import type { useExploreScreen } from '@/hooks/use-explore-screen';

type Props = ReturnType<typeof useExploreScreen>;

export function ExploreScreenView({
  stats,
  genreStats,
  tags,
  popular,
  loading,
  error,
  refresh,
}: Props) {
  return (
    <PageLayout screenStyle={s.screen} contentStyle={s.content}>
      <FlatList
        data={[]}
        renderItem={null}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        contentContainerStyle={s.scrollContent}
        ListHeaderComponent={
          <>
            <PageTitle style={s.title}>{uiText.explore.title}</PageTitle>
            <ScreenState loading={loading} error={error} />

            {stats && (
              <ThemedView type="backgroundElement" style={s.section}>
                <ThemedText type="smallBold">{uiText.explore.statsTitle}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Фильмов: {stats.total_movies} · Отзывов: {stats.total_reviews}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Жанров: {stats.total_genres} · Рейтинг:{' '}
                  {stats.avg_rating_overall?.toFixed(1) ?? '—'}
                </ThemedText>
              </ThemedView>
            )}

            {popular.length > 0 && (
              <View style={s.section}>
                <ThemedText type="smallBold">{uiText.explore.popularTitle}</ThemedText>
                {popular.map((m) => (
                  <Pressable key={m.id} onPress={() => router.push(`/movie/${m.id}`)}>
                    <ThemedText type="linkPrimary">{m.title}</ThemedText>
                  </Pressable>
                ))}
              </View>
            )}

            {genreStats.length > 0 && (
              <View style={s.section}>
                <ThemedText type="smallBold">{uiText.explore.genresTitle}</ThemedText>
                {genreStats.map((g) => (
                  <ThemedText key={g.genre} type="small" themeColor="textSecondary">
                    {g.genre}: {g.movies_count}
                  </ThemedText>
                ))}
              </View>
            )}

            {tags.length > 0 && (
              <View style={s.section}>
                <ThemedText type="smallBold">{uiText.explore.tagsTitle}</ThemedText>
                <View style={s.tagsRow}>
                  {tags.map((t) => (
                    <ThemedView key={t.id} type="backgroundSelected" style={s.tag}>
                      <ThemedText type="small">{t.name}</ThemedText>
                    </ThemedView>
                  ))}
                </View>
              </View>
            )}
          </>
        }
      />
    </PageLayout>
  );
}
