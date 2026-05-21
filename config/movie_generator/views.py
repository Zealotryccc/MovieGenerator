# views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from django.db.models import Avg
from .models import Country, Genre, Actor, Movie, Review, Tag
from .serializers import (
    CountrySerializer, GenreSerializer, ActorSerializer,
    MovieListSerializer, MovieDetailSerializer, MovieCreateUpdateSerializer,
    ReviewSerializer, TagSerializer
)
# Импортируем сервисы
from .services import (
    MovieService, ReviewService, FavoriteService, 
    StatisticsService, TagService
)


class CountryViewSet(viewsets.ModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ActorViewSet(viewsets.ModelViewSet):
    queryset = Actor.objects.all()
    serializer_class = ActorSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MovieListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return MovieCreateUpdateSerializer
        return MovieDetailSerializer
    
    def get_queryset(self):
        # Используем MovieService для фильтрации
        title = self.request.query_params.get('search')
        country_id = self.request.query_params.get('country')
        genre_id = self.request.query_params.get('genre')
        min_rating = self.request.query_params.get('min_rating')
        max_rating = self.request.query_params.get('max_rating')
        min_year = self.request.query_params.get('min_year')
        max_year = self.request.query_params.get('max_year')
        director = self.request.query_params.get('director')
        age_rating = self.request.query_params.get('age_rating')
        
        # Получаем отфильтрованные фильмы через сервис
        queryset = MovieService.get_movies_by_filters(
            title=title,
            country_id=country_id,
            genre_id=genre_id,
            min_rating=min_rating,
            max_rating=max_rating,
            min_year=min_year,
            max_year=max_year,
            director=director,
            age_rating=age_rating
        )
        
        # Сортировка
        ordering = self.request.query_params.get('ordering', '-release_date')
        if ordering in ['title', '-title', 'release_date', '-release_date', 
                        'duration', '-duration', 'created_at', '-created_at',
                        'avg_rating', '-avg_rating']:
            queryset = queryset.order_by(ordering)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Получить популярные фильмы"""
        limit = request.query_params.get('limit', 10)
        days = request.query_params.get('days', 30)
        
        try:
            limit = int(limit)
            days = int(days)
        except ValueError:
            return Response(
                {'error': 'limit and days must be integers'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        popular_movies = MovieService.get_popular_movies(limit=limit, days=days)
        serializer = MovieListSerializer(popular_movies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def top_rated(self, request):
        """Получить лучшие фильмы по рейтингу"""
        limit = request.query_params.get('limit', 10)
        min_reviews = request.query_params.get('min_reviews', 5)
        
        try:
            limit = int(limit)
            min_reviews = int(min_reviews)
        except ValueError:
            return Response(
                {'error': 'limit and min_reviews must be integers'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        top_movies = MovieService.get_top_rated_movies(limit=limit, min_reviews=min_reviews)
        serializer = MovieListSerializer(top_movies, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def new_releases(self, request):
        """Получить новинки"""
        days = request.query_params.get('days', 30)
        
        try:
            days = int(days)
        except ValueError:
            return Response(
                {'error': 'days must be integer'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        new_movies = MovieService.get_new_releases(days=days)
        serializer = MovieListSerializer(new_movies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        """Получить детальную информацию о фильме с агрегациями"""
        movie = MovieService.get_movie_details(pk)
        if not movie:
            return Response(
                {'error': 'Movie not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = MovieDetailSerializer(movie)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_review(self, request, pk=None):
        """Добавить отзыв к фильму через сервис"""
        movie = self.get_object()
        author = request.user.username if request.user.is_authenticated else request.data.get('author', "Anonymous")
        rating = request.data.get('rating')
        text = request.data.get('text')
        
        if not rating or not text:
            return Response(
                {'error': 'rating and text are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        review = ReviewService.add_review(movie.id, author, rating, text)
        
        if review:
            serializer = ReviewSerializer(review)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(
            {'error': 'Failed to add review'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['get'])
    def similar_movies(self, request, pk=None):
        """Получить похожие фильмы на основе жанров"""
        movie = self.get_object()
        similar_movies = MovieService.get_similar_movies(movie, limit=5)
        serializer = MovieListSerializer(similar_movies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_to_favorites(self, request, pk=None):
        """Добавить фильм в избранное"""
        # Получаем или создаем session_key
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key
        
        favorite, created = FavoriteService.add_to_favorites(session_key, pk)
        
        if favorite:
            return Response(
                {'message': 'Added to favorites', 'created': created},
                status=status.HTTP_200_OK
            )
        
        return Response(
            {'error': 'Movie not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    @action(detail=True, methods=['post'])
    def remove_from_favorites(self, request, pk=None):
        """Удалить фильм из избранного"""
        session_key = request.session.session_key
        if not session_key:
            return Response(
                {'error': 'Session not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        removed = FavoriteService.remove_from_favorites(session_key, pk)
        
        if removed:
            return Response(
                {'message': 'Removed from favorites'},
                status=status.HTTP_200_OK
            )
        
        return Response(
            {'error': 'Movie not in favorites'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    @action(detail=True, methods=['get'])
    def is_favorite(self, request, pk=None):
        """Проверить, добавлен ли фильм в избранное"""
        session_key = request.session.session_key
        if not session_key:
            return Response({'is_favorite': False})
        
        is_fav = FavoriteService.is_favorite(session_key, pk)
        return Response({'is_favorite': is_fav})


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        # Используем ReviewService для фильтрации
        movie_id = self.request.query_params.get('movie')
        author = self.request.query_params.get('author')
        
        if movie_id:
            return ReviewService.get_movie_reviews(movie_id)
        
        if author:
            return ReviewService.get_user_reviews(author)
        
        return super().get_queryset()
    
    def perform_create(self, serializer):
        author = self.request.user.username if self.request.user.is_authenticated else "Anonymous"
        serializer.save(author=author)
    
    @action(detail=True, methods=['get'])
    def movie_rating(self, request, pk=None):
        """Получить средний рейтинг для отзыва (или для фильма)"""
        movie_id = request.query_params.get('movie')
        if movie_id:
            avg_rating, count = ReviewService.get_average_rating(movie_id)
            return Response({
                'movie_id': movie_id,
                'average_rating': avg_rating,
                'reviews_count': count
            })
        
        return Response(
            {'error': 'movie parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )


class StatisticsViewSet(viewsets.ViewSet):
    """ViewSet для статистики"""
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def general(self, request):
        """Общая статистика"""
        stats = StatisticsService.get_general_stats()
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def by_genre(self, request):
        """Статистика по жанрам"""
        stats = StatisticsService.get_genre_stats()
        data = [
            {
                'genre': genre.name,
                'movies_count': genre.movies_count,
                'avg_rating': genre.avg_rating
            }
            for genre in stats
        ]
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def by_country(self, request):
        """Статистика по странам"""
        stats = StatisticsService.get_country_stats()
        data = [
            {
                'country': country.name,
                'movies_count': country.movies_count,
                'avg_rating': country.avg_rating
            }
            for country in stats
        ]
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def top_actors(self, request):
        """Топ актёров"""
        limit = request.query_params.get('limit', 10)
        try:
            limit = int(limit)
        except ValueError:
            limit = 10
        
        actors = StatisticsService.get_top_actors(limit=limit)
        data = [
            {
                'id': actor.id,
                'name': actor.name,
                'movies_count': actor.movies_count,
                'photo': actor.photo
            }
            for actor in actors
        ]
        return Response(data)
    
    @action(detail=False, methods=['get'])
    def yearly(self, request):
        """Статистика по годам"""
        stats = StatisticsService.get_yearly_stats()
        return Response(stats)