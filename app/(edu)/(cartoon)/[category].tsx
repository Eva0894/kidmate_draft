import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/utils/Supabase';

type Cartoon = {
  id: number;
  title: string;
  cover_url: string;
  //favorite: boolean;
  favorite: boolean | null;
};

export default function CartoonCategoryPage() {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const [cartoons, setCartoons] = useState<Cartoon[]>([]);

  useEffect(() => {
    const fetchCartoons = async () => {
      const { data: categoryRow } = await supabase
        .from('cartoon_category')
        .select('id')
        .eq('slug', category)
        .single();

      if (!categoryRow) return;

      const { data, error } = await supabase
        .from('cartoon')
        .select('*')
        .eq('category_id', categoryRow.id)
        .order('created_at', { ascending: false });

      if (!error && data) setCartoons(data as Cartoon[]);
    };

    fetchCartoons();
  }, [category]);

  /*const toggleFavorite = async (id: number, current: boolean) => {
    const { error } = await supabase
      .from('cartoon')
      .update({ favorite: !current })
      .eq('id', id);

    if (!error) {
      setCartoons((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, favorite: !current } : item
        )
      );
    }
  };*/
  const toggleFavorite = async (id: number, current?: boolean | null) => {
    const newFavorite = !current;
    const { error } = await supabase
      .from('cartoon')
      .update({ favorite: newFavorite })
      .eq('id', id);
  
    if (!error) {
      console.log(`✅ 收藏更新成功！cartoon_id=${id}, 新状态=${newFavorite}`);
      setCartoons((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, favorite: newFavorite } : item
        );
        console.log('🌀 更新后的 cartoons:', updated);
        return updated;
      });
    } else {
      console.error('❌ 收藏更新失败:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#E5911B" />
      </TouchableOpacity>
      <Text style={styles.header}>Cartoons</Text>

      <FlatList
        data={cartoons}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/(edu)/(cartoon)/player',
                params: { id: item.id.toString() },
              })
            }
            style={styles.card}
            activeOpacity={0.9}
          >
            <Image source={{ uri: item.cover_url }} style={styles.image} />
            <View style={styles.cardBottom}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <TouchableOpacity onPress={() => toggleFavorite(item.id,  !!item.favorite)}>
                <Ionicons
                 // name={item.favorite ? 'heart' : 'heart-outline'}
                 // size={20}
                 /// color={item.favorite ? '#f44336' : '#aaa'}
               
                 name={!!item.favorite ? 'heart' : 'heart-outline'} // 强转 boolean
                 size={20}
                 color={!!item.favorite ? '#f44336' : '#aaa'}
/>
                
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  backButton: {
    marginTop: 16,
    marginBottom: 16,
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
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5911B',
    flex: 1,
    paddingRight: 6,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
});

