import { Image } from 'expo-image';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { uiText } from '@/constants/ui-text';
import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { movieDetailScreenStyles as s } from '@/styles/movie-detail-screen';
import { useTheme } from '@/hooks/use-theme';
import type { useMovieDetailScreen } from '@/hooks/use-movie-detail-screen';

type Props = ReturnType<typeof useMovieDetailScreen>;

export function MovieDetailScreenView({
  movie,
  loading,
  error,
  rating,
  setRating,
  reviewText,
  setReviewText,
  toggleFavorite,
  submitReview,
}: Props) {
  const theme = useTheme();

  if (loading || error) {
    return <ScreenState loading={loading} error={error} />;
  }
  if (!movie) return null;

  const inputStyle = [s.input, { color: theme.text, borderColor: theme.backgroundSelected }];

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content}>
      <Image source={{ uri: movie.poster }} style={s.poster} contentFit="cover" />

      <ThemedText type="subtitle" style={s.title}>
        {movie.title}
      </ThemedText>

      <ThemedText type="small" themeColor="textSecondary" style={s.meta}>
        {movie.director} · {movie.country?.name} · {movie.duration} мин · {movie.age_rating}
      </ThemedText>

      <ThemedText type="small" themeColor="textSecondary" style={s.meta}>
        {movie.genres.map((g) => g.name).join(', ')}
      </ThemedText>

      <ThemedText style={s.description}>{movie.description}</ThemedText>

      <Pressable onPress={toggleFavorite} style={s.primaryButton}>
        <ThemedText type="smallBold">
          {movie.is_favorited ? uiText.movieDetail.favoriteRemove : uiText.movieDetail.favoriteAdd}
        </ThemedText>
      </Pressable>

      <ThemedView type="backgroundElement" style={s.section}>
        <ThemedText type="smallBold">{uiText.movieDetail.reviewTitle}</ThemedText>
        <ThemedText type="small">
          {uiText.movieDetail.reviewRatingLabel}: {rating}
        </ThemedText>
        <TextInput
          value={rating}
          onChangeText={setRating}
          keyboardType="number-pad"
          maxLength={2}
          style={inputStyle}
        />
        <TextInput
          value={reviewText}
          onChangeText={setReviewText}
          placeholder={uiText.movieDetail.reviewPlaceholder}
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[inputStyle, s.inputMultiline]}
        />
        <Pressable onPress={submitReview} style={s.primaryButton}>
          <ThemedText type="smallBold">{uiText.movieDetail.reviewSubmit}</ThemedText>
        </Pressable>
      </ThemedView>

      <View style={s.section}>
        <ThemedText type="smallBold">
          {uiText.movieDetail.reviewsTitle} ({movie.reviews.length})
        </ThemedText>
        {movie.reviews.map((r) => (
          <ThemedView key={r.id} type="backgroundElement" style={s.reviewCard}>
            <ThemedText type="smallBold">
              {r.author} · {r.rating}/10
            </ThemedText>
            <ThemedText type="small">{r.text}</ThemedText>
          </ThemedView>
        ))}
      </View>
    </ScrollView>
  );
}
