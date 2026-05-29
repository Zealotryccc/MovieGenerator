# services.py
from django.db.models import Q, Avg, Count
from django.db.models.functions import ExtractYear
from django.utils import timezone
from datetime import timedelta
from .models import Movie, Country, Genre, Actor, Review, UserFavorite, Tag


class MovieService:
    
    @staticmethod
    def get_movies_by_filters(title=None, country_id=None, genre_id=None,
                               genre_name=None, tag_id=None, tag_name=None,
                               min_rating=None, max_rating=None,
                               min_year=None, max_year=None,
                               director=None, age_rating=None):
        queryset = Movie.objects.all()
        
        if title:
            queryset = queryset.filter(
                Q(title__icontains=title) | Q(genres__name__icontains=title),
            )
        
        if country_id:
            queryset = queryset.filter(country_id=country_id)
        
        if genre_id:
            queryset = queryset.filter(genres__id=genre_id)
        elif genre_name:
            queryset = queryset.filter(genres__name__icontains=genre_name)

        if tag_id:
            queryset = queryset.filter(tags__id=tag_id)
        elif tag_name:
            queryset = queryset.filter(tags__name__icontains=tag_name)

        if min_year:
            queryset = queryset.filter(release_date__year__gte=min_year)
        
        if max_year:
            queryset = queryset.filter(release_date__year__lte=max_year)
        
        if director:
            queryset = queryset.filter(director__icontains=director)
        
        if age_rating:
            queryset = queryset.filter(age_rating=age_rating)
        
        if min_rating or max_rating:
            avg_rating = Avg('reviews__rating')
            queryset = queryset.annotate(avg_rating=avg_rating)
            
            if min_rating:
                queryset = queryset.filter(avg_rating__gte=min_rating)
            if max_rating:
                queryset = queryset.filter(avg_rating__lte=max_rating)
        
        return queryset.distinct()
    
    @staticmethod
    def get_random_movie():
        return Movie.objects.order_by('?').first()

    @staticmethod
    def get_popular_movies(limit=10, days=30):
        # Получить популярные фильмы (по количеству добавлений в избранное за последние N дней)
        since_date = timezone.now() - timedelta(days=days)
        popular_movies = Movie.objects.filter(
            favorites__created_at__gte=since_date,
            favorites__is_favorite=True
        ).annotate(
            favorites_count=Count('favorites')
        ).order_by('-favorites_count')[:limit]
        
        return popular_movies
    
    @staticmethod
    def get_top_rated_movies(limit=10, min_reviews=5):
        movies = Movie.objects.annotate(
            avg_rating=Avg('reviews__rating'),
            reviews_count=Count('reviews')
        ).filter(
            reviews_count__gte=min_reviews
        ).order_by('-avg_rating')[:limit]
        
        return movies
    
    @staticmethod
    def get_new_releases(days=30):
        since_date = timezone.now().date() - timedelta(days=days)
        return Movie.objects.filter(release_date__gte=since_date).order_by('-release_date')
    
    @staticmethod
    def get_movie_details(movie_id):
        try:
            movie = Movie.objects.get(id=movie_id)
            movie.avg_rating = Review.objects.filter(movie=movie).aggregate(Avg('rating'))['rating__avg']
            movie.reviews_count = Review.objects.filter(movie=movie).count()
            movie.favorites_count = UserFavorite.objects.filter(movie=movie, is_favorite=True).count()
            return movie
        except Movie.DoesNotExist:
            return None
    
    @staticmethod
    def search_movies(query):
        if not query:
            return Movie.objects.none()
        
        return Movie.objects.filter(
            Q(title__icontains=query) |
            Q(genres__name__icontains=query) |
            Q(director__icontains=query) |
            Q(actors__name__icontains=query) |
            Q(description__icontains=query),
        ).distinct()

    @staticmethod
    def get_similar_movies(movie, limit=5):
        genre_ids = movie.genres.values_list('id', flat=True)
        if not genre_ids:
            return Movie.objects.none()
        return Movie.objects.filter(
            genres__id__in=genre_ids
        ).exclude(
            id=movie.id
        ).annotate(
            common_genres=Count('genres', filter=Q(genres__id__in=genre_ids))
        ).order_by('-common_genres')[:limit]


