import pytest


@pytest.fixture
def api_client(db):
    from django.contrib.auth import get_user_model
    from rest_framework.test import APIClient

    client = APIClient()
    user = get_user_model().objects.create_user(
        username="testuser",
        password="testpass123",
    )
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def guest_client():
    """Клиент без логина — только session cookie для избранного."""
    from rest_framework.test import APIClient
    return APIClient()


@pytest.fixture
def country(db):
    from movie_generator.models import Country
    return Country.objects.create(name="США")


@pytest.fixture
def genre(db):
    from movie_generator.models import Genre
    return Genre.objects.create(name="Боевик")


@pytest.fixture
def actor(db):
    from movie_generator.models import Actor
    return Actor.objects.create(
        name="Леонардо ДиКаприо",
        photo="https://example.com/dicaprio.jpg",
    )


@pytest.fixture
def tag(db):
    from movie_generator.models import Tag
    return Tag.objects.create(name="кассовый")


@pytest.fixture
def movie(country, db):
    from movie_generator.models import Movie
    return Movie.objects.create(
        title="Начало",
        description="Фильм о проникновении в сны",
        poster="https://example.com/inception.jpg",
        release_date="2010-07-16",
        country=country,
        director="Кристофер Нолан",
        duration=148,
        age_rating="12+",
    )


@pytest.fixture
def movie_with_relations(movie, genre, actor):
    movie.genres.add(genre)
    movie.actors.add(actor)
    return movie


@pytest.fixture
def review(movie, db):
    from movie_generator.models import Review
    return Review.objects.create(
        movie=movie,
        author="Иван Петров",
        rating=9,
        text="Шедевр! Обязательно к просмотру",
    )


@pytest.fixture
def favorite(movie, db):
    from movie_generator.models import UserFavorite
    return UserFavorite.objects.create(
        session_key="test-session-key",
        movie=movie,
        is_favorite=True,
    )
