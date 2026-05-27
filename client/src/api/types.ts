export type NamedEntity = { id: number; name: string };

export type MovieListItem = {
  id: number;
  title: string;
  poster: string;
  release_date: string;
  country: string;
  genres: string[];
  tags: string[];
  duration: number;
  age_rating: string;
  is_favorited: boolean;
};

export type Review = {
  id: number;
  movie: number;
  author: string;
  rating: number;
  text: string;
  created_at: string;
};

export type MovieDetail = {
  id: number;
  title: string;
  description: string;
  poster: string;
  release_date: string;
  country: NamedEntity | null;
  genres: NamedEntity[];
  tags: NamedEntity[];
  actors: { id: number; name: string; photo: string | null }[];
  director: string;
  duration: number;
  age_rating: string;
  created_at: string;
  reviews: Review[];
  is_favorited: boolean;
};

export type GeneralStats = {
  total_movies: number;
  total_actors: number;
  total_genres: number;
  total_countries: number;
  total_reviews: number;
  total_favorites: number;
  avg_rating_overall: number;
};

export type GenreStat = {
  genre: string;
  movies_count: number;
  avg_rating: number | null;
};
