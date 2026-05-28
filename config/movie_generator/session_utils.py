import re

_GUEST_SESSION_RE = re.compile(r'^[\w-]{8,40}$')


def get_guest_session_key(request):
    """Ключ гостя из заголовка (React Native и др. без cookie)."""
    raw = request.META.get('HTTP_X_GUEST_SESSION', '')
    key = raw.strip()[:40]
    if key and _GUEST_SESSION_RE.fullmatch(key):
        return key
    return None


def get_session_key(request):
    """Текущий ключ сессии без создания новой Django-сессии."""
    guest = get_guest_session_key(request)
    if guest:
        return guest
    return request.session.session_key


def get_or_create_session_key(request):
    """Возвращает session_key; для веба создаёт cookie, для мобилки — из заголовка."""
    guest = get_guest_session_key(request)
    if guest:
        return guest
    if not request.session.session_key:
        request.session.create()
    request.session.modified = True
    return request.session.session_key
