from django.contrib import admin
from .models import Country, Genre, Actor, Movie, Review, Tag

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Actor)
class ActorAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    filter_horizontal = ('genres', 'actors')
    list_display = ('title', 'release_date', 'country', 'duration')
    list_filter = ('genres', 'country', 'release_date', 'age_rating')
    search_fields = ('title', 'director', 'actors__name')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('movie', 'author', 'rating', 'created_at')

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)