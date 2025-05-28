import 'dotenv/config';

export default {
  expo: {
    name: 'KidMate',
    slug: 'kidmate',
    scheme: 'kidmate',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    userInterfaceStyle: 'automatic',
    ios: {
      bundleIdentifier: 'com.anonymous.kidmate', 
    },

    extra: {
        AUTH_BACKEND_URL: process.env.AUTH_BACKEND_URL,
        // AUTH_BACKEND_WS: process.env.AUTH_BACKEND_WS,
        BOOK_BACKEND_URL: process.env.BOOK_BACKEND_URL,
        BOOK_BACKEND_WS: process.env.BOOK_BACKEND_WS,
        AUTH_BACKEND_URL_ANDROID: process.env.AUTH_BACKEND_URL_ANDROID,
        BOOK_BACKEND_URL_ANDROID: process.env.BOOK_BACKEND_URL_ANDROID,
    },
  },
};