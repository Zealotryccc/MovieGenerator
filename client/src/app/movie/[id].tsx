/**
 * ЭКРАН одного фильма
 * Тексты: constants/ui-text.ts → movieDetail
 * Стили: styles/movie-detail-screen.ts
 * Вёрстка: screens/movie-detail/movie-detail-screen-view.tsx
 */

import { useLocalSearchParams } from 'expo-router';

import { MovieDetailScreenView } from '@/screens/movie-detail/movie-detail-screen-view';
import { useMovieDetailScreen } from '@/hooks/use-movie-detail-screen';

export default function MovieDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = useMovieDetailScreen(Number(id));
  return <MovieDetailScreenView {...data} />;
}
