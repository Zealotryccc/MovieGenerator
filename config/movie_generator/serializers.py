from rest_framework import serializers
from .models import Country, Genre, Actor, Movie, Review, Tag


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'name']
        read_only_fields = ['id']


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']
        read_only_fields = ['id']


class ActorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actor
        fields = ['id', 'name', 'photo']
        read_only_fields = ['id']
    
    def validate_photo(self, value):
        """Валидация URL фото"""
        if value:
            from django.core.validators import URLValidator
            from django.core.exceptions import ValidationError
            
            # Валидация URL
            validator = URLValidator()
            try:
                validator(value)
            except ValidationError:
                raise serializers.ValidationError("Некорректный URL фото")
            
            # Проверка на допустимые форматы изображений
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
            value_lower = value.lower()
            if not any(value_lower.endswith(ext) for ext in allowed_extensions):
                raise serializers.ValidationError(
                    "URL должен вести на изображение. Допустимые форматы: jpg, jpeg, png, gif, webp, bmp"
                )
        return value


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']
        read_only_fields = ['id']


class ReviewSerializer(serializers.ModelSerializer):
    author = serializers.CharField(read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'movie', 'author', 'rating', 'text', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']
        extra_kwargs = {
            'movie': {'write_only': True}
        }


class MovieListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка фильмов (краткая информация)"""
    average_rating = serializers.FloatField(read_only=True)
    country = serializers.StringRelatedField()
    genres = serializers.StringRelatedField(many=True)
    
    class Meta:
        model = Movie
        fields = ['id', 'title', 'poster', 'release_date', 
                  'country', 'genres', 'duration', 'age_rating', 
                  'average_rating']


class MovieDetailSerializer(serializers.ModelSerializer):
    """Сериализатор для детальной информации о фильме"""
    country = CountrySerializer(read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    actors = ActorSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Movie
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class MovieCreateUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания и обновления фильмов"""
    genres = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Genre.objects.all()
    )
    actors = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Actor.objects.all()
    )
    
    class Meta:
        model = Movie
        fields = ['id', 'title', 'description', 'poster', 'release_date',
                  'country', 'genres', 'actors', 'director', 'duration',
                  'age_rating']
    
    def validate_poster(self, value):
        """Валидация URL постера"""
        from django.core.validators import URLValidator
        from django.core.exceptions import ValidationError
        
        # Валидация URL
        validator = URLValidator()
        try:
            validator(value)
        except ValidationError:
            raise serializers.ValidationError("Некорректный URL постера")
        
        # Проверка на допустимые форматы изображений
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
        value_lower = value.lower()
        if not any(value_lower.endswith(ext) for ext in allowed_extensions):
            raise serializers.ValidationError(
                "URL должен вести на изображение. Допустимые форматы: jpg, jpeg, png, gif, webp, bmp"
            )
        
        # Проверка на безопасные протоколы
        if not (value_lower.startswith('http://') or value_lower.startswith('https://')):
            raise serializers.ValidationError("URL должен начинаться с http:// или https://")
        
        return value
    
    def validate_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError("Длительность должна быть положительной")
        if value > 600:
            raise serializers.ValidationError("Длительность не может превышать 600 минут")
        return value
    
    def validate_release_date(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Дата выхода не может быть в будущем")
        return value
    
    def validate_title(self, value):
        if len(value) < 1:
            raise serializers.ValidationError("Название не может быть пустым")
        return value