import Constants from 'expo-constants';

// 兼容 Expo Go（manifest）和 EAS Build / Dev Client（expoConfig）
const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra;

/**
 * Auth 后端地址（始终使用云端）
 */
export const getAuthBackendUrl = () => extra?.AUTH_BACKEND_URL;

/**
 * Book 后端地址（始终使用云端）
 */
export const getBookBackendUrl = () => extra?.BOOK_BACKEND_URL;

/**
 * Auth WebSocket 地址（始终使用云端）
 */
export const getAuthWsUrl = () => extra?.AUTH_BACKEND_WS;

/**
 * Book WebSocket 地址（始终使用云端）
 */
export const getBookWsUrl = () => extra?.BOOK_BACKEND_WS;

/**
 * 打印当前配置用于调试
 */
console.log('📦 EXTRA CONFIG LOADED:', extra);