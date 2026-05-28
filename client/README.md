# MovieGenerator — мобильный клиент (Expo)

## Запуск

1. **Бэкенд** (из папки `config`):

```bash
pip install -r ../req.txt
python manage.py runserver 0.0.0.0:8000
```

2. **Клиент**:

```bash
cd client
npm install
cp .env.example .env
npm start
```

## URL API

Скопируйте `.env.example` в `.env` и укажите `EXPO_PUBLIC_API_URL`:

| Среда | URL |
|-------|-----|
| iOS Simulator | `http://127.0.0.1:8000/movie_generator` |
| Android Emulator | `http://10.0.2.2:8000/movie_generator` |
| Телефон в Wi‑Fi | `http://IP_ВАШЕГО_ПК:8000/movie_generator` |

## Как менять дизайн

Теперь всё проще: меняйте экраны прямо в этих файлах:

- `src/app/(tabs)/index.tsx` — главная (фильмы)
- `src/app/(tabs)/favorites.tsx` — избранное
- `src/app/(tabs)/explore.tsx` — обзор
- `src/app/movie/[id].tsx` — подробная страница фильма

Тексты в одном месте: `src/constants/ui-text.ts`

## Экраны

- **Фильмы** — список, поиск, фильтр по жанру
- **Избранное** — сессия через cookie
- **Обзор** — статистика, популярные, теги
- **Карточка фильма** — детали, отзывы, избранное
