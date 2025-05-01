// utils/env.ts
import { Platform } from 'react-native';
import * as Network from 'expo-network';

let cachedUrl: string | null = null;

export const getBackendUrl = async (): Promise<string> => {
  if (cachedUrl) return cachedUrl;

  if (!__DEV__) {
    cachedUrl = 'https://your-production-api.com';
    return cachedUrl;
  }

  if (Platform.OS === 'android') {
    cachedUrl = 'http://10.0.2.2:3000';
    return cachedUrl;
  }

  const ip = await Network.getIpAddressAsync(); // ✅ 替代 getIPAddress
  cachedUrl = `http://${ip}:3000`;
  return cachedUrl;
};