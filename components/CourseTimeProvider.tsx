import { useEffect } from 'react';
import { supabase } from '@/utils/Supabase';

interface CourseTimeProviderProps {
  children: React.ReactNode;
}

export function CourseTimeProvider({ children }: CourseTimeProviderProps) {
  useEffect(() => {
    let userId: string | null = null;
    const start = Date.now();

    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('❌ 获取用户失败:', error.message);
      }
      if (user) userId = user.id;
    };

    fetchUser();

    return () => {
      const duration = Math.floor((Date.now() - start) / 1000);
      if (duration > 0 && userId) {
        console.log('📤 离开 course 模块，准备上传:', { userId, category: 'course', duration });

        supabase.from('study_log')
          .insert({
            user_id: userId,
            category: 'course',
            duration_sec: duration,
          })
          .then(({ error }) => {
            if (error) {
              console.error('❌ 上传失败:', error.message);
            } else {
              console.log('✅ 总时长上传成功');
            }
          });
      }
    };
  }, []);

  return <>{children}</>;
}