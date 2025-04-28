import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

type VideoParams = {
  id: string;
  title: string;
  url: string;
};

export default function CoursePlayerPage() {
  const { id, title, url } = useLocalSearchParams<VideoParams>();
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVideoError = (error: string) => {
    console.error('视频播放错误:', error);
    console.error('视频URL:', url);
    setError(`视频播放失败: ${error}`);
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('播放状态错误:', status.error);
        handleVideoError(status.error);
      }
    } else {
      // 正常播放状态
      console.log('视频播放状态:', status.isPlaying ? '播放中' : '已暂停');
    }
  };

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
        <Ionicons name="arrow-back" size={24} color="#D38300" />
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