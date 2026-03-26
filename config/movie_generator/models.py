from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Country(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Страна")
    
    class Meta:
        verbose_name = "Страна"
        verbose_name_plural = "Страны"
    
    def __str__(self):
        return self.name


class Genre(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="Жанр")
    
    class Meta:
        verbose_name = "Жанр"
        verbose_name_plural = "Жанры"
    
    def __str__(self):
        return self.name


class Actor(models.Model):
    name = models.CharField(max_length=255, verbose_name="Имя актера")
    photo = models.ImageField(upload_to='actors/', blank=True, null=True, verbose_name="Фото")
    
    class Meta:
        verbose_name = "Актер"
        verbose_name_plural = "Актеры"
    
    def __str__(self):
        return self.name


class Movie(models.Model):
    title = models.CharField(max_length=200, verbose_name="Название")
    description = models.TextField(verbose_name="Описание")
    poster = models.ImageField(upload_to='posters/', verbose_name="Постер")
    release_date = models.DateField(verbose_name="Дата выхода")
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, verbose_name="Страна")
    genres = models.ManyToManyField(Genre, verbose_name="Жанры")
    actors = models.ManyToManyField(Actor, verbose_name="Актеры")
    director = models.CharField(max_length=255, verbose_name="Режиссер")
    duration = models.PositiveIntegerField(verbose_name="Длительность (мин)")
    age_rating = models.CharField(
        max_length=5,
        choices=[
            ('0+', '0+'), ('6+', '6+'), ('12+', '12+'), 
            ('16+', '16+'), ('18+', '18+')
        ],
        verbose_name="Возрастной рейтинг"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Фильм"
        verbose_name_plural = "Фильмы"
        ordering = ['-release_date']
    
    def __str__(self):
        return self.title
    
    @property
    def average_rating(self):
        """Средний рейтинг фильма"""
        reviews = self.reviews.all()
        if reviews:
            return round(sum(r.rating for r in reviews) / len(reviews), 1)
        return 0


class Review(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='reviews', verbose_name="Фильм")
    author = models.CharField(max_length=100, verbose_name="Автор")
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        verbose_name="Рейтинг"
    )
    text = models.TextField(verbose_name="Текст отзыва")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.movie.title} - {self.author}"


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="Тег")
    
    class Meta:
        verbose_name = "Тег"
        verbose_name_plural = "Теги"
    
    def __str__(self):
        return self.name