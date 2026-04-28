import pytest
from django.urls import reverse
from django.test import Client
from movie_generator.models import Movie, Review, Country, Genre, Actor, Tag

@pytest.mark.django_db
def test_country(country):
    assert country.name == "США"
    assert Country.objects.count() == 1

def test_genre(genre):
    assert genre.name == "Боевик"
    assert Genre.objects.count() == 1

def test_actor(actor):
    assert actor.name == "Леонардо ДиКаприо"
    assert actor.photo == "https://example.com/dicaprio.jpg"
    assert Actor.objects.count() == 1 

def test_tag(tag):
    assert tag.name == "кассовый"
    assert Tag.objects.count() == 1

def test_movie(movie):
    assert movie.title == "Начало"
    assert movie.description == "Фильм о проникновении в сны"
    assert movie.poster == "https://example.com/inception.jpg"
    assert movie.release_date == "2010-07-16"
    assert movie.country == Country
    assert movie.director == "Кристофер Нолан"
    assert movie.duration == 148
    assert movie.age_rating == "12+"

def test_movie_with_genres_and_actors(movie,genre,actor):
    assert movie.genres.add(genre)
    movie.actors