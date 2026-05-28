import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ApiError } from '@/api/client';
import { API_BASE_URL } from '@/api/config';
import { movieApi } from '@/api/movieApi';
import type { GeneralStats, GenreStat, NamedEntity } from '@/api/types';
import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { uiText } from '@/constants/ui-text';

export default function ExplorePage() {
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [genreStats, setGenreStats] = useState<GenreStat[]>([]);
  const [tags, setTags] = useState<NamedEntity[]>([]);
  const [popular, setPopular] = useState<{ id: number; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [statsData, genreData, tagsData, popularData] = await Promise.all([
        movieApi.getStatistics(),
        movieApi.getStatisticsByGenre(),
        movieApi.getTags(),
        movieApi.getPopular(),
      ]);
      setStats(statsData);
      setGenreStats(genreData);
      setTags(tagsData);
      setPopular(popularData.map((m) => ({ id: m.id, title: m.title })));
    } catch (e) {
      setError(
        e instanceof ApiError
          ? `${uiText.explore.loadError} (${e.status}). ${API_BASE_URL}`
          : uiText.explore.loadError,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.content} edges={['top']}>
        <FlatList
          data={[]}
          renderItem={null}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          contentContainerStyle={styles.scrollContent}
          ListHeaderComponent={
            <>
              <ThemedText type="subtitle" style={styles.title}>
                {uiText.explore.title}
              </ThemedText>

              <ScreenState loading={loading} error={error} />

              {stats && (
                <ThemedView type="backgroundElement" style={styles.section}>
                  <ThemedText type="smallBold">{uiText.explore.statsTitle}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Фильмов: {stats.total_movies} · Отзывов: {stats.total_reviews}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Жанров: {stats.total_genres} · Рейтинг: {stats.avg_rating_overall?.toFixed(1) ?? '—'}
                  </ThemedText>
                </ThemedView>
              )}

              {popular.length > 0 && (
                <View style={styles.section}>
                  <ThemedText type="smallBold">{uiText.explore.popularTitle}</ThemedText>
                  {popular.map((m) => (
                    <Pressable key={m.id} onPress={() => router.push(`/movie/${m.id}`)}>
                      <ThemedText type="linkPrimary">{m.title}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              )}

              {genreStats.length > 0 && (
                <View style={styles.section}>
                  <ThemedText type="smallBold">{uiText.explore.genresTitle}</ThemedText>
                  {genreStats.map((g) => (
                    <ThemedText key={g.genre} type="small" themeColor="textSecondary">
                      {g.genre}: {g.movies_count}
                    </ThemedText>
                  ))}
                </View>
              )}

              {tags.length > 0 && (
                <View style={styles.section}>
                  <ThemedText type="smallBold">{uiText.explore.tagsTitle}</ThemedText>
                  <View style={styles.tagsRow}>
                    {tags.map((t) => (
                      <ThemedView key={t.id} type="backgroundSelected" style={styles.tag}>
                        <ThemedText type="small">{t.name}</ThemedText>
                      </ThemedView>
                    ))}
                  </View>
                </View>
              )}
            </>
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.three },
  title: { fontSize: 32, fontWeight: '700', marginBottom: Spacing.four },
  section: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
    padding: Spacing.four,
    borderRadius: 16,
  },
  scrollContent: { paddingBottom: BottomTabInset + Spacing.five },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  tag: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 12 },
});
