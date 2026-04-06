import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from datetime import date
from ..models import Country, Genre, Actor, Movie, Review, Tag


@pytest.mark.django_db
class TestCountry:
    def test_create_country(self):
        country = Country.objects.create(name="USA")
        assert country.name == "USA"
        assert str(country) == "USA"
    
    def test_country_unique_constraint(self):
        Country.objects.create(name="USA")
        with pytest.raises(IntegrityError):
            Country.objects.create(name="USA")


@pytest.mark.django_db
class TestGenre:
    def test_create_genre(self):
        genre = Genre.objects.create(name="Comedy")
        assert genre.name == "Comedy"
        assert str(genre) == "Comedy"


@pytest.mark.django_db
class TestActor:
    def test_create_actor(self):
        actor = Actor.objects.create(name="Tom Hanks")
        assert actor.name == "Tom Hanks"
        assert str(actor) == "Tom Hanks"


@pytest.mark.django_db
class TestMovie:
    def setup_method(self):
        self.country = Country.objects.create(name="USA")
        self.genre = Genre.objects.create(name="Drama")
        self.actor = Actor.objects.create(name="Tom Hanks")
    
    def test_create_movie(self):
        movie = Movie.objects.create(
            title="Forrest Gump",
            description="The story of Forrest Gump",
            poster="posters/forrest_gump.jpg",
            release_date=date(1994, 7, 6),
            country=self.country,
            director="Robert Zemeckis",
            duration=142,
            age_rating="16+"
        )
        movie.genres.add(self.genre)
        movie.actors.add(self.actor)
        
        assert movie.title == "Forrest Gump"
        assert movie.duration == 142
        assert movie.age_rating == "16+"
        assert str(movie) == "Forrest Gump"
    
    def test_movie_average_rating(self):
        movie = Movie.objects.create(
            title="Test Movie",
            description="Test description",
            poster="posters/test.jpg",
            release_date=date(2023, 1, 1),
            country=self.country,
            director="Test Director",
            duration=120,
            age_rating="12+"
        )
        
        Review.objects.create(movie=movie, author="User1", rating=8, text="Good")
        Review.objects.create(movie=movie, author="User2", rating=10, text="Excellent")
        
        assert movie.average_rating == 9.0
    
    def test_movie_average_rating_no_reviews(self):
        movie = Movie.objects.create(
            title="Test Movie",
            description="Test description",
            poster="posters/test.jpg",
            release_date=date(2023, 1, 1),
            country=self.country,
            director="Test Director",
            duration=120,
            age_rating="12+"
        )
        
        assert movie.average_rating == 0


@pytest.mark.django_db
class TestReview:
    def setup_method(self):
        self.country = Country.objects.create(name="USA")
        self.movie = Movie.objects.create(
            title="Test Movie",
            description="Test description",
            poster="posters/test.jpg",
            release_date=date(2023, 1, 1),
            country=self.country,
            director="Test Director",
            duration=120,
            age_rating="12+"
        )
    
    def test_create_review(self):
        review = Review.objects.create(
            movie=self.movie,
            author="John Doe",
            rating=8,
            text="Great movie!"
        )
        
        assert review.rating == 8
        assert review.author == "John Doe"
        assert str(review) == f"{self.movie.title} - John Doe"
    
    def test_review_rating_validation(self):
        with pytest.raises(ValidationError):
            review = Review(
                movie=self.movie,
                author="John Doe",
                rating=11,
                text="Great movie!"
            )
            review.full_clean()
        
        with pytest.raises(ValidationError):
            review = Review(
                movie=self.movie,
                author="John Doe",
                rating=0,
                text="Great movie!"
            )
            review.full_clean()


@pytest.mark.django_db
class TestTag:
    def test_create_tag(self):
        tag = Tag.objects.create(name="Action")
        assert tag.name == "Action"
        assert str(tag) == "Action"