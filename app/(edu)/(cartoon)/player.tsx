import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/Supabase';
import { v4 as uuidv4 } from 'uuid';

// 定义类型接口
interface CartoonType {
  id: number;
  title: string;
  video_url: string;
  cover_url?: string;
  favorite?: boolean;
  category_id: number;
  recent_played_at?: string;
  created_at?: string;
}

interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  category: string;
}

export default function CartoonPlayerPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const videoRef = useRef(null);
  const [cartoon, setCartoon] = useState<CartoonType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartoon = async () => {
      const { data, error } = await supabase
        .from('cartoon')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setCartoon(data);
      
        // 更新最近播放时间
        const { error: updateError } = await supabase
          .from('cartoon')
          .update({ recent_played_at: new Date().toISOString() })
          .eq('id', id);
      
        if (updateError) {
          console.error('❌ recent_played_at 更新失败:', updateError.message);
        } else {
          console.log('✅ recent_played_at 更新成功');
          
          // 获取当前用户
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // 记录用户观看动画
            recordUserWatched(user.id, id as string);
          }
        }
      }
 
      setLoading(false);
    };

    if (id) fetchCartoon();
  }, [id]);

  // 记录用户观看的动画并更新成就
  const recordUserWatched = async (userId: string, cartoonId: string | number) => {
    try {
      // 先检查该观看记录是否已存在
      const { data: existingRecord, error: checkError } = await supabase
        .from('user_watched_cartoons')
        .select('*')
        .eq('user_id', userId)
        .eq('cartoon_id', cartoonId)
        .maybeSingle();
      
      if (checkError) {
        console.error('❌ 检查观看记录失败:', checkError.message);
        return;
      }
      
      let watchError = null;
      
      // 如果记录已存在，则更新observed_at时间
      if (existingRecord) {
        const { error } = await supabase
          .from('user_watched_cartoons')
          .update({
            watched_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('cartoon_id', cartoonId);
        
        watchError = error;
      } else {
        // 如果记录不存在，则创建新记录
        const { error } = await supabase
          .from('user_watched_cartoons')
          .insert({
            user_id: userId,
            cartoon_id: cartoonId,
            watched_at: new Date().toISOString()
          });
        
        watchError = error;
      }
      
      if (watchError) {
        console.error('❌ 记录用户观看失败:', watchError.message);
        return;
      }
      
      console.log('✅ 记录用户观看成功');
      
      // 更新动画成就
      updateCartoonAchievements(userId);
    } catch (error) {
      console.error('记录观看历史出错:', error);
    }
  };

  // 更新动画相关成就
  const updateCartoonAchievements = async (userId: string) => {
    try {
      // 1. 获取用户观看的动画总数
      const { data: watchedData, error: watchedError } = await supabase
        .from('user_watched_cartoons')
        .select('cartoon_id')
        .eq('user_id', userId);
        
      if (watchedError) {
        console.error('❌ 获取用户观看历史失败:', watchedError.message);
        return;
      }
      
      // 去重计算观看的不同动画数量
      const watchedCartoonIds = watchedData.map(item => item.cartoon_id);
      const uniqueWatchedCount = new Set(watchedCartoonIds).size;
      
      console.log(`👀 用户已观看${uniqueWatchedCount}部不同的动画`);
      
      // 2. 获取所有卡通类型的成就
      const { data: badges, error: badgeError } = await supabase
        .from('badges')
        .select('*')
        .eq('category', 'cartoon');
        
      if (badgeError) {
        console.error('❌ 获取成就列表失败:', badgeError.message);
        return;
      }

      // 新解锁的徽章列表
      const newUnlockedBadges: string[] = [];
      
      // 3. 更新每个成就的进度
      for (const badge of badges as BadgeType[]) {
        // 解析徽章描述中的数字要求
        let requirement = 1; // 默认值
        const description = badge.description || '';
        const match = description.match(/观看(\d+)部/);
        
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
      console.error('更新动画成就时出错:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}><Text>Loading...</Text></View>
    );
  }

  if (!cartoon) {
    return (
      <View style={styles.center}><Text>Cartoon not found</Text></View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#D38300" />
      </TouchableOpacity>
      <Text style={styles.title}>{cartoon.title}</Text>
      <Video
        ref={videoRef}
        source={{ uri: cartoon.video_url }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
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
  }
});

