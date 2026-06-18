import django, os, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from movie_generator.models import Movie, Genre, Country, Tag, Actor


def get_or_create_actor(name):
    actor, _ = Actor.objects.get_or_create(name=name)
    return actor


usa = Country.objects.get(id=1)
russia = Country.objects.get(id=2)
tags_map = {t.name: t for t in Tag.objects.all()}
genres_map = {g.name: g for g in Genre.objects.all()}


def create_movie(title, poster, description, director, release_date,
                 duration, age_rating, country, genre_names, tag_names=None,
                 actor_names=None):
    if tag_names is None:
        tag_names = []
    if actor_names is None:
        actor_names = []
    movie, created = Movie.objects.get_or_create(
        title=title,
        defaults=dict(
            poster=poster,
            description=description,
            director=director,
            release_date=release_date,
            duration=duration,
            age_rating=age_rating,
            country=country,
        ),
    )
    if not created:
        print(f'  = {title} (already exists)')
        return
    for gn in genre_names:
        if gn in genres_map:
            movie.genres.add(genres_map[gn])
    for tn in tag_names:
        if tn in tags_map:
            movie.tags.add(tags_map[tn])
    for an in actor_names:
        movie.actors.add(get_or_create_actor(an))
    print(f'  + {title}')


print('Seeding movies...')

# 1. Криминал — Криминальное чтиво (Pulp Fiction)
create_movie(
    title='Криминальное чтиво',
    poster='http://83.143.112.253:5000/file/Pulp_Fiction.jpg',
    description='Несколько переплетающихся криминальных историй в Лос-Анджелесе.',
    director='Квентин Тарантино',
    release_date='1994-10-14',
    duration=154, age_rating='18+', country=usa,
    genre_names=['Криминал', 'Драма'],
    tag_names=['криминальная драма'],
    actor_names=['Джон Траволта', 'Ума Турман', 'Сэмюэл Л. Джексон'],
)

# 2. Триллер — Остров проклятых
create_movie(
    title='Остров проклятых',
    poster='http://83.143.112.253:5000/file/Shutter_Island.jpg',
    description='Федеральные маршалы расследуют исчезновение пациентки в психиатрической больнице.',
    director='Мартин Скорсезе',
    release_date='2010-02-19',
    duration=138, age_rating='18+', country=usa,
    genre_names=['Триллер', 'Детектив'],
    tag_names=['психологический триллер'],
    actor_names=['Леонардо ДиКаприо', 'Марк Руффало'],
)

# 3. Комедия — Великий отель «Будапешт»
create_movie(
    title='Великий отель «Будапешт»',
    poster='http://83.143.112.253:5000/file/500px-The_Grand_Budapest_Hotel.jpg',
    description='Приключения консьержа и его юного протеже в знаменитом европейском отеле.',
    director='Уэс Андерсон',
    release_date='2014-03-28',
    duration=100, age_rating='16+', country=usa,
    genre_names=['Комедия', 'Приключения'],
    tag_names=['комедия'],
    actor_names=['Рэйф Файнс', 'Тони Револори'],
)

# 4. Приключения — Индиана Джонс: В поисках утраченного ковчега
create_movie(
    title='Индиана Джонс: В поисках утраченного ковчега',
    poster='http://83.143.112.253:5000/file/Indiana-jones-raiders-of-lost-ark-poster.jpg',
    description='Археолог Индиана Джонс отправляется на поиски священного Ковчега Завета.',
    director='Стивен Спилберг',
    release_date='1981-06-12',
    duration=115, age_rating='16+', country=usa,
    genre_names=['Приключения', 'Боевик'],
    actor_names=['Харрисон Форд', 'Карен Аллен'],
)

# 5. Ужасы — Заклятие
create_movie(
    title='Заклятие',
    poster='http://83.143.112.253:5000/file/zaklyatie.jpg',
    description='Исследователи паранормального помогают семье, столкнувшейся с злым духом.',
    director='Джеймс Ван',
    release_date='2013-07-19',
    duration=112, age_rating='18+', country=usa,
    genre_names=['Ужасы'],
    tag_names=[],
    actor_names=['Вера Фармига', 'Патрик Уилсон'],
)

# 6. Мелодрама — Дневник памяти
create_movie(
    title='Дневник памяти',
    poster='http://83.143.112.253:5000/file/1611097-1594276.jpg',
    description='История любви молодого рабочего и девушки из высшего общества.',
    director='Ник Кассаветис',
    release_date='2004-06-25',
    duration=123, age_rating='16+', country=usa,
    genre_names=['Мелодрама', 'Драма'],
    tag_names=['романтика', 'мелодрама'],
    actor_names=['Райан Гослинг', 'Рэйчел Макадамс'],
)

