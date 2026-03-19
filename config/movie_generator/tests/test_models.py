import pytest
from movie_generator.models import Author, Tag, Movie

@pytest.mark.django_db
def test_author_fixture(author):
    assert author.name == "Борис Борисыч"
    assert Author.objects.count() == 1

@pytest.mark.django_db
def test_tag_fixture(tag):  # Исправлено: tag вместо Tag
    assert tag.name == "Фантастика"
    assert Tag.objects.count() == 1

@pytest.mark.django_db
def test_movie_fixture(movie, author, tag):
    assert movie.title == "Маленький принц"
    assert movie.description == "1111"
    assert movie.published_at == "2007-03-14"
    assert movie.authors.count() == 1
    assert movie.tags.count() == 1
    assert movie.authors.first().name == "Борис Борисыч"
    assert movie.tags.first().name == "Фантастика"
    assert Movie.objects.count() == 1