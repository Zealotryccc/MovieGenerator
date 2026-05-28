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
        await movieApi.removeFromFavoritesByMovie(movie.id);
      } else {
        await movieApi.addToFavoritesByMovie(movie.id);
      }
      setMovie({ ...movie, is_favorited: !movie.is_favorited });
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
      {/* Верхняя часть: картинка слева, заголовок и описание справа */}
      <View style={styles.headerRow}>
        <Image source={{ uri: movie.poster }} style={styles.poster} contentFit="cover" />
        <View style={styles.headerRight}>
          <ThemedText type="subtitle" style={styles.title}>
            {movie.title}
          </ThemedText>

          <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
            {movie.director} · {movie.country?.name} · {movie.duration} мин · {movie.age_rating}
          </ThemedText>

          <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
            {movie.genres.map((g) => g.name).join(', ')}
          </ThemedText>

          {/* Описание теперь здесь, под мета-информацией */}
          <ThemedText style={styles.description} numberOfLines={5}>
            {movie.description}
          </ThemedText>
        </View>
      </View>

      <Pressable
        onPress={toggleFavorite}
        style={[
          styles.primaryButton,
          { backgroundColor: theme.backgroundSelected },
        ]}>
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
  content: { 
    padding: Spacing.three, 
    gap: Spacing.three 
  },
  

  headerRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  
  poster: {
    width: '15%',        
    aspectRatio: 2 / 3,
    borderRadius: 12,
    marginTop: 4,        
  },
  
  headerRight: {
    flex: 1,            
    gap: Spacing.one,
  },
  
  title: { 
    fontSize: 20,
    fontWeight: '700', 
    lineHeight: 26,
    flexWrap: 'wrap',
  },
  
  meta: { 
    lineHeight: 18, 
    fontSize: 12,
    flexWrap: 'wrap',
  },
  
  description: { 
    fontSize: 13,        // Чуть меньше шрифт
    lineHeight: 18, 
    marginTop: Spacing.one,
    color: '#666',       // Немного светлее для читаемости
  },
  
  primaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 12,
  },
  
  section: {
    gap: Spacing.two,
    marginTop: Spacing.one,
    padding: Spacing.three,
    borderRadius: 12,
  },
  
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    fontSize: 16,
  },
  
  inputMultiline: { 
    minHeight: 100, 
    textAlignVertical: 'top' 
  },
  
  reviewCard: { 
    padding: Spacing.three, 
    borderRadius: 12, 
    gap: Spacing.one 
  },
});