# 7. Детектив — Шерлок Холмс
create_movie(
    title='Шерлок Холмс',
    poster='http://83.143.112.253:5000/file/1627840-1610582.jpeg',
    description='Знаменитый детектив и его верный помощник раскрывают заговор в Лондоне.',
    director='Гай Ричи',
    release_date='2009-12-25',
    duration=128, age_rating='16+', country=usa,
    genre_names=['Детектив', 'Боевик'],
    tag_names=[],
    actor_names=['Роберт Дауни мл.', 'Джуд Лоу'],
)

# 8. Исторический — Гладиатор
create_movie(
    title='Гладиатор',
    poster='http://83.143.112.253:5000/file/gladiator.jpg',
    description='Римский полководец становится гладиатором, чтобы отомстить за смерть семьи.',
    director='Ридли Скотт',
    release_date='2000-05-05',
    duration=155, age_rating='18+', country=usa,
    genre_names=['Исторический', 'Боевик', 'Драма'],
    actor_names=['Рассел Кроу', 'Хоакин Феникс'],
)

# 9. Анимация — Унесённые призраками
create_movie(
    title='Унесённые призраками',
    poster='http://83.143.112.253:5000/file/h280_51757203.jpg',
    description='Девочка попадает в мир духов и должна спасти своих родителей.',
    director='Хаяо Миядзаки',
    release_date='2001-07-20',
    duration=125, age_rating='12+', country=usa,
    genre_names=['Анимация', 'Фэнтези', 'Приключения'],
    actor_names=[],
)

# 10. Военный — Спасти рядового Райана
create_movie(
    title='Спасти рядового Райана',
    poster='http://83.143.112.253:5000/file/rayan.jpg',
    description='Отряд отправляется в тыл врага, чтобы спасти единственного выжившего брата.',
    director='Стивен Спилберг',
    release_date='1998-07-24',
    duration=169, age_rating='18+', country=usa,
    genre_names=['Военный', 'Драма'],
    actor_names=['Том Хэнкс', 'Мэтт Деймон'],
)

# 11. Семейный — Один дома
create_movie(
    title='Один дома',
    poster='http://83.143.112.253:5000/file/Home_Alone_dvd_rus.jpg',
    description='Мальчик остаётся один дома и защищает его от незадачливых грабителей.',
    director='Крис Коламбус',
    release_date='1990-11-16',
    duration=103, age_rating='12+', country=usa,
    genre_names=['Семейный', 'Комедия'],
    tag_names=['комедия'],
    actor_names=['Маколей Калкин', 'Джо Пеши'],
)

# 12. Биография — Вселенная Стивена Хокинга
create_movie(
    title='Вселенная Стивена Хокинга',
    poster='http://83.143.112.253:5000/file/708772.jpg',
    description='История жизни гениального физика Стивена Хокинга и его любви.',
    director='Джеймс Марш',
    release_date='2014-11-07',
    duration=123, age_rating='16+', country=usa,
    genre_names=['Биография', 'Драма', 'Мелодрама'],
    actor_names=['Эдди Редмэйн', 'Фелисити Джонс'],
)

# 13. Вестерн — Джанго освобождённый
create_movie(
    title='Джанго освобождённый',
    poster='http://83.143.112.253:5000/file/15966-1000x830.jpg',
    description='Охотник за головами освобождает раба и помогает ему спасти жену.',
    director='Квентин Тарантино',
    release_date='2012-12-25',
    duration=165, age_rating='18+', country=usa,
    genre_names=['Вестерн', 'Криминал', 'Драма'],
    tag_names=['роуд-муви'],
    actor_names=['Джейми Фокс', 'Кристоф Вальц', 'Леонардо ДиКаприо'],
)

# 14. Документальный — Планета Земля
create_movie(
    title='Планета Земля',
    poster='http://83.143.112.253:5000/file/1611206-884305.jpg',
    description='Грандиозное документальное путешествие по самым удивительным уголкам планеты.',
    director='Аластер Фотергилл',
    release_date='2006-03-05',
    duration=550, age_rating='6+', country=usa,
    genre_names=['Документальный', 'Приключения'],
    tag_names=[],
    actor_names=[],
)

print('Done!')
# dawd  