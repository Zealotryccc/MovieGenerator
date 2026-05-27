import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/client';
import { API_BASE_URL } from '@/api/config';
import { movieApi } from '@/api/movieApi';
import type { MovieListItem } from '@/api/types';
import { uiText } from '@/constants/ui-text';

export function useFavoritesScreen() {
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

  return {
    movies,
    loading,
    refreshing,
    error,
    refresh: () => {
      setRefreshing(true);
      load();
    },
  };
}
