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

popular = views.MovieViewSet.as_view({'get': 'popular'})
statistics_general = views.StatisticsViewSet.as_view({'get': 'general'})
statistics_by_genre = views.StatisticsViewSet.as_view({'get': 'by_genre'})
statistics_by_country = views.StatisticsViewSet.as_view({'get': 'by_country'})
statistics_top_actors = views.StatisticsViewSet.as_view({'get': 'top_actors'})
statistics_yearly = views.StatisticsViewSet.as_view({'get': 'yearly'})
favorites = views.FavoriteViewSet.as_view({'get': 'list', 'post': 'create'})
favorites_detail = views.FavoriteViewSet.as_view({'delete': 'destroy'})

urlpatterns = [
    path('favorites/', favorites, name='favorites-list'),
    path('favorites/<int:pk>/', favorites_detail, name='favorites-detail'),
    path('popular/', popular, name='popular'),
    path('statistics/', statistics_general, name='statistics'),
    path('statistics/by_genre/', statistics_by_genre, name='statistics-by-genre'),
    path('statistics/by_country/', statistics_by_country, name='statistics-by-country'),
    path('statistics/top_actors/', statistics_top_actors, name='statistics-top-actors'),
    path('statistics/yearly/', statistics_yearly, name='statistics-yearly'),
    path('', include(router.urls)),
]
