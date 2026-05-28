
export const uiText = {
  movies: {
    title: 'Фильмы',
    searchPlaceholder: 'Поиск по названию...',
    genreAll: 'Все',
    empty: 'Нет фильмов',
    loadError: 'Не удалось загрузить фильмы',
  },
  favorites: {
    title: 'Избранное',
    empty: 'Пока пусто. Добавьте фильм со страницы фильма.',
    loadError: 'Не удалось загрузить избранное',
  },
  explore: {
    title: 'Обзор',
    statsTitle: 'Статистика',
    popularTitle: 'Популярные',
    genresTitle: 'По жанрам',
    tagsTitle: 'Теги',
    loadError: 'Не удалось загрузить данные',
  },
  movieDetail: {
    favoriteAdd: 'В избранное',
    favoriteRemove: 'Убрать из избранного',
    reviewTitle: 'Оставить отзыв',
    reviewRatingLabel: 'Рейтинг',
    reviewPlaceholder: 'Текст отзыва',
    reviewSubmit: 'Отправить',
    reviewsTitle: 'Отзывы',
    loadError: 'Не удалось загрузить фильм',
  },
  common: {
    favoriteBadge: '★ в избранном',
    apiHint: 'Проверьте, что API запущен',
  },
} as const;
