

import { FavoritesScreenView } from '@/screens/favorites/favorites-screen-view';
import { useFavoritesScreen } from '@/hooks/use-favorites-screen';

export default function FavoritesPage() {
  return <FavoritesScreenView {...useFavoritesScreen()} />;
}
