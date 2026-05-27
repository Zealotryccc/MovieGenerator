# Как менять вид экранов

Файлы в `src/app/` — только точки входа (короткие).  
Внешний вид правьте в перечисленных ниже местах.

## Быстрая шпаргалка

| Что менять | Файл |
|------------|------|
| Все надписи (заголовки, кнопки) | `src/constants/ui-text.ts` |
| Цвета светлой/тёмной темы | `src/constants/theme.ts` → `Colors` |
| Главный экран — отступы, размеры | `src/styles/movies-screen.ts` |
| Карточка фильма в списке | `src/styles/movie-card.ts` |
| Избранное | `src/styles/favorites-screen.ts` |
| Обзор / статистика | `src/styles/explore-screen.ts` |
| Страница фильма | `src/styles/movie-detail-screen.ts` |
| Порядок блоков на экране | `src/screens/.../*-screen-view.tsx` |

## Экраны

### Фильмы (главная вкладка)

- Вход: `src/app/(tabs)/index.tsx`
- Вёрстка: `src/screens/movies/movies-screen-view.tsx`
- Стили: `src/styles/movies-screen.ts`
- API-логика: `src/hooks/use-movies-screen.ts`

### Избранное

- `src/app/(tabs)/favorites.tsx`
- `src/screens/favorites/favorites-screen-view.tsx`
- `src/styles/favorites-screen.ts`

### Обзор

- `src/app/(tabs)/explore.tsx`
- `src/screens/explore/explore-screen-view.tsx`
- `src/styles/explore-screen.ts`

### Один фильм

- `src/app/movie/[id].tsx`
- `src/screens/movie-detail/movie-detail-screen-view.tsx`
- `src/styles/movie-detail-screen.ts`

## Пример: увеличить заголовок на главной

Откройте `src/styles/movies-screen.ts`:

```ts
title: {
  fontSize: 40,  // было 32
  fontWeight: '700',
  marginBottom: Spacing.three,
},
```

## Пример: переименовать вкладку

Текст на экране: `ui-text.ts`.  
Подпись внизу (таб): `src/components/app-tabs.tsx` → `NativeTabs.Trigger.Label`.
