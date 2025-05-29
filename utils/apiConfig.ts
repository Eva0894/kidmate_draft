// ✅ utils/apiConfig.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * 图书/阅读/AI后端（FastAPI 服务，13.236.67.206:8000）
 */
export const getBookBackendUrl = (): string => {
    // Always use the direct IP for preview and production builds on real devices
    return 'http://13.236.67.206:8000';
  };
/**
 * 登录/注册后端（Node.js 服务，Azure）
 */
export const getAuthBackendUrl = (): string => {
    if (__DEV__) {
      return Platform.OS === 'android'
        ? Constants.expoConfig?.extra?.AUTH_BACKEND_URL_ANDROID || 'https://kidmate-node-backend-gud7ftgdasbwfbf7.australiacentral-01.azurewebsites.net'
        : Constants.expoConfig?.extra?.AUTH_BACKEND_URL || 'https://kidmate-node-backend-gud7ftgdasbwfbf7.australiacentral-01.azurewebsites.net';
    }
    return Constants.expoConfig?.extra?.AUTH_BACKEND_URL || 'https://kidmate-node-backend-gud7ftgdasbwfbf7.australiacentral-01.azurewebsites.net';
  };

/** WebSocket 地址（FastAPI 服务） */
export const getBookWsUrl = (): string => {
    return 'ws://13.236.67.206:8000/ws/chat';
  };
  
  /** WebSocket 地址（Node.js 登录服务） */
//   export const getAuthWsUrl = (): string => {
//     return Constants.expoConfig?.extra?.AUTH_BACKEND_WS || 'wss://kidmate-node-backend-gud7ftgdasbwfbf7.australiacentral-01.azurewebsites.net';
//   };