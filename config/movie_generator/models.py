# from django.db import models

# class Author(models.Model):
#     name = models.CharField(max_length=255)

# class Movie(models.Model):
#     title = models.CharField(max_length=150)
#     published_at = models.DateField()
#     description = models.TextField(null=True)
    
#     def __str__(self):
#         return self.title
from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=255, verbose_name="Имя автора")
    
    class Meta:
        verbose_name = "Автор"
        verbose_name_plural = "Авторы"
    
    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="Название тега")
    
    class Meta:
        verbose_name = "Тег"
        verbose_name_plural = "Теги"
    
    def __str__(self):
        return self.name


class Movie(models.Model):
    title = models.CharField(max_length=150, verbose_name="Название")
    published_at = models.DateField(verbose_name="Дата выхода")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")
    
    # Связи
    authors = models.ManyToManyField(Author, verbose_name="Авторы")
    tags = models.ManyToManyField(Tag, verbose_name="Теги")
    
    class Meta:
        verbose_name = "Фильм"
        verbose_name_plural = "Фильмы"
    
    def __str__(self):
        return self.title