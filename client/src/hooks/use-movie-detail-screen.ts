import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { ApiError } from '@/api/client';
import { movieApi } from '@/api/movieApi';
import type { MovieDetail } from '@/api/types';
import { uiText } from '@/constants/ui-text';

export function useMovieDetailScreen(movieId: number) {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState('8');
  const [reviewText, setReviewText] = useState('');

  const load = useCallback(async () => {
    if (!movieId) return;
    try {
      setError(null);
      setMovie(await movieApi.getMovie(movieId));
    } catch (e) {
      setError(
        e instanceof ApiError
          ? `${uiText.movieDetail.loadError} (${e.status})`
          : uiText.movieDetail.loadError,
      );
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFavorite = async () => {
    if (!movie) return;
    try {
      if (movie.is_favorited) {
        await movieApi.removeFavorite(movie.id);
      } else {
        await movieApi.addFavorite(movie.id);
      }
      await load();
    } catch {
      Alert.alert('Ошибка', 'Не удалось обновить избранное');
    }
  };

  const submitReview = async () => {
    if (!movie) return;
    const r = Number(rating);
    if (!reviewText.trim() || r < 1 || r > 10) {
      Alert.alert('Ошибка', 'Рейтинг от 1 до 10 и текст обязательны');
      return;
    }
    try {
      await movieApi.addReview(movie.id, { rating: r, text: reviewText, author: 'Гость' });
      setReviewText('');
      await load();
    } catch {
      Alert.alert('Ошибка', 'Не удалось отправить отзыв');
    }
  };

  return {
    movie,
    loading,
    error,
    rating,
    setRating,
    reviewText,
    setReviewText,
    toggleFavorite,
    submitReview,
  };
}
