from django.urls import path, include
from rest_framework.routers import DefaultRouter
from movie_generator import views

router = DefaultRouter()
router.register(r'movies', views.MovieViewSet, basename='movie')
router.register(r'actors', views.ActorViewSet)
router.register(r'genres', views.GenreViewSet)
router.register(r'countries', views.CountryViewSet)
router.register(r'reviews', views.ReviewViewSet)
router.register(r'tags', views.TagViewSet)

urlpatterns = [
    path('', include(router.urls)),
]