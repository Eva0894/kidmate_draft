/*
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { supabase } from '@/utils/Supabase';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';


export default function PlayerPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [song, setSong] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [duration, setDuration] = useState(0);     // 总时长（单位：秒）
  const [position, setPosition] = useState(0);     // 当前进度（单位：秒）

  useEffect(() => {
    const fetchSong = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Failed to fetch song:', error.message);
      } else {
        setSong(data);
      }
      setLoading(false);
    };

    fetchSong();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [id]);

  const togglePlayback = async () => {
    if (!song) return;

    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsPlaying(false);
      return;
    }

    const { sound } = await Audio.Sound.createAsync({ uri: song.audio_url });
    soundRef.current = sound;
     // ✅ 添加播放状态监听
     sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis / 1000);
          if (status.durationMillis != null) {
            setDuration(status.durationMillis / 1000);
          }
        }
      });
    await sound.playAsync();
    setIsPlaying(true);
  };
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  if (loading) {
    return (
      <View style={styles.container}><ActivityIndicator size="large" color="#D38300" /></View>
    );
  }

  if (!song) {
    return (
      <View style={styles.container}><Text>Song not found</Text></View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#D38300" />
      </TouchableOpacity>
      <Text style={styles.header}>🎧 PLAYER</Text>

      <Image source={{ uri: song.cover_url }} style={styles.cover} />
      <Text style={styles.title}>{song.title}</Text>
      <Text style={styles.time}>
  {formatTime(position)} / {formatTime(duration)}
</Text>
<Slider
  style={{ width: '100%', height: 40, marginBottom: 12 }}
  minimumValue={0}
  maximumValue={duration}
  value={position}
  minimumTrackTintColor="#D38300"
  maximumTrackTintColor="#ccc"
  thumbTintColor="#D38300"
  onSlidingComplete={async (value) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(value * 1000);
    }
  }}
/>

      <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={36}
          color="#fff"
        />
      </TouchableOpacity>
     


    </View>
  );
}

const styles = StyleSheet.create({
    
    time: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
      },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D38300',
    marginVertical: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  cover: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: '#D38300',
    padding: 20,
    borderRadius: 50,
  },
});
*/


/*
import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { supabase } from '@/utils/Supabase';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

export default function PlayerPage() {
  const { id, songs: songsParam, index } = useLocalSearchParams();
  const router = useRouter();

  const songs = songsParam ? JSON.parse(songsParam as string) : [];
  const currentIndex = index ? parseInt(index as string) : 0;

  const [song, setSong] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const fetchSong = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Failed to fetch song:', error.message);
      } else {
        setSong(data);
      }
      setLoading(false);
    };

    fetchSong();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [id]);

  const togglePlayback = async () => {
    if (!song) return;

    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsPlaying(false);
      return;
    }

    const { sound } = await Audio.Sound.createAsync({ uri: song.audio_url });
    soundRef.current = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setPosition(status.positionMillis / 1000);
        if (status.durationMillis != null) {
          setDuration(status.durationMillis / 1000);
        }
      }
    });

    await sound.playAsync();
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevSong = songs[currentIndex - 1];
      router.push({
        pathname: '/(edu)/(song)/player',
        params: {
          id: prevSong.id.toString(),
          songs: JSON.stringify(songs),
          index: String(currentIndex - 1)
        }
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < songs.length - 1) {
      const nextSong = songs[currentIndex + 1];
      router.push({
        pathname: '/(edu)/(song)/player',
        params: {
          id: nextSong.id.toString(),
          songs: JSON.stringify(songs),
          index: String(currentIndex + 1)
        }
      });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#D38300" /></View>;
  }

  if (!song) {
    return <View style={styles.container}><Text>Song not found</Text></View>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#D38300" />
      </TouchableOpacity>

      <Text style={styles.header}>🎧 PLAYER</Text>
      <Image source={{ uri: song.cover_url }} style={styles.cover} />
      <Text style={styles.title}>{song.title}</Text>
      <Text style={styles.time}>{formatTime(position)} / {formatTime(duration)}</Text>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        minimumTrackTintColor="#D38300"
        maximumTrackTintColor="#ddd"
        thumbTintColor="#D38300"
        onSlidingComplete={async (value: number) => {
          if (soundRef.current) {
            await soundRef.current.setPositionAsync(value * 1000);
          }
        }}
      />

      <View style={styles.controls}>
        <TouchableOpacity onPress={handlePrev}><Ionicons name="play-skip-back" size={28} color="#D38300" /></TouchableOpacity>
        <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext}><Ionicons name="play-skip-forward" size={28} color="#D38300" /></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D38300',
    marginVertical: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  cover: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  time: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  slider: {
    width: '90%',
    height: 40,
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '80%',
  },
  playButton: {
    backgroundColor: '#D38300',
    padding: 20,
    borderRadius: 50,
    marginHorizontal: 20,
  },
});
*/



