import pytest
from django.urls import reverse
from django.utils import timezone

from movie_generator.models import Review, UserFavorite


@pytest.mark.django_db
def test_movies_list(api_client, movie_with_relations):
    url = reverse("movie-list")
    response = api_client.get(url)
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["title"] == "Начало"


@pytest.mark.django_db
def test_movies_list_filter_by_genre_id(api_client, movie_with_relations, genre):
    url = reverse("movie-list")
    response = api_client.get(url, {"genre": genre.pk})
    assert response.status_code == 200
    assert len(response.data) == 1


@pytest.mark.django_db
def test_movies_list_filter_by_genre_name(api_client, movie_with_relations, genre):
    url = reverse("movie-list")
    response = api_client.get(url, {"genre": "Боевик"})
    assert response.status_code == 200
    assert len(response.data) == 1


@pytest.mark.django_db
def test_movies_list_filter_by_search(api_client, movie_with_relations):
    url = reverse("movie-list")
    response = api_client.get(url, {"search": "Начало"})
    assert response.status_code == 200
    assert len(response.data) == 1


@pytest.mark.django_db
def test_movies_list_filter_by_search_genre(api_client, movie_with_relations):
    url = reverse("movie-list")
    response = api_client.get(url, {"search": "Боев"})
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["title"] == "Начало"


@pytest.mark.django_db
def test_random_movie_endpoint(api_client, movie_with_relations):
    url = reverse("movie-random")
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.data["title"] == "Начало"


@pytest.mark.django_db
def test_random_movie_endpoint_empty_db(api_client):
    url = reverse("movie-random")
    response = api_client.get(url)
    assert response.status_code == 404


@pytest.mark.django_db
def test_popular_endpoint(api_client, movie, favorite):
    url = reverse("popular")
    response = api_client.get(url)
    assert response.status_code == 200
    assert len(response.data) >= 1


@pytest.mark.django_db
def test_statistics_endpoint(api_client, movie, review):
    url = reverse("statistics")
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.data["total_movies"] == 1
    assert response.data["total_reviews"] == 1


@pytest.mark.django_db
def test_statistics_by_genre(api_client, movie_with_relations, review):
    url = reverse("statistics-by-genre")
    response = api_client.get(url)
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["genre"] == "Боевик"


@pytest.mark.django_db
def test_movie_add_review(api_client, movie):
    url = reverse("movie-add-review", kwargs={"pk": movie.pk})
    response = api_client.post(
        url,
        {"author": "Тест", "rating": 7, "text": "Нормально"},
        format="json",
    )
    assert response.status_code == 201
    assert Review.objects.filter(movie=movie, rating=7).exists()


@pytest.mark.django_db
def test_movie_similar(api_client, movie_with_relations, country, genre):
    other = movie_with_relations.__class__.objects.create(
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
    url = reverse("movie-similar-movies", kwargs={"pk": movie_with_relations.pk})
    response = api_client.get(url)
    assert response.status_code == 200
    titles = [m["title"] for m in response.data]
    assert "Интерстеллар" in titles


@pytest.mark.django_db
def test_add_to_favorites(api_client, movie):
    url = reverse("movie-add-to-favorites", kwargs={"pk": movie.pk})
    response = api_client.post(url)
    assert response.status_code == 200
    assert UserFavorite.objects.filter(movie=movie, is_favorite=True).exists()


@pytest.mark.django_db
def test_favorites_guest_session_header(api_client, movie):
    """Мобильный клиент: X-Guest-Session без cookie."""
    guest_id = "guest-mobile-test-session-01"
    add_url = reverse("favorites-list")
    response = api_client.post(
        add_url,
        {"movie_id": movie.pk},
        format="json",
        HTTP_X_GUEST_SESSION=guest_id,
    )
    assert response.status_code == 201

    list_response = api_client.get(add_url, HTTP_X_GUEST_SESSION=guest_id)
    assert list_response.status_code == 200
    assert len(list_response.data) == 1
    assert list_response.data[0]["is_favorited"] is True


@pytest.mark.django_db
def test_favorites_session_flow(guest_client, movie):
    """Гость: cookie сессии связывает избранное между запросами."""
    add_url = reverse("favorites-list")
    response = guest_client.post(add_url, {"movie_id": movie.pk}, format="json")
    assert response.status_code == 201

    list_response = guest_client.get(add_url)
    assert list_response.status_code == 200
    assert len(list_response.data) == 1
    assert list_response.data[0]["id"] == movie.pk

    delete_url = reverse("favorites-detail", kwargs={"pk": movie.pk})
    guest_client.delete(delete_url)
    list_response = guest_client.get(add_url)
    assert len(list_response.data) == 0


@pytest.mark.django_db
def test_review_rating_max_10(api_client, movie):
    url = reverse("review-list")
    response = api_client.post(
        url,
        {
            "movie": movie.pk,
            "rating": 11,
            "text": "Слишком высокая оценка",
        },
        format="json",
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_reviews_filter_by_movie(api_client, review, movie):
    url = reverse("review-list")
    response = api_client.get(url, {"movie": movie.pk})
    assert response.status_code == 200
    assert len(response.data) == 1
