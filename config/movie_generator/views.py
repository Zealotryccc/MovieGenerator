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
        queryset = super().get_queryset()
        
        # Фильтрация по жанру
        genre = self.request.query_params.get('genre')
        if genre:
            queryset = queryset.filter(genres__name__icontains=genre)
        
        # Фильтрация по стране
        country = self.request.query_params.get('country')
        if country:
            queryset = queryset.filter(country__name__icontains=country)
        
        # Фильтрация по году
        year = self.request.query_params.get('year')
        if year:
            queryset = queryset.filter(release_date__year=year)
        
        # Фильтрация по минимальному рейтингу
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.annotate(
                avg_rating=Avg('reviews__rating')
            ).filter(avg_rating__gte=min_rating)
        
        # Поиск по названию
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)
        
        # Сортировка
        ordering = self.request.query_params.get('ordering', '-release_date')
        if ordering in ['title', '-title', 'release_date', '-release_date', 
                        'duration', '-duration', 'created_at', '-created_at']:
            queryset = queryset.order_by(ordering)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def add_review(self, request, pk=None):
        movie = self.get_object()
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            author = request.user.username if request.user.is_authenticated else "Anonymous"
            serializer.save(movie=movie, author=author)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def similar_movies(self, request, pk=None):
        """Получить похожие фильмы на основе жанров"""
        movie = self.get_object()
        similar_movies = Movie.objects.filter(
            genres__in=movie.genres.all()
        ).exclude(
            id=movie.id
        ).distinct()[:5]
        
        serializer = MovieListSerializer(similar_movies, many=True)
        return Response(serializer.data)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        author = self.request.user.username if self.request.user.is_authenticated else "Anonymous"
        serializer.save(author=author)
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Фильтрация по фильму
        movie_id = self.request.query_params.get('movie')
        if movie_id:
            queryset = queryset.filter(movie_id=movie_id)
        
        # Фильтрация по автору
        author = self.request.query_params.get('author')
        if author:
            queryset = queryset.filter(author__icontains=author)
        
        return queryset