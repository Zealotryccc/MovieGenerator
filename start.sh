source venv/bin/activate

# Создаем символическую ссылку на приложение
ln -s /root/MovieGenerator/config/movie_generator /root/MovieGenerator/movie_generator

# Теперь запускаем Gunicorn
gunicorn --bind 0.0.0.0:8002 config.config.wsgi:application
