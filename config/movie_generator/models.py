from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=255)

class Movie(models.Model):
    title = models.CharField(max_length=150)
    published_at = models.DateField()
    description = models.TextField(null=True)
    
    def __str__(self):
        return self.title
