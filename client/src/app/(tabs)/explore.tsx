
import { ExploreScreenView } from '@/screens/explore/explore-screen-view';
import { useExploreScreen } from '@/hooks/use-explore-screen';

export default function ExplorePage() {
  return <ExploreScreenView {...useExploreScreen()} />;
}
