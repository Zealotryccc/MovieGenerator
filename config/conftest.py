import pytest
from movie_generator.models import Author,Movie,Tag

@pytest.fixture
def author(db):
    return Author.objects.create(
        name = "Борис Борисыч"
    )
@pytest.fixture
def tag(db):
    return Tag.objects.create(
        name = "Фантастика"
    )
@pytest.fixture
def movie(author, tag):
    movie = Movie.objects.create(
        title="Маленький принц",
        description="1111",
        published_at="2007-03-14"
    )
    movie.authors.add(author)
    movie.tags.add(tag)
    return movie