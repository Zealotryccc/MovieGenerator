import { Platform } from 'react-native';

function defaultApiHost() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/movie_generator';
  }
  return 'http://127.0.0.1:8000/movie_generator';
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? defaultApiHost();
