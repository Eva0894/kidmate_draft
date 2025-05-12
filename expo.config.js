import 'dotenv/config';

export default {
  expo: {
    extra: {
        AUTH_BACKEND_URL: process.env.AUTH_BACKEND_URL,
        AUTH_BACKEND_WS: process.env.AUTH_BACKEND_WS,
        BACKEND_URL: process.env.BOOK_BACKEND_URL,
        BACKEND_WS: process.env.BOOK_BACKEND_WS,
    },
  },
};