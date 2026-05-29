import { API_BASE_URL } from './config';
import { getGuestSessionKey } from './guestSession';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE' | 'PATCH';
  body?: unknown;
  params?: Record<string, string | number | undefined | null>;
};

function buildUrl(path: string, params?: RequestOptions['params']) {
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  const base = API_BASE_URL.replace(/\/$/, '');
  const url = base.startsWith('http')
    ? new URL(`${base}/${normalized}`)
    : new URL(
        `${base}/${normalized}`,
        typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8081',
      );
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && 'results' in data) {
    const results = (data as { results: unknown }).results;
    if (Array.isArray(results)) {
      return results as T[];
    }
  }
  return [];
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options;
  const guestSession = await getGuestSessionKey();

  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers: {
        'X-Guest-Session': guestSession,
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'Network request failed';
    throw new ApiError(
      0,
      `Нет связи с сервером (${detail}). Проверьте, что API запущен: ${API_BASE_URL}`,
    );
  }

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(response.status, text || response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new ApiError(
      0,
      `Ожидался JSON, получен ${contentType || 'неизвестный тип'}. ${text.slice(0, 120)}`,
    );
  }

  return response.json() as Promise<T>;
}
