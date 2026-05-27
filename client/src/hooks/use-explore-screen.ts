import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/client';
import { API_BASE_URL } from '@/api/config';
import { movieApi } from '@/api/movieApi';
import type { GeneralStats, GenreStat, NamedEntity } from '@/api/types';
import { uiText } from '@/constants/ui-text';

export function useExploreScreen() {
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

  return { stats, genreStats, tags, popular, loading, error, refresh: load };
}
