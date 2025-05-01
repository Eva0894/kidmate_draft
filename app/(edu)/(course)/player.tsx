import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/Supabase';
import { v4 as uuidv4 } from 'uuid';

type VideoParams = {
  id: string;
  title: string;
  url: string;
};

// Badge数据类型定义
interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  category: string;
}

export default function CoursePlayerPage() {
  const { id, title, url } = useLocalSearchParams<VideoParams>();
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVideoError = (error: string) => {
    console.error('视频播放错误:', error);
    setError('视频播放失败，请稍后重试');
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        handleVideoError(status.error);
      }
    }
  };

  // 更新课程成就
  const updateCourseAchievements = async (userId: string) => {
    try {
      // 1. 获取用户观看的课程总数
      const { data: watchedData, error: watchedError } = await supabase
        .from('user_watched_courses')
        .select('course_id')
        .eq('user_id', userId);
        
      if (watchedError) {
        console.error('❌ 获取用户观看课程历史失败:', watchedError.message);
        return;
      }
      
      // 去重计算观看的不同课程数量
      const watchedCourseIds = watchedData.map(item => item.course_id);
      const uniqueWatchedCount = new Set(watchedCourseIds).size;
      
      console.log(`👀 用户已观看${uniqueWatchedCount}门不同的课程`);
      
      // 2. 获取所有课程类型的成就
      const { data: badges, error: badgeError } = await supabase
        .from('badges')
        .select('*')
        .eq('category', 'course');
        
      if (badgeError) {
        console.error('❌ 获取课程成就列表失败:', badgeError.message);
        return;
      }

      // 新解锁的徽章列表
      const newUnlockedBadges: string[] = [];
      
      // 3. 更新每个成就的进度
      for (const badge of badges as BadgeType[]) {
        // 解析徽章描述中的数字要求
        let requirement = 1; // 默认值
        const description = badge.description || '';
        const match = description.match(/Complete (\d+) courses/);
        
        if (match && match[1]) {
          requirement = parseInt(match[1]);
        }
        
        // 计算进度百分比 (上限100%)
        const progress = Math.min(Math.floor((uniqueWatchedCount / requirement) * 100), 100);
        const isEarned = progress >= 100;
        
        // 检查用户是否已有该徽章记录
        const { data: userBadge, error: userBadgeError } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', userId)
          .eq('badge_id', badge.id)
          .maybeSingle();
        
        // 如果查询出错(非未找到的错误)，则跳过此徽章
        if (userBadgeError && userBadgeError.code !== 'PGRST116') {
          console.error(`❌ 查询用户徽章失败 (${badge.name}):`, userBadgeError.message);
          continue;
        }
        
        // 如果徽章已获得，则跳过
        if (userBadge && userBadge.awarded_at !== null) {
          continue;
        }
        
        let badgeUpdateError = null;
        
        // 根据是否已有记录决定更新还是插入
        if (userBadge) {
          // 更新现有记录
          const { error } = await supabase
            .from('user_badges')
            .update({
              progress: progress,
              awarded_at: isEarned ? new Date().toISOString() : null
            })
            .eq('id', userBadge.id);
          
          badgeUpdateError = error;
        } else {
          // 插入新记录
          const { error } = await supabase
            .from('user_badges')
            .insert({
              id: uuidv4(),
              user_id: userId,
              badge_id: badge.id,
              progress: progress,
              awarded_at: isEarned ? new Date().toISOString() : null
            });
          
          badgeUpdateError = error;
        }
          
        if (badgeUpdateError) {
          console.error(`❌ 更新徽章进度失败 (${badge.name}):`, badgeUpdateError.message);
        } else {
          console.log(`✅ 徽章 "${badge.name}" 进度更新为 ${progress}%`);
          
          // 如果是新解锁的徽章，添加到列表
          if (isEarned && (!userBadge || userBadge.awarded_at === null)) {
            newUnlockedBadges.push(badge.name);
          }
        }
      }
      
      // 如果有新解锁的徽章，显示通知
      if (newUnlockedBadges.length > 0) {
        const badgeNames = newUnlockedBadges.join('、');
        Alert.alert(
          '🎉 恭喜解锁新成就！',
          `你已解锁以下成就：${badgeNames}`,
          [{ text: '好的', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('更新课程成就时出错:', error);
    }
  };

  // 记录用户观看课程并更新最近播放时间
  useEffect(() => {
    const recordWatchCourse = async () => {
      if (!id) return;
      
      try {
        // 获取当前用户
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error('用户未登录');
          return;
        }
        
        // 1. 更新课程最近播放时间
        const { error: updateError } = await supabase
          .from('courses')
          .update({ recent_played_at: new Date().toISOString() })
          .eq('id', id);

        if (updateError) {
          console.error('❌ 更新 recent_played_at 失败:', updateError.message);
        } else {
          console.log('✅ 成功更新 recent_played_at');
        }
        
        // 2. 记录用户观看记录 (使用唯一约束防止重复)
        const { error: watchError } = await supabase
          .from('user_watched_courses')
          .upsert({
            id: uuidv4(),
            user_id: user.id,
            course_id: id,
            watched_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,course_id',
            ignoreDuplicates: false // 更新已存在的记录
          });
          
        if (watchError) {
          console.error('❌ 记录观看历史失败:', watchError.message);
        } else {
          console.log('✅ 成功记录用户观看历史');
          
          // 3. 更新课程相关成就
          await updateCourseAchievements(user.id);
        }
      } catch (error) {
        console.error('记录课程观看失败:', error);
      }
    };

    recordWatchCourse();
  }, [id]);

  if (!url) {
    return (
      <View style={styles.center}>
        <Text>视频未找到</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setError(null)}
        >
          <Text style={styles.retryText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#E5911B" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <Video
        ref={videoRef}
        source={{ uri: url }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        onError={handleVideoError}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
  },
  video: {
    width: '90%',
    height: 220,
    borderRadius: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  errorText: {
    color: '#ff0000',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#D38300',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});