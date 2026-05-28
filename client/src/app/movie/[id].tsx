import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Image } from 'expo-image';

import { ApiError } from '@/api/client';
import { movieApi } from '@/api/movieApi';
import type { MovieDetail } from '@/api/types';
import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { uiText } from '@/constants/ui-text';
import { useTheme } from '@/hooks/use-theme';

export default function MovieDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const movieId = Number(id);
  const theme = useTheme();

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

  if (loading || error) {
    return <ScreenState loading={loading} error={error} />;
  }
  if (!movie) return null;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Image source={{ uri: movie.poster }} style={styles.poster} contentFit="contain" />

      <ThemedText type="subtitle" style={styles.title}>
        {movie.title}
      </ThemedText>

      <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
        {movie.director} · {movie.country?.name} · {movie.duration} мин · {movie.age_rating}
      </ThemedText>

      <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
        {movie.genres.map((g) => g.name).join(', ')}
      </ThemedText>

      <ThemedText style={styles.description}>{movie.description}</ThemedText>

      <Pressable onPress={toggleFavorite} style={styles.primaryButton}>
        <ThemedText type="smallBold">
          {movie.is_favorited ? uiText.movieDetail.favoriteRemove : uiText.movieDetail.favoriteAdd}
        </ThemedText>
      </Pressable>

      <ThemedView type="backgroundElement" style={styles.section}>
        <ThemedText type="smallBold">{uiText.movieDetail.reviewTitle}</ThemedText>
        <ThemedText type="small">
          {uiText.movieDetail.reviewRatingLabel}: {rating}
        </ThemedText>
        <TextInput
          value={rating}
          onChangeText={setRating}
          keyboardType="number-pad"
          maxLength={2}
          style={[
            styles.input,
            { color: theme.text, borderColor: theme.backgroundSelected },
          ]}
        />
        <TextInput
          value={reviewText}
          onChangeText={setReviewText}
          placeholder={uiText.movieDetail.reviewPlaceholder}
          placeholderTextColor={theme.textSecondary}
          multiline
          style={[
            styles.input,
            styles.inputMultiline,
            { color: theme.text, borderColor: theme.backgroundSelected },
          ]}
        />
        <Pressable onPress={submitReview} style={styles.primaryButton}>
          <ThemedText type="smallBold">{uiText.movieDetail.reviewSubmit}</ThemedText>
        </Pressable>
      </ThemedView>

      <View style={styles.section}>
        <ThemedText type="smallBold">
          {uiText.movieDetail.reviewsTitle} ({movie.reviews.length})
        </ThemedText>
        {movie.reviews.map((r) => (
          <ThemedView key={r.id} type="backgroundElement" style={styles.reviewCard}>
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

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three },
  poster: { width: '100%', height: 400, borderRadius: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  meta: { lineHeight: 20 },
  description: { fontSize: 16, lineHeight: 24 },
  primaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: 12,
  },
  section: {
    gap: Spacing.three,
    marginTop: Spacing.two,
    padding: Spacing.four,
    borderRadius: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    fontSize: 16,
  },
  inputMultiline: { minHeight: 100, textAlignVertical: 'top' },
  reviewCard: { padding: Spacing.three, borderRadius: 12, gap: Spacing.one },
});