// app/(edu)/(song)/player.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/Supabase';

export default function PlayerPage() {
  const { id, index, songs } = useLocalSearchParams();
  const router = useRouter();

  const parsedSongs = songs ? JSON.parse(songs as string) : [];
  const currentIndex = parseInt(index as string, 10);
  const song = parsedSongs[currentIndex];

  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isFavorite, setIsFavorite] = useState(song?.favorite || false);

  useEffect(() => {
    setIsFavorite(song?.favorite || false); // 每次切歌同步收藏状态

    const loadSong = async () => {
      if (!song?.audio_url) return;

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri: song.audio_url });
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis / 1000);
          if (status.durationMillis != null) {
            setDuration(status.durationMillis / 1000);
          }
        }
      });

      await sound.playAsync();
      setIsPlaying(true);
    };

    loadSong();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [id]);

  const handleSeek = async (value: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(value * 1000);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prev = parsedSongs[currentIndex - 1];
      router.replace({
        pathname: '/(edu)/(song)/player',
        params: {
          id: prev.id.toString(),
          index: (currentIndex - 1).toString(),
          songs: JSON.stringify(parsedSongs),
        },
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < parsedSongs.length - 1) {
      const next = parsedSongs[currentIndex + 1];
      router.replace({
        pathname: '/(edu)/(song)/player',
        params: {
          id: next.id.toString(),
          index: (currentIndex + 1).toString(),
          songs: JSON.stringify(parsedSongs),
        },
      });
    }
  };

  if (!song) {
    return (
      <View style={styles.container}>
        <Text>Song not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#E5911B" />
      </TouchableOpacity>
      <Text style={styles.header}>🎧 PLAYER</Text>

      <Image source={{ uri: song.cover_url }} style={styles.cover} />
      <Text style={styles.title}>{song.title}</Text>
      <Text style={styles.time}>{formatTime(position)} / {formatTime(duration)}</Text>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        minimumTrackTintColor="#D38300"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#D38300"
        onSlidingComplete={handleSeek}
      />

      <View style={styles.controls}>
        <TouchableOpacity onPress={handlePrev}>
          <Ionicons name="play-skip-back" size={28} color="#E5911B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={async () => {
            if (soundRef.current) {
              const status = await soundRef.current.getStatusAsync();
              if (status.isLoaded && status.isPlaying) {
                await soundRef.current.pauseAsync();
                setIsPlaying(false);
              } else {
                await soundRef.current.playAsync();
                setIsPlaying(true);
              }
            }
          }}
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext}>
          <Ionicons name="play-skip-forward" size={28} color="#E5911B" />
        </TouchableOpacity>

        {/* ❤️ 收藏按钮 */}
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={async () => {
            const { error } = await supabase
              .from('songs')
              .update({ favorite: !isFavorite })
              .eq('id', song.id);

            if (!error) {
              setIsFavorite(!isFavorite);
            }
          }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#f44336' : '#aaa'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5911B',
    marginVertical: 20,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  cover: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E5911B',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  time: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  slider: {
    width: '90%',
    marginBottom: 24,
  },
  controls: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#D38300',
    padding: 16,
    borderRadius: 50,
  },
  heartBtn: {
    paddingHorizontal: 6,
  },
});