import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { supabase } from '@/utils/Supabase';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const CATEGORY_MAP: Record<string, number> = {
  phonics: 1,
  number: 2,
  nursery: 3,
  rename: 4,
  fun: 5,
  soft: 6,
};

export default function SongCategoryPage() {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlaying, setCurrentPlaying] = useState<number | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const categoryId = CATEGORY_MAP[String(category).toLowerCase()];
    if (!categoryId) return;

    const fetchSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Failed to fetch songs:', error.message);
      } else {
        setSongs(data || []);
      }
      setLoading(false);
    };

    fetchSongs();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [category]);

  const playSong = async (url: string, id: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        if (currentPlaying === id) {
          setCurrentPlaying(null);
          return;
        }
      }

      const { sound } = await Audio.Sound.createAsync({ uri: url });
      soundRef.current = sound;
      await sound.playAsync();
      setCurrentPlaying(id);
      // ✅ 更新最近播放时间
    await supabase
    .from('songs')
    .update({ recent_played_at: new Date().toISOString() })
    .eq('id', id);
    } catch (e) {
      console.error('🎵 Failed to play song:', e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>
        <Ionicons name="headset" size={20} color="#D38300" style={{ marginLeft: 8 }} />
        <Text style={styles.headerText}>{String(category).toUpperCase()}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#D38300" />
      ) : songs.length === 0 ? (
        <Text style={styles.empty}>No songs found.</Text>
      ) : (
       

            
          songs.map((song, index) => (
            <View
              key={song.id}
             style={[styles.songItem, currentPlaying === song.id && styles.playingItem]}
            >
              {/* 左侧封面 */}
             <Image source={{ uri: song.cover_url }} style={styles.cover} />
          
              {/* 中间标题，点击跳转播放页 */}
           
              <TouchableOpacity
                style={styles.infoContainer}
               // onPress={() => router.push(`/(edu)/${song.id}`)}错的
               // onPress={() => router.push(`/(edu)/(song)/player?id=${song.id}`)}
             
               key={song.id}
               onPress={() =>
                 router.push({
                   pathname: '/(edu)/(song)/player',
                   params: {
                     id: song.id.toString(),           // 当前歌曲 id
                     index: index.toString(),          // 当前索引
                     songs: JSON.stringify(songs),     // ⛳️ 整个播放列表（注意要字符串化）
                   },
                 })
               }
              >
                
                

                
               <Text style={styles.titleText} numberOfLines={1}>
               {song.title}
               </Text>
              </TouchableOpacity>
          
              {/* ❤️ 收藏按钮 */}
              <TouchableOpacity
                style={styles.heartBtn}
                onPress={async () => {
                  const { error } = await supabase
                    .from('songs')
                    .update({ favorite: !song.favorite })
                    .eq('id', song.id);
          
                  if (!error) {
                    setSongs((prev) =>
                      prev.map((s) =>
                        s.id === song.id ? { ...s, favorite: !s.favorite } : s
                      )
                    );
                  }
                }}
              >
                <Ionicons
                  name={song.favorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={song.favorite ? '#e74c3c' : '#aaa'}
                />
              </TouchableOpacity>
          
              {/* ▶️ 播放按钮 */}
              <TouchableOpacity
                onPress={() => playSong(song.audio_url, song.id)}
                style={styles.playBtn}
              >
                <Ionicons
                  name={currentPlaying === song.id ? 'pause' : 'play'}
                  size={22}
                  color="#E5911B"
                />
              </TouchableOpacity>
            </View>
          ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heartBtn: {
    paddingHorizontal: 6,
  },
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D38300',
    marginLeft: 6,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  playingItem: {
    backgroundColor: '#FFF2DD',
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    color: '#E5911B',
    fontWeight: '500',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  playBtn: {
    paddingHorizontal: 8,
  },
  empty: {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    marginTop: 30,
  },
});



