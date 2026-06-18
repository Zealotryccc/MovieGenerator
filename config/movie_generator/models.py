from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Country(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    class Meta:
        verbose_name = "Страна"
        verbose_name_plural = "Страны"
    
    def __str__(self):
        return self.name


class Genre(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    class Meta:
        verbose_name = "Жанр"
        verbose_name_plural = "Жанры"
    
    def __str__(self):
        return self.name


class Actor(models.Model):
    name = models.CharField(max_length=255)
    photo = models.URLField(max_length=500, blank=True, null=True)
    
    class Meta:
        verbose_name = "Актёр"
        verbose_name_plural = "Актёры"
    
    def __str__(self):
        return self.name


class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    poster = models.URLField(max_length=500)
    release_date = models.DateField()
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True)
    genres = models.ManyToManyField(Genre)
    tags = models.ManyToManyField('Tag', blank=True)
    actors = models.ManyToManyField(Actor)
    director = models.CharField(max_length=255)
    duration = models.PositiveIntegerField(help_text="Продолжительность в минутах")
    age_rating = models.CharField(
        max_length=5,
        choices=[('0+', '0+'), ('6+', '6+'), ('12+', '12+'), ('16+', '16+'), ('18+', '18+')]
    )
    trailer = models.FileField(upload_to='trailers/', blank=True, null=True, verbose_name="Файл трейлера")
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        verbose_name = "Фильм"
        verbose_name_plural = "Фильмы"
        ordering = ['-release_date']
    
    def __str__(self):
        return self.title


class UserFavorite(models.Model):
    session_key = models.CharField(max_length=40, db_index=True)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='favorites')
    is_favorite = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['session_key', 'movie']
        verbose_name = "Избранный фильм"
        verbose_name_plural = "Избранные фильмы"
    
    def __str__(self):
        return f"{self.movie.title} (сессия: {self.session_key[:10]}...)"


class Review(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='reviews')
    author = models.CharField(max_length=100)
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.movie.title} - {self.author}"


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    class Meta:
        verbose_name = "Тег"
        verbose_name_plural = "Теги"
    
    def __str__(self):
        return self.name