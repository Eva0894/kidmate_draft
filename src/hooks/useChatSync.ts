import { useEffect, useRef } from 'react';
import { syncToSupabase } from './services/syncService';
import { useSQLiteContext } from '../../components/SQLiteContext';
import { supabase } from '@/utils/Supabase';

const SYNC_INTERVAL = 1000 * 30; // 每 30 秒自动同步

export const useChatSync = () => {
  const db = useSQLiteContext();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startSync = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session || !db) return;

      await syncToSupabase(db, session.user.id);
    };

    // 启动时同步一次
    if (db) startSync();

    // 定时同步
    if (!intervalRef.current && db) {
      intervalRef.current = setInterval(() => {
        startSync();
      }, SYNC_INTERVAL);
    }

    // 清理定时器
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [db]);
};
