// utils/api.ts
import { Platform } from 'react-native';

// Dynamically obtain the backend address
export const getBackendUrl = () => {
  if (__DEV__) {
    // Development Environment
    if (Platform.OS === 'ios') {
      // return 'http://192.168.0.249:3000';
      return 'http://localhost:3000';
    } else {
      return 'http://10.0.2.2:3000';
    }
  } else {
    // Production Environment
    return 'https://your-production-api.com'; // Change to my domain name after going online
  }
};

export const BASE_URL = getBackendUrl();

/**
 * 封装POST请求
 * @param path 接口路径，比如 '/api/login'
 * @param data 请求体
 * @returns 返回JSON对象
 */
export const post = async (path: string, data: any) => {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
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