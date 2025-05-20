import { getAuthBackendUrl } from './apiConfig';

/**
 * 通用 GET 请求
 */
export const get = async (path: string, baseUrl: string = getAuthBackendUrl()) => {
  const finalUrl = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  console.log('🔵 GET 请求地址:', finalUrl);
  try {
    const res = await fetch(finalUrl);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GET ${res.status}: ${text}`);
    }
    return await res.json();
  } catch (err) {
    console.error('❌ GET 请求失败:', err);
    throw err;
  }
};

/**
 * 通用 POST 请求
 */
export const post = async (path: string, data: any, baseUrl: string = getAuthBackendUrl()) => {
  const finalUrl = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  console.log('🟢 POST 请求地址:', finalUrl);
  console.log('📦 请求数据:', data);

  try {
    const res = await fetch(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`POST ${res.status}: ${text}`);
    }
    return await res.json();
  } catch (err) {
    console.error('❌ POST 请求失败:', err);
    throw err;
  }
};