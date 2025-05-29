// hooks/useUsage.ts
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/utils/Supabase';
import { Alert } from 'react-native';

export const API = 'http://13.236.67.206:8000/api/parental-control';


export function useUsage() {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const hasWarnedRef = useRef(false); // ✅ 用于“只提醒一次”

  useEffect(() => {
    let userId: string | null = null;

    async function init() {
      // 1) 获取用户 ID
      const { data: { user }, error: uErr } = await supabase.auth.getUser();
      if (uErr || !user?.id) return;
      userId = user.id;

      // 2) 每天首次使用启动 session
      await fetch(`${API}/start-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      // 3) 拉一次初始状态
      await tick();

      // 4) 启动每分钟轮询
      timerRef.current = setInterval(tick, 60_000);
    }

    async function tick() {
      if (!userId) return;

      // 4.1) 累加 60 秒使用时长
      await fetch(`${API}/update-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, additional_seconds: 60 }),
      });

      // 4.2) 查询剩余时间
      const res = await fetch(`${API}/users/${userId}/usage-status`);
      if (!res.ok) return;
      const { remaining_seconds } = await res.json();

      // 4.3) 提醒剩余时间不足 5 分钟（只提醒一次）
      if (
        remaining_seconds !== null &&
        remaining_seconds > 0 &&
        remaining_seconds <= 300 &&
        !hasWarnedRef.current
      ) {
        hasWarnedRef.current = true;
        Alert.alert(
          'Time Reminder',
          "You're almost out of time! Please finish up soon, or ask your parent if you need more time.",
          [{ text: 'Okay!', style: 'default' }]
        );
      }

      // 4.4) 如果用完了且未解锁，跳转锁屏页
      const unlocked = await AsyncStorage.getItem('appUnlocked');
      if (remaining_seconds !== null && remaining_seconds <= 0 && unlocked !== 'true') {
        if (!pathname.includes('locked')) {
          router.replace('/(parent)/locked');
        }
      }
    }

    init();
    return () => clearInterval(timerRef.current);
  }, [router, pathname]);
}