class ReviewService:
    @staticmethod
    def get_movie_reviews(movie_id, order_by='-created_at'):
        return Review.objects.filter(movie_id=movie_id).order_by(order_by)
    
    @staticmethod
    def add_review(movie_id, author, rating, text):
        try:
            movie = Movie.objects.get(id=movie_id)
            review = Review.objects.create(
                movie=movie,
                author=author,
                rating=rating,
                text=text
            )
            return review
        except Movie.DoesNotExist:
            return None
    
    @staticmethod
    def get_user_reviews(author, limit=10):
        return Review.objects.filter(author=author).order_by('-created_at')[:limit]
    
    @staticmethod
    def get_average_rating(movie_id):
        result = Review.objects.filter(movie_id=movie_id).aggregate(
            avg_rating=Avg('rating'),
            reviews_count=Count('id')
        )
        return result['avg_rating'] or 0, result['reviews_count']


class FavoriteService:
    @staticmethod
    def add_to_favorites(session_key, movie_id):
        try:
            movie = Movie.objects.get(id=movie_id)
            favorite, created = UserFavorite.objects.get_or_create(
                session_key=session_key,
                movie=movie,
                defaults={'is_favorite': True}
            )
            if not created and not favorite.is_favorite:
                favorite.is_favorite = True
                favorite.save()
            return favorite, created
        except Movie.DoesNotExist:
            return None, False
    
    @staticmethod
    def remove_from_favorites(session_key, movie_id):
        try:
            favorite = UserFavorite.objects.get(session_key=session_key, movie_id=movie_id)
            favorite.is_favorite = False
            favorite.save()
            return True
        except UserFavorite.DoesNotExist:
            return False
    
    @staticmethod
    def get_user_favorites(session_key):
        favorites = UserFavorite.objects.filter(
            session_key=session_key,
            is_favorite=True
        ).select_related('movie')
        
        return [favorite.movie for favorite in favorites]
    
    @staticmethod
    def is_favorite(session_key, movie_id):
        return UserFavorite.objects.filter(
            session_key=session_key,
            movie_id=movie_id,
            is_favorite=True
        ).exists()


class StatisticsService:
    
    @staticmethod
    def get_general_stats():
        return {
            'total_movies': Movie.objects.count(),
            'total_actors': Actor.objects.count(),
            'total_genres': Genre.objects.count(),
            'total_countries': Country.objects.count(),
            'total_reviews': Review.objects.count(),
            'total_favorites': UserFavorite.objects.filter(is_favorite=True).count(),
            'avg_rating_overall': Review.objects.aggregate(Avg('rating'))['rating__avg'] or 0,
        }
    
    @staticmethod
    def get_genre_stats():
        return Genre.objects.annotate(
            movies_count=Count('movie'),
            avg_rating=Avg('movie__reviews__rating')
        ).order_by('-movies_count')
    
    @staticmethod
    def get_country_stats():
        return Country.objects.annotate(
            movies_count=Count('movie'),
            avg_rating=Avg('movie__reviews__rating')
        ).order_by('-movies_count')
    
    @staticmethod
    def get_top_actors(limit=10):
        return Actor.objects.annotate(
            movies_count=Count('movie')
        ).order_by('-movies_count')[:limit]

    @staticmethod
    def get_yearly_stats():
        return list(
            Movie.objects.annotate(year=ExtractYear('release_date'))
            .values('year')
            .annotate(movies_count=Count('id'))
            .order_by('year')
        )

    # @staticmethod
    # def get_popular_tags(limit=20):
    #     """
    #     Получить популярные теги (в перспективе можно будет привязать к фильмам)
    #     """
    #     # Если теги ещё не привязаны к фильмам, возвращаем все теги
    #     return Tag.objects.all()[:limit]