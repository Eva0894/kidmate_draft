import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  Linking
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/Supabase';
import { v4 as uuidv4 } from 'uuid';

const numColumns = 2;
const screenWidth = Dimensions.get('window').width;
const imageSize = (screenWidth - 36) / numColumns;

// Badge数据类型定义
interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  category: string;
}

export default function ViewSavedDrawings() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  // 更新绘画成就
  const updateDrawingAchievements = async (userId: string) => {
    try {
      // 1. 获取用户保存的绘画总数
      const { data: drawingsData, error: drawingsError } = await supabase
        .from('user_drawings')
        .select('id')
        .eq('user_id', userId);
        
      if (drawingsError) {
        console.error('❌ 获取用户绘画历史失败:', drawingsError.message);
        return;
      }
      
      // 计算用户绘画数量
      const drawingsCount = drawingsData ? drawingsData.length : 0;
      
      console.log(`👀 用户已保存${drawingsCount}幅绘画作品`);
      
      // 2. 获取所有绘画类型的成就
      const { data: badges, error: badgeError } = await supabase
        .from('badges')
        .select('*')
        .eq('category', 'drawing');
        
      if (badgeError) {
        console.error('❌ 获取绘画成就列表失败:', badgeError.message);
        return;
      }

      // 3. 更新每个成就的进度
      for (const badge of badges as BadgeType[]) {
        // 解析徽章描述中的数字要求
        let requirement = 1; // 默认值
        const description = badge.description || '';
        
        // 同时支持中文和英文描述格式
        let chineseMatch = description.match(/完成(\d+)幅/);
        let englishMatch = description.match(/Complete (\d+) drawing/i);
        
        if (chineseMatch && chineseMatch[1]) {
          requirement = parseInt(chineseMatch[1]);
        } else if (englishMatch && englishMatch[1]) {
          requirement = parseInt(englishMatch[1]);
        } else if (description.includes('first drawing') || description.includes('第一幅')) {
          requirement = 1;
        }
        
        // 计算进度百分比 (上限100%)
        const progress = Math.min(Math.floor((drawingsCount / requirement) * 100), 100);
        const isEarned = drawingsCount >= requirement;
        
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
        
        let badgeUpdateError = null;
        
        // 根据是否已有记录决定更新还是插入
        if (userBadge) {
          // 更新现有记录
          const { error } = await supabase
            .from('user_badges')
            .update({
              progress: progress,
              awarded_at: isEarned ? userBadge.awarded_at || new Date().toISOString() : null
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
          console.log(`✅ 徽章 "${badge.name}" 进度更新为 ${progress}%，要求：${requirement}幅，当前：${drawingsCount}幅`);
        }
      }
    } catch (error) {
      console.error('更新绘画成就时出错:', error);
    }
  };

  // 打开应用设置
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // 请求相册权限
  const requestMediaLibraryPermission = async () => {
    // 先检查当前权限状态
    const { status: currentStatus } = await MediaLibrary.getPermissionsAsync();
    
    if (currentStatus === 'granted') {
      return true;
    }
    
    // 如果之前未请求过权限，或为"undetermined"状态，尝试请求新权限
    if (currentStatus === 'undetermined') {
      const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
      return newStatus === 'granted';
    }
    
    // 如果权限被拒绝，显示提示引导用户去设置中开启
    Alert.alert(
      '需要相册权限',
      '查看绘画作品需要访问您的相册。请在设置中允许此应用访问您的相册。',
      [
        { text: '取消', style: 'cancel' },
        { text: '去设置', onPress: openSettings }
      ]
    );
    
    return false;
  };

  const loadDrawings = async () => {
    setLoading(true);
    
    try {
      // 请求相册权限
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        setLoading(false);
        return; // 如果没有权限，直接返回
      }

      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('登录失效', '请重新登录');
        setLoading(false);
        return;
      }

      const album = await MediaLibrary.getAlbumAsync('MyDrawings');
      if (!album) {
        setImages([]);
        setLoading(false);
        return;
      }

      const assets = await MediaLibrary.getAssetsAsync({
        album: album.id,
        mediaType: 'photo',
        first: 100,
        sortBy: [['creationTime', false]],
      });

      // 确保 Supabase 中的记录与实际相册匹配
      await syncDrawingsWithSupabase(user.id, assets.assets);

      setImages(assets.assets);
    } catch (err) {
      console.error('加载绘画失败:', err);
      Alert.alert('加载失败', '请重试');
    } finally {
      setLoading(false);
    }
  };

  // 同步相册中的绘画与Supabase记录
  const syncDrawingsWithSupabase = async (userId: string, galleryAssets: any[]) => {
    try {
      // 获取用户在Supabase中的所有绘画记录
      const { data: existingDrawings, error } = await supabase
        .from('user_drawings')
        .select('drawing_uri')
        .eq('user_id', userId);
      
      if (error) {
        console.error('获取绘画记录失败:', error.message);
        return;
      }

      // 将相册中的所有URI映射到一个集合
      const galleryUris = new Set(galleryAssets.map(asset => asset.uri));
      
      // 筛选出在Supabase中存在但相册中不存在的记录
      const drawingsToRemove = existingDrawings.filter(
        drawing => !galleryUris.has(drawing.drawing_uri)
      );
      
      // 从Supabase中删除这些记录
      if (drawingsToRemove.length > 0) {
        const urisToRemove = drawingsToRemove.map(d => d.drawing_uri);
        const { error: removeError } = await supabase
          .from('user_drawings')
          .delete()
          .in('drawing_uri', urisToRemove);
          
        if (removeError) {
          console.error('删除过期记录失败:', removeError.message);
        } else {
          console.log(`✅ 已从数据库中删除${drawingsToRemove.length}条不存在的绘画记录`);
        }
      }
      
      // 筛选出在相册中存在但Supabase中不存在的资源
      const existingUris = new Set(existingDrawings.map(d => d.drawing_uri));
      const assetsToAdd = galleryAssets.filter(asset => !existingUris.has(asset.uri));
      
      // 将这些资源添加到Supabase
      if (assetsToAdd.length > 0) {
        const recordsToInsert = assetsToAdd.map(asset => ({
          id: uuidv4(),
          user_id: userId,
          drawing_uri: asset.uri,
          created_at: new Date(asset.creationTime).toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('user_drawings')
          .insert(recordsToInsert);
          
        if (insertError) {
          console.error('添加新绘画记录失败:', insertError.message);
        } else {
          console.log(`✅ 已向数据库添加${assetsToAdd.length}条新绘画记录`);
        }
      }
      
      // 更新徽章进度
      await updateDrawingAchievements(userId);
    } catch (error) {
      console.error('同步绘画记录失败:', error);
    }
  };

  useEffect(() => {
    loadDrawings();
  }, []);

  const handleDelete = (item: any) => {
    Alert.alert('Delete Drawing', 'Are you sure you want to delete this drawing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // 从相册中删除
            await MediaLibrary.deleteAssetsAsync([item.id]);
            
            // 获取当前用户
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
              // 从Supabase中删除
              const { error } = await supabase
                .from('user_drawings')
                .delete()
                .eq('user_id', user.id)
                .eq('drawing_uri', item.uri);
                
              if (error) {
                console.error('❌ 删除绘画记录失败:', error.message);
              } else {
                console.log('✅ 成功删除绘画记录');
                
                // 更新徽章进度
                await updateDrawingAchievements(user.id);
              }
            }
            
            // 重新加载图片
            loadDrawings();
          } catch (error) {
            console.error('删除失败:', error);
            Alert.alert('删除失败', '请重试');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => setSelectedImage(item.uri)}
      onLongPress={() => handleDelete(item)}
      style={styles.imageWrapper}
    >
      <Image source={{ uri: item.uri }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Drawings</Text>
        <Text style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#e2ac30" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No Drawings Found</Text>}
        />
      )}

      <Modal visible={!!selectedImage} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedImage(null)}>
          <Image source={{ uri: selectedImage || '' }} style={styles.modalImage} />
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    marginTop: 50,
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    zIndex: 10,
    color: '#e2ac30',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e2ac30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    color: '#ffcc00',
    marginTop: 30,
    marginBottom: 20,
    fontWeight: '800',
    fontFamily: 'Cochin',
    textShadowColor: '#444',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  imageWrapper: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    borderWidth: 2,
    borderColor: '#e2ac30',
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: 16,
  },
});