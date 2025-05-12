import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * 登录/注册/验证码（Node.js 服务，3000 端口）
 */
export const getAuthBackendUrl = (): string => {
  if (__DEV__) {
    if (Platform.OS === 'ios') {
      return Constants.expoConfig?.extra?.AUTH_BACKEND_URL || 'http://localhost:3000';
    } else if (Platform.OS === 'android') {
      return Constants.expoConfig?.extra?.AUTH_BACKEND_URL_ANDROID || 'http://10.0.2.2:3000';
    }
  }
  return Constants.expoConfig?.extra?.AUTH_BACKEND_URL || 'http://localhost:3000';
};

/**
 * 图书/阅读相关（FastAPI 服务，8000 端口）
 */
export const getBackendUrl = (): string => {
  if (__DEV__) {
    if (Platform.OS === 'ios') {
      return Constants.expoConfig?.extra?.BOOK_BACKEND_URL || 'http://localhost:8000';
    } else if (Platform.OS === 'android') {
      return Constants.expoConfig?.extra?.BOOK_BACKEND_URL_ANDROID || 'http://10.0.2.2:8000';
    }
  }
  return Constants.expoConfig?.extra?.BOOK_BACKEND_URL || 'http://localhost:8000';
};

/**
 * WebSocket 地址获取（Node.js）
 */
export const getAuthWsUrl = (): string => {
  return Constants.expoConfig?.extra?.AUTH_BACKEND_WS || 'ws://localhost:3000';
};

/**
 * WebSocket 地址获取（FastAPI）
 */
export const getBookWsUrl = (): string => {
  return Constants.expoConfig?.extra?.BACKEND_WS || 'ws://localhost:8000';
};

/**
 * 通用 POST 请求封装（可用于登录）
 * @param path 接口路径，比如 '/api/login'
 * @param data 请求体
 * @param baseUrl 可选自定义 URL（默认用 Auth 后端）
 */
export const post = async (path: string, data: any, baseUrl: string = getAuthBackendUrl()) => {
  // print the request URL
  const finalPath = path.startsWith('/') ? path : `/${path}`;
  const finalUrl = `${baseUrl}${finalPath}`;
  console.log('🟢 实际请求地址:', finalUrl);
  console.log('📦 请求数据:', data);
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`❌ 后端返回错误：${res.status} ${text}`);
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const result = await res.json();
    console.log('✅ 返回结果:', result);
    return result;
  } catch (error) {
    console.error('❌ 请求失败:', error);
    throw error;
  }
};