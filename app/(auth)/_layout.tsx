// app/(auth)/_layout.tsx
import { Stack, useRouter, Slot } from 'expo-router';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';

export default function AuthLayout() {
  const router = useRouter();

  // ✅ Deep Link 监听，跳转到 reset-password 页面
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      const parsed = Linking.parse(url);
      console.log('📩 Deep Link URL:', url);
      console.log('🔍 Parsed:', parsed);

      if (parsed.path === 'reset-password') {
        router.replace('/reset-password'); 
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  return (
    <Stack
      screenOptions={{
        // headerShown: false, // 👈 隐藏顶部导航栏
      }}
    />
  );
}