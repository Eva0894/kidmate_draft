import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/Supabase';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('favorite', true)
        .order('recent_played_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching favorites:', error.message);
      } else {
        setFavorites(data || []);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Favorites</Text>
      </View>

      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>No favorite songs yet.</Text>
      ) : (
            favorites.map((song, index) => (
              <View key={song.id} style={styles.songItem}>
                {/* 左侧封面 */}
                <Image source={{ uri: song.cover_url }} style={styles.cover} />
            
                {/* 中间标题，点击跳转播放页 */}
                <TouchableOpacity
                  style={styles.infoContainer}
                  onPress={() =>
                    router.push({
                      pathname: '/(edu)/(song)/player',
                      params: {
                        id: song.id.toString(),
                        index: index.toString(),
                        songs: JSON.stringify(favorites),
                      },
                    })
                  }
                >
                  <Text style={styles.title} numberOfLines={1}>
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
                      setFavorites((prev) =>
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
                  onPress={() =>
                    router.push({
                      pathname: '/(edu)/(song)/player',
                      params: {
                        id: song.id.toString(),
                        index: index.toString(),
                        songs: JSON.stringify(favorites),
                      },
                    })
                  }
                  style={styles.playBtn}
                >
                  <Ionicons name="play" size={22} color="#E5911B" />
                </TouchableOpacity>
              </View>
            ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
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
  heartBtn: {
    paddingHorizontal: 6,
  },
  playBtn: {
    paddingHorizontal: 8,
  },
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5911B',
    marginLeft: 8,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 10,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontStyle: 'italic',
  },
});
