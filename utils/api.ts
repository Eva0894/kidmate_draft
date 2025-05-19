// utils/api.js
import { getAuthBackendUrl } from '@/utils/api';

export const post = async (path: any, data: any, baseUrl: any) => {
  const resolvedBaseUrl = baseUrl || getAuthBackendUrl();
  const finalPath = path.startsWith('/') ? path : `/${path}`;
  const finalUrl = `${resolvedBaseUrl}${finalPath}`;
  console.log('🟢 实际请求地址:', finalUrl);
  console.log('📦 请求数据:', data);

  try {
    const res = await fetch(finalUrl, {
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

// 👇 这里暴露出 API 地址方法供页面使用
export { getAuthBackendUrl, getBookBackendUrl as getBackendUrl } from './apiConfig';