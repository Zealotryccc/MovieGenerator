import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const API_PORT = 8000;
const API_PATH = '/movie_generator';
// const API_HOST = '83.143.112.253';
const API_HOST = 'localhost';

function hostFromExpoDevServer(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;

  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(':')[0];
  if (!host || host === 'API_HOST') {
    return null;
  }
  return host;
}

function defaultApiHost(): string {
  if (Platform.OS === 'web') {
    return `http://${API_HOST}:${API_PORT}${API_PATH}`;
  }

  const lanHost = hostFromExpoDevServer();

  if (Platform.OS === 'android') {
    if (!Device.isDevice) {
      return `http://${API_HOST}:${API_PORT}${API_PATH}`;
    }
    if (lanHost) {
      return `http://${lanHost}:${API_PORT}${API_PATH}`;
    }
    return `http://${API_HOST}:${API_PORT}${API_PATH}`;
  }

  if (Platform.OS === 'ios') {
    if (lanHost) {
      return `http://${lanHost}:${API_PORT}${API_PATH}`;
    }
    if (!Device.isDevice) {
      return `http://${API_HOST}:${API_PORT}${API_PATH}`;
    }
    return `http://${API_HOST}:${API_PORT}${API_PATH}`;
  }

  if (lanHost) {
    return `http://${lanHost}:${API_PORT}${API_PATH}`;
  }

  return `http://${API_HOST}:${API_PORT}${API_PATH}`;
}

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) {
    return fromEnv;
  }

  return defaultApiHost();
}

export const API_BASE_URL = resolveApiBaseUrl();

if (__DEV__) {
  console.log('[API] base URL:', API_BASE_URL);
}
