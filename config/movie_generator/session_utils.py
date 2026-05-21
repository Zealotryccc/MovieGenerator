def get_or_create_session_key(request):
    """Возвращает session_key; создаёт сессию и cookie при первом запросе."""
    if not request.session.session_key:
        request.session.create()
    request.session.modified = True
    return request.session.session_key
