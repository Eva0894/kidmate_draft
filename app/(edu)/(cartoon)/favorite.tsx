import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/Supabase';

export default function FavoritePage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from('cartoon')
        .select('id, title, cover_url')
        .eq('favorite', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setFavorites(data);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <View style={styles.container}>
      {/* 返回 + 标题 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
      </View>

      {/* 收藏列表 */}
      <ScrollView contentContainerStyle={styles.grid}>
        {favorites.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() =>
              router.push({
                pathname: '/(edu)/(cartoon)/player',
                params: { id: item.id.toString() },
              })
            }
          >
            <Image source={{ uri: item.cover_url }} style={styles.cover} />
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 30,
  },
  item: {
    width: '30%',
    alignItems: 'center',
  },
  cover: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
});