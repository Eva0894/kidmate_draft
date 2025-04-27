import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus, AVPlaybackStatusError, Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/Supabase';

// 定义卡通数据类型
interface CartoonData {
  id: number;
  title: string;
  video_url: string;
  cover_url?: string;
  favorite?: boolean;
  recent_played_at?: string;
}

export default function CartoonPlayerPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const videoRef = useRef<Video | null>(null);
  const [cartoon, setCartoon] = useState<CartoonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 配置iOS音频模式
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // 设置音频模式，允许在静音模式下播放
      Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
      }).catch(err => {
        console.error('设置音频模式失败:', err);
      });
    }
    
    return () => {
      // 组件卸载时停止视频播放
      if (videoRef.current) {
        videoRef.current.unloadAsync().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    const fetchCartoon = async () => {
      const { data, error } = await supabase
        .from('cartoon')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setCartoon(data as CartoonData);
      
        const { error: updateError } = await supabase
          .from('cartoon')
          .update({ recent_played_at: new Date().toISOString() })
          .eq('id', id);
      
        if (updateError) {
          console.error('❌ recent_played_at 更新失败:', updateError.message);
        } else {
          console.log('✅ recent_played_at 更新成功');
        }
      } else if (error) {
        console.error('获取视频数据失败:', error.message);
        setError('无法加载视频数据');
      }
      
      setLoading(false);
    };

    if (id) fetchCartoon();
  }, [id]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      // 视频加载成功，无需特殊处理
    } else {
      // 视频加载失败
      const errorStatus = status as AVPlaybackStatusError;
      if (errorStatus.error) {
        console.error('视频加载错误:', errorStatus.error);
        setError(`加载错误: ${errorStatus.error}`);
      }
    }
  };

  // Video组件的onError接收string类型的参数
  const handleVideoError = (errorMessage: string) => {
    console.error('视频播放发生错误:', errorMessage);
    setError('视频播放失败，请检查网络连接或稍后重试');
  };

  if (loading) {
    return (
      <View style={styles.center}><Text>Loading...</Text></View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>返回</Text>
        </TouchableOpacity>
      </View>
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
        source={{ 
          uri: cartoon.video_url,
          // iOS需要明确指定视频类型以帮助系统选择正确的解码器
          headers: Platform.OS === 'ios' ? {
            'Accept': 'video/mp4; charset=UTF-8'
          } : undefined
        }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        onError={handleVideoError}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        // 音频控制
        progressUpdateIntervalMillis={1000}
        isMuted={false}
        volume={1.0}
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
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  retryButton: {
    backgroundColor: '#D38300',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

