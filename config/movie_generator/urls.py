from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

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

# Дополнительные URL для специфических действий
urlpatterns += [
    path('movies/<int:pk>/add_review/', 
         views.MovieViewSet.as_view({'post': 'add_review'}), 
         name='movie-add-review'),
    path('movies/<int:pk>/similar/', 
         views.MovieViewSet.as_view({'get': 'similar_movies'}), 
         name='movie-similar'),
]