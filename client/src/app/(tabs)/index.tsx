/**
 * ═══════════════════════════════════════════════════════════════
 *  ГЛАВНЫЙ ЭКРАН — список фильмов (вкладка «Фильмы»)
 * ═══════════════════════════════════════════════════════════════
 *
 *  Что менять для своего дизайна:
 *
 *  1. Тексты (заголовок, плейсхолдер поиска)
 *     → src/constants/ui-text.ts  (блок movies)
 *
 *  2. Стили (размеры, отступы, скругления)
 *     → src/styles/movies-screen.ts
 *
 *  3. Карточка одного фильма в списке
 *     → src/styles/movie-card.ts
 *     → src/components/movie-card.tsx
 *
 *  4. Расположение блоков на экране
 *     → src/screens/movies/movies-screen-view.tsx
 *
 *  Логику загрузки с API не трогайте, если не нужно:
 *     → src/hooks/use-movies-screen.ts
 * ═══════════════════════════════════════════════════════════════
 */

import { MoviesScreenView } from '@/screens/movies/movies-screen-view';
import { useMoviesScreen } from '@/hooks/use-movies-screen';

export default function MoviesPage() {
  const data = useMoviesScreen();
  return <MoviesScreenView {...data} />;
}
