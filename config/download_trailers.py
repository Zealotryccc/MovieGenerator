import os, sys, subprocess, shutil

TRAILERS_DIR = os.path.join(os.path.dirname(__file__), '..', 'trailers')
os.makedirs(TRAILERS_DIR, exist_ok=True)

YT_DLP = shutil.which('yt-dlp') or shutil.which('youtube-dl')
if not YT_DLP:
    print('yt-dlp не найден. Установи: pip install yt-dlp')
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FFMPEG = shutil.which('ffmpeg') or os.path.join(SCRIPT_DIR, 'ffmpeg.exe')
if not os.path.isfile(FFMPEG):
    print('ffmpeg не найден. Положи ffmpeg.exe в папку config/')
    sys.exit(1)

movies = [
    ('Криминальное чтиво', 1994),
    ('Остров проклятых', 2010),
    ('Великий отель "Будапешт"', 2014),
    ('Индиана Джонс: В поисках утраченного ковчега', 1981),
    ('Заклятие', 2013),
    ('Дневник памяти', 2004),
    ('Шерлок Холмс', 2009),
    ('Гладиатор', 2000),
    ('Унесённые призраками', 2001),
    ('Спасти рядового Райана', 1998),
    ('Один дома', 1990),
    ('Вселенная Стивена Хокинга', 2014),
    ('Джанго освобождённый', 2012),
    ('Планета Земля', 2006),
]

for title, year in movies:
    filename = f'{title}.mp4'
    filepath = os.path.join(TRAILERS_DIR, filename)

    if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
        print(f'  ~ {title} — уже скачан')
        continue

    print(f'  + {title}...', end=' ')
    sys.stdout.flush()

    try:
        subprocess.run([
            YT_DLP,
            '--ffmpeg-location', SCRIPT_DIR,
            f'ytsearch:{title} {year} трейлер на русском',
            '--format-sort', '+res:720',
            '-f', 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]',
            '-o', filepath,
            '--max-filesize', '300M',
            '--no-playlist',
            '--embed-metadata',
            '--quiet',
            '--no-warnings',
        ], check=True, timeout=600)

        if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
            size = os.path.getsize(filepath) / 1024 / 1024
            print(f'✓ {size:.1f} MB')
        else:
            print('✗ не скачался')

    except subprocess.CalledProcessError:
        print('✗ не найдено')
    except Exception as e:
        print(f'✗ {e}')

print(f'\nГотово! Файлы в папке {TRAILERS_DIR}')
print(f'Всего: {sum(1 for f in os.listdir(TRAILERS_DIR) if f.endswith(".mp4"))} трейлеров')
