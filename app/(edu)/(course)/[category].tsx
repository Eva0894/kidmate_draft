import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/utils/Supabase';

const categories = [
  'language',
  'math',
  'science',
  'art',
  'sport',
  'emotion',
];

type Video = {
  id: number;
  title: string;
  video_url: string;
};

export default function CourseCategoryScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [selected, setSelected] = useState(category?.toString().toLowerCase() || 'language');
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      console.log('🔄 开始获取视频数据，类别:', selected);
      setVideos([]); // 先清空数据，显示加载状态
      
      try {
        // 检查Supabase连接
        if (!supabase) {
          console.error('❌ Supabase客户端未初始化');
          return;
        }

        const { data, error } = await supabase
          .from('courses')
          .select('id, title, video_url')
          .eq('category', selected.toLowerCase())
          .order('created_at', { ascending: false });

        console.log('📥 获取到的数据:', JSON.stringify(data, null, 2));
        
        if (error) {
          console.error(`❌ 获取${selected}类别的视频失败:`, error.message, error.details);
          setVideos([]);
          return;
        }

        if (data && data.length > 0) {
          console.log(`✅ 成功获取${selected}类别的${data.length}个视频`);
          // 检查视频URL格式
          const validVideos = data.filter(video => {
            const isValid = video.video_url && typeof video.video_url === 'string' && video.video_url.trim() !== '';
            if (!isValid) {
              console.warn(`⚠️ 视频ID ${video.id} URL格式无效:`, video.video_url);
            }
            return isValid;
          });
          console.log(`✅ 有效视频数量: ${validVideos.length}/${data.length}`);
          setVideos(validVideos as Video[]);
        } else {
          console.log(`ℹ️ ${selected}类别没有视频数据`);
          setVideos([]);
        }
      } catch (err) {
        console.error('❌ 获取视频时发生错误:', err);
        setVideos([]);
      }
    };

    fetchVideos();
  }, [selected]); // 确保selected变化时触发重新获取

  return (
    <View style={styles.container}>
      {/* 页头 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={32} color="#E5911B" />
        </TouchableOpacity>
        <Text style={styles.title}>课程</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 侧边栏 + 内容 */}
      <View style={styles.row}>
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, selected === cat && styles.selectedBtn]}
                onPress={() => setSelected(cat)}
              >
                <Text style={[styles.categoryText, selected === cat && styles.selectedText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 视频列表 */}
        <View style={styles.contentArea}>
          <ScrollView>
            {videos.length === 0 ? (
              <Text style={{ color: '#aaa' }}>没有找到视频。</Text>
            ) : (
              videos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  style={styles.videoItem}
                  onPress={() => {
                    // 使用WebView打开视频URL
                    router.push({
                      pathname: '/(edu)/(course)/player',
                      params: { 
                        id: video.id.toString(),
                        title: video.title,
                        url: video.video_url 
                      }
                    });
                  }}
                >
                  <View style={styles.videoInfo}>
                    <Image 
                      source={require('../../../assets/images/art.png')}
                      style={styles.thumbnail}
                    />
                    <View style={styles.videoText}>
                      <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                      <View style={styles.playButton}>
                        <Ionicons name="play-circle" size={24} color="#D38300" />
                        <Text style={styles.playText}>播放</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D38300',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 100,
    backgroundColor: '#E5E5E5',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingVertical: 16,
  },
  categoryBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  selectedBtn: {
    backgroundColor: '#fff',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#c47a00',
  },
  selectedText: {
    fontWeight: 'bold',
    color: '#D38300',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    marginLeft: -8,
    padding: 16,
  },
  videoItem: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  videoInfo: {
    flexDirection: 'row',
    padding: 12,
  },
  thumbnail: {
    width: 120,
    height: 80,
    borderRadius: 6,
  },
  videoText: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  playText: {
    marginLeft: 4,
    color: '#D38300',
    fontWeight: '500',
  },
});