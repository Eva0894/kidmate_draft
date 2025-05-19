import 'dotenv/config';

export default {
  expo: {
    name: 'kidmate',
    slug: 'kidmate',
    version: '1.0.0',
    extra: {
      AUTH_BACKEND_URL: process.env.EXPO_PUBLIC_AUTH_BACKEND_URL,
      AUTH_BACKEND_URL_ANDROID: process.env.EXPO_PUBLIC_AUTH_BACKEND_URL_ANDROID,
      AUTH_BACKEND_WS: process.env.EXPO_PUBLIC_AUTH_BACKEND_WS,
      BOOK_BACKEND_URL: process.env.EXPO_PUBLIC_BOOK_BACKEND_URL,
      BOOK_BACKEND_URL_ANDROID: process.env.EXPO_PUBLIC_BOOK_BACKEND_URL_ANDROID,
      BOOK_BACKEND_WS: process.env.EXPO_PUBLIC_BOOK_BACKEND_WS,
    },
  },
};