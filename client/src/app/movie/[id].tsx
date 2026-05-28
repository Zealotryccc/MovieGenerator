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
  const [favoriteBusy, setFavoriteBusy] = useState(false);

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
    if (!movie || favoriteBusy) return;
    setFavoriteBusy(true);
    const wasFavorited = movie.is_favorited;
    setMovie({ ...movie, is_favorited: !wasFavorited });
    try {
      if (wasFavorited) {
        await movieApi.removeFromFavoritesByMovie(movie.id);
      } else {
        await movieApi.addToFavoritesByMovie(movie.id);
      }
      setMovie(await movieApi.getMovie(movieId));
    } catch {
      setMovie((prev) => (prev ? { ...prev, is_favorited: wasFavorited } : prev));
      Alert.alert('Ошибка', 'Не удалось обновить избранное');
    } finally {
      setFavoriteBusy(false);
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

          <ThemedText style={styles.description}>{movie.description}</ThemedText>

          {movie.actors.length > 0 && (
            <View style={styles.actorsBlock}>
              <ThemedText type="smallBold" style={styles.actorsTitle}>
                {uiText.movieDetail.actorsTitle}
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.actorsList}>
                {movie.actors.map((actor) => (
                  <View key={actor.id} style={styles.actorCard}>
                    {actor.photo ? (
                      <Image
                        source={{ uri: actor.photo }}
                        style={styles.actorImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.actorImage, styles.actorImagePlaceholder]} />
                    )}
                    <ThemedText type="small" style={styles.actorName} numberOfLines={2}>
                      {actor.name}
                    </ThemedText>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <Pressable
        onPress={toggleFavorite}
        disabled={favoriteBusy}
        style={[
          styles.primaryButton,
          {
            backgroundColor: movie.is_favorited
              ? theme.textSecondary
              : theme.backgroundSelected,
            opacity: favoriteBusy ? 0.6 : 1,
          },
        ]}>
        <ThemedText type="smallBold" style={movie.is_favorited ? styles.favoriteButtonText : undefined}>
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
    fontSize: 40,
    fontWeight: '700', 
    lineHeight: 26,
    flexWrap: 'wrap',
  },
  
  meta: { 
    lineHeight: 15, 
    fontSize: 15,
    flexWrap: 'wrap',
    marginTop:Spacing.three,
  },
  
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.two,
  },
  actorsBlock: {
    marginTop: Spacing.two,
    gap: Spacing.one,
  },
  actorsTitle: {
    marginBottom: Spacing.one,
  },
  
  primaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 12,
  },
  favoriteButtonText: {
    color: '#fff',
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
  
  actorsList: {
    gap: Spacing.two,
    paddingRight: Spacing.two,
  },
  actorCard: {
    width: 72,
    alignItems: 'center',
  },
  actorImage: {
    width: 72,
    height: 108,
    borderRadius: 8,
  },
  actorImagePlaceholder: {
    backgroundColor: '#3a3a3a',
  },
  actorName: {
    textAlign: 'center',
    marginTop: Spacing.one,
  },
});