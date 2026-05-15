from rest_framework import serializers
from .models import Country, Genre, Actor, Movie, Review, Tag, UserFavorite


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'name']


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']


class ActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actor
        fields = ['id', 'name', 'photo']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'movie', 'author', 'rating', 'text', 'created_at']
        read_only_fields = ['id', 'created_at']


class MovieListSerializer(serializers.ModelSerializer):
    country = serializers.StringRelatedField()
    genres = serializers.StringRelatedField(many=True)
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'poster', 'release_date',
            'country', 'genres', 'duration', 'age_rating', 'is_favorited'
        ]
    
    def get_is_favorited(self, obj):
        # Получаем request из контекста
        request = self.context.get('request')
        if request and request.session.session_key:
            return UserFavorite.objects.filter(
                session_key=request.session.session_key,
                movie=obj,
                is_favorite=True
            ).exists()
        return False


class MovieDetailSerializer(serializers.ModelSerializer):
    country = CountrySerializer(read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    actors = ActorSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'description', 'poster', 'release_date',
            'country', 'genres', 'actors', 'director', 'duration',
            'age_rating', 'created_at', 'reviews', 'is_favorited'
        ]
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.session.session_key:
            return UserFavorite.objects.filter(
                session_key=request.session.session_key,
                movie=obj,
                is_favorite=True
            ).exists()
        return False

class MovieCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'description', 'poster', 'release_date',
            'country', 'genres', 'actors', 'director', 'duration', 'age_rating'
        ]
        read_only_fields = ['id']


# НОВЫЙ СЕРИАЛИЗАТОР ДЛЯ ИЗБРАННОГО
class UserFavoriteSerializer(serializers.ModelSerializer):
    movie = MovieListSerializer(read_only=True)
    movie_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = UserFavorite
        fields = ['id', 'movie', 'movie_id', 'is_favorite', 'created_at']
        read_only_fields = ['id', 'created_at', 'session_key']
    
    def create(self, validated_data):
        # Извлекаем movie_id из данных
        movie_id = validated_data.pop('movie_id', None)
        if movie_id:
            try:
                movie = Movie.objects.get(id=movie_id)
                validated_data['movie'] = movie
            except Movie.DoesNotExist:
                raise serializers.ValidationError({'movie_id': 'Фильм не найден'})
        
        return super().create(validated_data)