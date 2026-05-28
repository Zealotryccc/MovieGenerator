import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';

import { uiText } from '@/constants/ui-text';
import { ThemedText } from '@/components/themed-text';
import { movieCardStyles as s } from '@/styles/movie-card';
import type { MovieListItem } from '@/api/types';

type Props = {
  movie: MovieListItem;
};

export function MovieCard({ movie }: Props) {
  return (
    <Pressable style={s.pressable} onPress={() => router.push(`/movie/${movie.id}`)}>
      <View style={s.card}>
        <Image source={{ uri: movie.poster }} style={s.poster} contentFit="cover" />
        <View style={s.body}>
          <ThemedText style={s.title} numberOfLines={2}>
            {movie.title}
          </ThemedText>
          <ThemedText
            style={s.meta}
            themeColor="textSecondary"
            numberOfLines={1}>
            {movie.country} · {movie.release_date}
          </ThemedText>
          <ThemedText
            style={s.meta}
            themeColor="textSecondary"
            numberOfLines={2}>
            {movie.genres.join(', ')}
          </ThemedText>
          {movie.is_favorited && (
            <ThemedText style={s.meta} themeColor="textSecondary" numberOfLines={1}>
              {uiText.common.favoriteBadge}
            </ThemedText>
          )}
        </View>
      </View>
    </Pressable>
  );
}