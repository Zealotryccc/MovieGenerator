import os, sys, urllib.request, urllib.parse, json, time

OUT = os.path.join(os.path.dirname(__file__), '..', 'actors_photos')
os.makedirs(OUT, exist_ok=True)

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

ACTORS = [
    'Райан Гослинг', 'Дилан О\'Брайен', 'Томас Сангстер',
    'Джон Траволта', 'Ума Турман', 'Сэмюэл Л. Джексон',
    'Леонардо ДиКаприо', 'Марк Руффало', 'Рэйф Файнс',
    'Тони Револори', 'Харрисон Форд', 'Карен Аллен',
    'Вера Фармига', 'Патрик Уилсон', 'Рэйчел Макадамс',
    'Роберт Дауни мл.', 'Джуд Лоу', 'Рассел Кроу',
    'Хоакин Феникс', 'Том Хэнкс', 'Мэтт Деймон',
    'Маколей Калкин', 'Джо Пеши', 'Эдди Редмэйн',
    'Фелисити Джонс', 'Джейми Фокс', 'Кристоф Вальц',
]

# Английские имена для тех, кого не нашлось по-русски
EN_NAMES = {
    'Карен Аллен': 'Karen Allen',
    'Вера Фармига': 'Vera Farmiga',
    'Патрик Уилсон': 'Patrick Wilson',
    'Рэйчел Макадамс': 'Rachel McAdams',
    'Роберт Дауни мл.': 'Robert Downey Jr.',
    'Джуд Лоу': 'Jude Law',
    'Рассел Кроу': 'Russell Crowe',
    'Хоакин Феникс': 'Joaquin Phoenix',
    'Том Хэнкс': 'Tom Hanks',
    'Мэтт Деймон': 'Matt Damon',
    'Маколей Калкин': 'Macaulay Culkin',
    'Джо Пеши': 'Joe Pesci',
    'Тони Револори': 'Tony Revolori',
}


def wiki_request(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())


def find_thumbnail(name):
    for lang in ['ru', 'en']:
        try:
            data = wiki_request(f'https://{lang}.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(name)}')
            thumb = data.get('thumbnail')
            if thumb:
                return thumb['source']
        except:
            pass
    # Поиск по английской вики
    try:
        q = urllib.parse.quote(name)
        search = wiki_request(f'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={q}&format=json&srlimit=3')
        for page in search.get('query', {}).get('search', []):
            title = urllib.parse.quote(page['title'])
            data = wiki_request(f'https://en.wikipedia.org/api/rest_v1/page/summary/{title}')
            thumb = data.get('thumbnail')
            if thumb:
                return thumb['source']
    except:
        pass
    return None


def download_image(url, path):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Referer': 'https://en.wikipedia.org/'})
    with urllib.request.urlopen(req, timeout=15) as r:
        with open(path, 'wb') as f:
            f.write(r.read())


for name in ACTORS:
    safe = name.replace("'", '').replace(' ', '_').lower()
    filepath = os.path.join(OUT, f'{safe}.jpg')

    if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
        print(f'  ~ {name} — уже есть')
        continue

    print(f'  + {name}...', end=' ', flush=True)

    # Сначала пробуем кириллицу, потом английский вариант
    url = find_thumbnail(name)
    if not url and name in EN_NAMES:
        time.sleep(1)
        url = find_thumbnail(EN_NAMES[name])

    if not url:
        print('не найдено')
        continue

    try:
        download_image(url, filepath)
        size = os.path.getsize(filepath) / 1024
        print(f'✓ {size:.0f} KB')
    except Exception as e:
        print(f'ошибка: {e}')

    time.sleep(2)  # чтобы не получить 429

print(f'\nГотово! Фото в {OUT}')
