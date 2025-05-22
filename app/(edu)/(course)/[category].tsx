import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/utils/Supabase';

const categories = [
  'language',
  'math',
  'science',
  'chess',
  'social studies',
  
];

type Video = {
  id: number;
  title: string;
  video_url: string;
  cover_url: string;
  favorite: boolean;
};

export default function CourseCategoryScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [selected, setSelected] = useState(category?.toString().toLowerCase() || 'language');
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);

  useEffect(() => {
    
    const fetchVideos = async () => {
      console.log('🔄 开始获取视频数据，类别:', selected);
      setVideos([]); // 先清空数据，显示加载状态
      
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, title, video_url,cover_url, favorite')
          .eq('category', selected.toLowerCase())
          .order('created_at', { ascending: false });

        console.log('📥 获取到的数据:', data);
        
        if (error) {
          console.error(`❌ 获取${selected}类别的视频失败:`, error.message);
          setVideos([]);
          return;
        }

        if (data && data.length > 0) {
          console.log(`✅ 成功获取${selected}类别的${data.length}个视频`);
          setVideos(data as Video[]);
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
//xinjia
  const toggleFavorite = async (id: number, currentFavorite: boolean) => {
    // 本地先切换
    setVideos(prev =>
      prev.map(video =>
        video.id === id ? { ...video, favorite: !currentFavorite } : video
      )
    );
  
    // 同步到数据库
    const { error } = await supabase
      .from('courses')
      .update({ favorite: !currentFavorite })
      .eq('id', id);
  
    if (error) {
      console.error('❌ 更新收藏失败:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>
        <Text style={styles.title}>课程</Text>
        <View style={{ width: 24 }} />
      </View>

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
            source={video.cover_url ? { uri: video.cover_url } : require('../../../assets/images/art.png')}
                      style={styles.thumbnail}
                    />
                    <View style={styles.videoText}>
                      <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                      <View style={styles.playButton}>
                        <Ionicons name="play-circle" size={24} color="#E5911B" />
                       
                         {/* ❤️ 收藏按钮 */}
    <TouchableOpacity onPress={() => toggleFavorite(video.id, video.favorite)}>
      <Ionicons
        name={video.favorite ? 'heart' : 'heart-outline'}
        size={24}
        color={video.favorite ? '#f44336' : '#aaa'}
      />
    </TouchableOpacity>
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
    paddingTop: 0,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5911B',
    marginBottom: 20,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5911B',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
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
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 12,
  },
  selectedBtn: {
    backgroundColor: '#fff',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  categoryText: {
    fontSize: 18,
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
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
    fontSize: 14,
    fontWeight: '500',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  playText: {
    marginLeft: 4,
    color: '#E5911B',
    fontWeight: '500',
  },
});
