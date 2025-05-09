import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Network from 'expo-network';

const { width } = Dimensions.get('window');
const BACKEND_URL = 'http://10.16.112.171:8000';

const categories = [
  { title: 'Story', image: require('../../assets/images/story.png') },
  { title: 'Science', image: require('../../assets/images/science.png') },
  { title: 'Plant', image: require('../../assets/images/plant.png') },
  { title: 'Animal', image: require('../../assets/images/animal.png') },
  { title: 'Sport', image: require('../../assets/images/sport.png') },
];

export default function LibraryScreen() {
  const router = useRouter();
  const [recents, setRecents] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const checkNetwork = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsOffline(!state.isConnected);
    };

    checkNetwork(); // 初次检查
    const interval = setInterval(checkNetwork, 10000); // 每 10 秒检查一次

    fetch(`${BACKEND_URL}/books/reading-log`)
      .then(res => res.json())
      .then(async (logs) => {
        const enriched = await Promise.all(
          logs.map(async (log: any) => {
            if (!log.book_id) return null;
            try {
              const res = await fetch(`${BACKEND_URL}/books/${log.book_id}`);
              const book = await res.json();
              return {
                book_id: log.book_id,
                page_index: log.page_index,
                total_pages: book.pages.length,
                books: {
                  title: book.title,
                  cover_url: `${BACKEND_URL}${book.cover}`,
                },
              };
            } catch (e) {
              console.error('Failed to load book:', log.book_id);
              return null;
            }
          })
        );
        setRecents(enriched.filter(Boolean));
      });

    return () => clearInterval(interval);
  }, []);

  const handleDeleteRecent = (bookId: string, title: string) => {
    Alert.alert(
      'Delete Reading Record',
      `Are you sure you want to delete the reading record for "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${BACKEND_URL}/books/reading-log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ book_id: bookId, page_index: -1 }),
              });
              setRecents((prev) => prev.filter((item) => item.book_id !== bookId));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete reading record.');
            }
          },
        },
      ]
    );
  };

  const handleRecentPress = async (bookId: string, pageIndex: number) => {
    if (!isOffline) {
      router.push({
        pathname: '/(library)/bookId',
        params: {
          bookId,
          page: String(pageIndex || 0),
        },
      });
      return;
    }

    // 离线模式下检查文件是否存在
    const bookJsonPath = `${FileSystem.documentDirectory}offline/${bookId}/book.json`;
    const fileInfo = await FileSystem.getInfoAsync(bookJsonPath);

    if (!fileInfo.exists) {
      Alert.alert('Network connection failed', 'Please save the book offline before reading it.');
      return;
    }

    router.push({
      pathname: '/(library)/bookId',
      params: {
        bookId,
        page: String(pageIndex || 0),
        offline: 'true',
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.header}>My Library</Text>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Ionicons name="search" size={28} color="#E5911B" />
        </TouchableOpacity>
      </View>

      <Image
        source={require('../../assets/images/banner.png')}
        style={styles.banner}
        resizeMode="cover"
      />

      <View style={styles.iconRow}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/favourite')}>
          <Ionicons name="heart" size={32} color="red" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/bookmark')}>
          <Ionicons name="bookmark" size={32} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/offlineBooks')}>
          <Ionicons name="cloud-download-outline" size={32} color="#2D8CFF" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Digital Library</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((cat, index) => (
          <TouchableOpacity
            key={index}
            style={styles.catItem}
            onPress={() =>
              router.push({
                pathname: '/(library)/[category]',
                params: { category: cat.title.toLowerCase() },
              })
            }
          >
            <Image source={cat.image} style={styles.catImage} />
            <Text style={styles.catLabel}>{cat.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Recent</Text>
      <FlatList
        data={recents}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.book_id}
        contentContainerStyle={styles.recentList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.recentItem}
            onPress={() => handleRecentPress(item.book_id, item.page_index)}
            onLongPress={() => handleDeleteRecent(item.book_id, item.books?.title || 'Untitled')}
          >
            <Image source={{ uri: item.books?.cover_url || '' }} style={styles.recentImage} />
            <View style={styles.progressBarWrap}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${(item.page_index / item.total_pages) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.recentLabel} numberOfLines={1}>{item.books?.title || 'Untitled'}</Text>
            <Text style={styles.progressText}>
              {Math.round(((item.page_index + 1) / item.total_pages) * 100)}% completed
            </Text>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5911B',
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'ChalkboardSE-Regular', android: 'casual' }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E5911B',
    marginBottom: 8,
    marginTop: 12,
    fontFamily: Platform.select({ ios: 'ChalkboardSE-Regular', android: 'casual' }),
  },
  banner: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    marginBottom: 16,
  },
  iconRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  iconButton: {
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryScroll: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  catItem: {
    alignItems: 'center',
    marginRight: 12,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  catImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 6,
  },
  catLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#E5911B',
    fontFamily: Platform.select({ ios: 'ChalkboardSE-Regular', android: 'casual' }),
  },
  recentList: {
    paddingVertical: 8,
  },
  recentItem: {
    width: 118,
    marginRight: 12,
    alignItems: 'center',
  },
  recentImage: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    backgroundColor: '#eee',
    marginBottom: 6,
  },
  recentLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#E5911B',
    fontFamily: Platform.select({ ios: 'ChalkboardSE-Regular', android: 'casual' }),
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  progressBarWrap: {
    width: '100%',
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#4CAF50',
  },
});