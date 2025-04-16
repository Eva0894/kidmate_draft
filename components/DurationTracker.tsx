import { useEffect } from 'react';
import { supabase } from '@/utils/Supabase';

interface DurationTrackerProps {
  category: string;
}

export default function DurationTracker({ category }: DurationTrackerProps) {
  useEffect(() => {
    let userId: string | null = null;
    const start = Date.now();

    const fetchUserAndTrack = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('❌ 获取用户失败:', error.message);
      }
      if (user) userId = user.id;
    };

    fetchUserAndTrack();

    return () => {
      const duration = Math.floor((Date.now() - start) / 1000);
      if (duration > 0 && userId) {
        console.log('📤 DurationTracker 上传:', { userId, category, duration });

        supabase.from('study_log')
          .insert({
            user_id: userId,
            category,
            duration_sec: duration,
          })
          .then(({ error }) => {
            if (error) {
              console.error('❌ 记录上传失败:', error.message);
            } else {
              console.log('✅ 模块学习时间上传成功');
            }
          });
      }
    };
  }, [category]);

  return null;
}
