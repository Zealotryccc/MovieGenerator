import Constants from 'expo-constants';

let cachedKey: string | null = null;

function createGuestSessionKey(): string {
  const installId =
    Constants.installationId ??
    Constants.sessionId ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let key = `guest-${installId}`.replace(/[^a-zA-Z0-9_-]/g, '');
  if (key.length < 8) {
    key = `${key}00000000`.slice(0, 8);
  }
  return key.slice(0, 40);
}

/** Стабильный ключ гостя на устройстве (для заголовка X-Guest-Session). */
export async function getGuestSessionKey(): Promise<string> {
  if (!cachedKey) {
    cachedKey = createGuestSessionKey();
  }
  return cachedKey;
}
