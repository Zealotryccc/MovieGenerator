import { apiRequest, unwrapList } from './client';
import type { GeneralStats, GenreStat, MovieDetail, MovieListItem, NamedEntity } from './types';

export const movieApi = {
  getMovies: async (params?: {
    search?: string;
    genre?: string | number;
    tag?: string | number;
    ordering?: string;
  }) => unwrapList<MovieListItem>(await apiRequest('movies/', { params })),

  getMovie: (id: number) => apiRequest<MovieDetail>(`movies/${id}/`),

  getRandomMovie: () => apiRequest<MovieListItem>('movies/random/'),

  getPopular: async () => unwrapList<MovieListItem>(await apiRequest('popular/')),

  getGenres: async () => unwrapList<NamedEntity>(await apiRequest('genres/')),

  getTags: async () => unwrapList<NamedEntity>(await apiRequest('tags/')),

  getCountries: async () => unwrapList<NamedEntity>(await apiRequest('countries/')),

  getActors: async () =>
    unwrapList<{ id: number; name: string; photo: string | null }>(
      await apiRequest('actors/'),
    ),

  getFavorites: async () => unwrapList<MovieListItem>(await apiRequest('favorites/')),

  addFavorite: (movieId: number) =>
    apiRequest<{ message: string; created: boolean }>('favorites/', {
      method: 'POST',
      body: { movie_id: movieId },
    }),

  removeFavorite: (movieId: number) =>
    apiRequest<void>(`favorites/${movieId}/`, { method: 'DELETE' }),

  // Более прямые endpoints на объекте фильма
  addToFavoritesByMovie: (movieId: number) =>
    apiRequest<{ message?: string }>(`movies/${movieId}/add_to_favorites/`, {
      method: 'POST',
    }),

  removeFromFavoritesByMovie: (movieId: number) =>
    apiRequest<{ message?: string }>(`movies/${movieId}/remove_from_favorites/`, {
      method: 'POST',
    }),

  addReview: (movieId: number, data: { rating: number; text: string; author?: string }) =>
    apiRequest(`movies/${movieId}/add_review/`, { method: 'POST', body: data }),

  getStatistics: () => apiRequest<GeneralStats>('statistics/'),

  getStatisticsByGenre: () => apiRequest<GenreStat[]>('statistics/by_genre/'),
};
