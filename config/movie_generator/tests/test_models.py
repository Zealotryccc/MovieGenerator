import pytest
from movie_generator.models import Country, Genre, Actor, Movie, Tag


@pytest.mark.django_db
def test_country(country):
    assert country.name == "США"
    assert Country.objects.count() == 1


@pytest.mark.django_db
def test_genre(genre):
    assert genre.name == "Боевик"
    assert Genre.objects.count() == 1


@pytest.mark.django_db
def test_actor(actor):
    assert actor.name == "Леонардо ДиКаприо"
    assert actor.photo == "https://example.com/dicaprio.jpg"
    assert Actor.objects.count() == 1


@pytest.mark.django_db
def test_tag(tag):
    assert tag.name == "кассовый"
    assert Tag.objects.count() == 1


@pytest.mark.django_db
def test_movie(movie, country):
    assert movie.title == "Начало"
    assert movie.country == country
    assert movie.director == "Кристофер Нолан"
    assert movie.duration == 148
    assert movie.age_rating == "12+"


@pytest.mark.django_db
def test_movie_with_genres_and_actors(movie_with_relations, genre, actor):
    assert movie_with_relations.genres.filter(pk=genre.pk).exists()
    assert movie_with_relations.actors.filter(pk=actor.pk).exists()
