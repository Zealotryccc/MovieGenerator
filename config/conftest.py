import pytest
from movie_generator.models import Country, Genre, Actor, Movie, Review, Tag

@pytest.fixture
def country(db):
    return Country.objects.create(
        name="США"
    )

@pytest.fixture
def genre(db):
    return Genre.objects.create(
        name="Боевик"
    )

@pytest.fixture
def actor(db):
    return Actor.objects.create(
        name="Леонардо ДиКаприо",
        photo="https://example.com/dicaprio.jpg"
    )

@pytest.fixture
def tag(db):
    return Tag.objects.create(
        name="кассовый"
    )

@pytest.fixture
def movie(country, db):
    # Создаём фильм без ManyToMany полей (genres, actors)
    movie = Movie.objects.create(
        title="Начало",
        description="Фильм о проникновении в сны",
        poster="https://example.com/inception.jpg",
        release_date="2010-07-16",
        country=country,
        director="Кристофер Нолан",
        duration=148,
        age_rating="12+"
    )
    return movie

@pytest.fixture
def movie_with_genres_and_actors(movie, genre, actor):
    # Добавляем связи ManyToMany
    movie.genres.add(genre)
    movie.actors.add(actor)
    return movie

@pytest.fixture
def review(movie, db):
    return Review.objects.create(
        movie=movie,
        author="Иван Петров",
        rating=9,
        text="Шедевр! Обязательно к просмотру"
    )