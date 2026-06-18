import django, os, shutil, sys, subprocess
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.conf import settings
from movie_generator.models import Movie

TRAILER_DIR = os.path.join(settings.MEDIA_ROOT, 'trailers')
os.makedirs(TRAILER_DIR, exist_ok=True)

YT_DLP = shutil.which('yt-dlp') or shutil.which('youtube-dl')
if not YT_DLP:
    print('yt-dlp не найден. Установи: pip install yt-dlp')
    sys.exit(1)

from django.db.models import Q
movies = Movie.objects.filter(Q(trailer__isnull=True) | Q(trailer=''))
print(f'Найдено {len(movies)} фильмов без трейлеров')

for movie in movies:
    query = f'{movie.title} {movie.director} фильм трейлер 2025'
    filename = f'{movie.id}.mp4'
    filepath = os.path.join(TRAILER_DIR, filename)

    if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
        print(f'  ~ {movie.title} — уже скачан')
        movie.trailer = f'trailers/{filename}'
        movie.save(update_fields=['trailer'])
        continue

    print(f'  + Ищу трейлер для: {movie.title}...')

    try:
        subprocess.run([
            YT_DLP,
            f'ytsearch1:{query}',
            '-f', 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]',
            '-o', filepath,
            '--max-filesize', '200M',
            '--no-playlist',
            '--quiet',
            '--no-warnings',
        ], check=True, timeout=300)

        if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
            movie.trailer = f'trailers/{filename}'
            movie.save(update_fields=['trailer'])
            print(f'    ✓ Скачан: {movie.title}')
        else:
            print(f'    ✗ Не удалось скачать: {movie.title}')

    except subprocess.CalledProcessError:
        print(f'    ✗ Ошибка при скачивании: {movie.title}')
    except subprocess.TimeoutExpired:
        print(f'    ✗ Таймаут: {movie.title}')

print('Готово!')
