import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/client';
import { API_BASE_URL } from '@/api/config';
import { movieApi } from '@/api/movieApi';
import type { MovieListItem, NamedEntity } from '@/api/types';
import { uiText } from '@/constants/ui-text';

/** Загрузка данных для главного экрана (логика отдельно от вёрстки). */
export function useMoviesScreen() {
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
    const timer = setTimeout(load, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const refresh = () => {
    setRefreshing(true);
    load();
  };

  return {
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
  };
}
