import pytest
from django.utils import timezone
from datetime import timedelta

from movie_generator.models import Movie, Review, UserFavorite
from movie_generator.services import (
    MovieService,
    ReviewService,
    FavoriteService,
    StatisticsService,
)


@pytest.mark.django_db
def test_get_movies_by_filters_title(movie):
    result = MovieService.get_movies_by_filters(title="Нач")
    assert result.count() == 1
    assert result.first().title == "Начало"


@pytest.mark.django_db
def test_get_movies_by_filters_genre_id(movie_with_relations, genre):
    result = MovieService.get_movies_by_filters(genre_id=genre.id)
    assert result.count() == 1


@pytest.mark.django_db
def test_get_movies_by_filters_genre_name(movie_with_relations, genre):
    result = MovieService.get_movies_by_filters(genre_name="Боев")
    assert result.count() == 1


@pytest.mark.django_db
def test_search_movies(movie_with_relations, actor):
    result = MovieService.search_movies("ДиКаприо")
    assert result.count() == 1


@pytest.mark.django_db
def test_get_similar_movies(movie_with_relations, country, genre):
    other = Movie.objects.create(
        title="Интерстеллар",
        description="Космос",
        poster="https://example.com/interstellar.jpg",
        release_date="2014-11-07",
        country=country,
        director="Кристофер Нолан",
        duration=169,
        age_rating="12+",
    )
    other.genres.add(genre)
    similar = list(MovieService.get_similar_movies(movie_with_relations, limit=5))
    pks = [m.pk for m in similar]
    assert other.pk in pks
    assert movie_with_relations.pk not in pks


@pytest.mark.django_db
def test_get_popular_movies(movie, favorite):
    popular = list(MovieService.get_popular_movies(limit=10, days=30))
    assert movie.pk in [m.pk for m in popular]


@pytest.mark.django_db
def test_review_service_add_and_average(movie):
    review = ReviewService.add_review(movie.id, "Анна", 8, "Хорошо")
    assert review.author == "Анна"
    avg, count = ReviewService.get_average_rating(movie.id)
    assert count == 1
    assert avg == 8


@pytest.mark.django_db
def test_favorite_service_add_remove(movie):
    session = "session-abc"
    favorite, created = FavoriteService.add_to_favorites(session, movie.id)
    assert created is True
    assert FavoriteService.is_favorite(session, movie.id)

    FavoriteService.remove_from_favorites(session, movie.id)
    assert not FavoriteService.is_favorite(session, movie.id)
    assert favorite.pk  # объект создан


@pytest.mark.django_db
def test_statistics_general(movie, review, country, genre, actor):
    stats = StatisticsService.get_general_stats()
    assert stats["total_movies"] == 1
    assert stats["total_reviews"] == 1
    assert stats["total_countries"] == 1
    assert stats["avg_rating_overall"] == 9


@pytest.mark.django_db
def test_statistics_yearly(movie):
    stats = StatisticsService.get_yearly_stats()
    assert len(stats) == 1
    assert stats[0]["year"] == 2010
    assert stats[0]["movies_count"] == 1
