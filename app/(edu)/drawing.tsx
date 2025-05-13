import React, { useRef } from 'react';
import { View, StyleSheet, Button, Text, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { supabase } from '@/utils/Supabase';
import { v4 as uuidv4 } from 'uuid';
import { Ionicons } from '@expo/vector-icons';

// Badge数据类型定义
interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  category: string;
}

const DrawingPage = () => {
  const ref = useRef<any>();
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

      // 新解锁的徽章列表
      const newUnlockedBadges: string[] = [];
      
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
          console.log(`✅ 徽章 "${badge.name}" 进度更新为 ${progress}%，要求：${requirement}幅，当前：${drawingsCount}幅`);
          
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
      '保存绘画需要访问您的相册。请在设置中允许此应用访问您的相册。',
      [
        { text: '取消', style: 'cancel' },
        { text: '去设置', onPress: openSettings }
      ]
    );
    
    return false;
  };

  const handleOK = async (signature: string) => {
    try {
      // 请求相册权限
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        return; // 如果没有权限，直接返回
      }

      const base64Data = signature.replace('data:image/png;base64,', '');
      const fileUri = FileSystem.cacheDirectory + 'drawing.png';

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const asset = await MediaLibrary.createAssetAsync(fileUri);
      const album = await MediaLibrary.getAlbumAsync('MyDrawings');

      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
      } else {
        await MediaLibrary.createAlbumAsync('MyDrawings', asset, false);
      }

      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 记录用户绘画
        const { error: drawingError } = await supabase
          .from('user_drawings')
          .insert({
            id: uuidv4(),
            user_id: user.id,
            drawing_uri: asset.uri,
            created_at: new Date().toISOString()
          });
          
        if (drawingError) {
          console.error('❌ 记录绘画失败:', drawingError.message);
        } else {
          console.log('✅ 成功记录用户绘画');
          
          // 更新绘画相关成就
          await updateDrawingAchievements(user.id);
        }
      }

      Alert.alert('✅ Saving Successfully', 'Your Work is Saved in Photos! (MyDrawings)');
    } catch (err) {
      console.error('Save Failed:', err);
      Alert.alert('❌ Save Failed', 'Please Try Again');
    }
  };

  const handleClear = () => {
    ref.current?.clearSignature();
  };

  const handleUndo = () => {
    ref.current?.undo();
  };

  return (
    <View style={{ flex: 1 }}>

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/eduPage')} style={styles.backButton}>
         <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.seeMyWorkButton}
            onPress={() => {
                console.log('jump to ViewDrawings');
                router.push('/viewdrawings')
              }}
        >
            <Text style={styles.seeMyWorkText}>🖼 See My Work</Text>
        </TouchableOpacity>
        </View>

        

      <SignatureScreen
        ref={ref}
        onOK={handleOK}
        autoClear={false}
        webStyle={style}
      />

<View style={styles.buttonContainer}>
  <TouchableOpacity style={styles.customButton} onPress={() => ref.current.readSignature()}>
    <Text style={styles.text}>Save</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.customButton} onPress={handleClear}>
    <Text style={styles.text}>Clear</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.customButton} onPress={handleUndo}>
    <Text style={styles.text}>Revoke</Text>
  </TouchableOpacity>
</View>
    </View>
  );
};

const style = `.m-signature-pad { box-shadow: none; border: none; }
  .m-signature-pad--body { border: 2px solid #e2ac30; }
  .m-signature-pad--footer { display: none; margin: 0px; }
  body,html { width: 100%; height: 100%; margin: 0; padding: 0; }`;

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),

  },
  viewButtonContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  text: {
    fontSize: 24,
    color: '#E5911B',
    fontWeight: 'bold',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
    marginTop: -40,
  },
  seeMyWorkButton: {
    padding: 8,
    marginBottom: 5,
  },
  seeMyWorkText: {
    fontSize: 18,
    color: '#E5911B',
    fontWeight: 'bold',
    fontFamily: Platform.select({
          ios: 'ChalkboardSE-Regular',
          android: 'casual',}),
  },
  customButton: {
  flexDirection: 'row',  // 横向排列
  justifyContent: 'space-between',  // 按钮之间留空间
  paddingHorizontal: 20,  // 整体左右留点间距
  marginTop: -10,
  paddingVertical: 50,
 },
});

export default DrawingPage;
