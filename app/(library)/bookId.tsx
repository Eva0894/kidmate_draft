import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, Image, FlatList, Dimensions, ActivityIndicator,
  StyleSheet, TouchableOpacity, Alert, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
// import NetInfo from '@react-native-community/netinfo';
import * as Network from 'expo-network';
import { Ionicons } from '@expo/vector-icons';
import libStyles from './libStyles';

const BACKEND_URL = "http://192.168.10.105:8000";
const { width, height } = Dimensions.get('window');

export default function BookReaderPage() {
  const { bookId: rawBookId, page: rawPage, offline } = useLocalSearchParams();
  const bookId = typeof rawBookId === 'string' ? rawBookId : rawBookId?.[0] ?? '';
  const page = typeof rawPage === 'string' ? rawPage : rawPage?.[0] ?? '0';
  const isOffline = offline === 'true';

  const router = useRouter();
  const navigation = useNavigation();

  type BookPage = {
    text: string;
    image?: string;
    audio?: string;
  };
  
  const [pages, setPages] = useState<BookPage[]>([]);

  // const [pages, setPages] = useState([]);
  const [bookData, setBookData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const flatListRef = useRef<FlatList<any>>(null);

  useEffect(() => {
    const loadBook = async () => {
      if (isOffline) {
        try {
          const path = `${FileSystem.documentDirectory}offline/${bookId}/book.json`;
          const str = await FileSystem.readAsStringAsync(path);
          const data = JSON.parse(str);
          setBookData(data);
          setPages(data.pages);
          setLoading(false);
        } catch (e) {
          console.error('❌ Failed to load offline book:', e);
          Alert.alert('Error', 'Failed to load offline book.');
          setLoading(false);
        }
      } else {
        // const netState = await NetInfo.fetch();
        // if (!netState.isConnected) {
        //   Alert.alert('Network Error', 'Please download the book for offline use.');
        //   router.back();
        //   return;
        // }
        const netState = await Network.getNetworkStateAsync();
        if (!netState.isConnected) {
          Alert.alert('Network Error', 'Please download the book for offline use.');
          router.back();
          return;
        }

        fetch(`${BACKEND_URL}/books/${bookId}`)
          .then(res => res.json())
          .then(data => {
            if (!data.pages?.length) {
              Alert.alert('Error', 'This book has no content.');
              setLoading(false);
              return;
            }
            setBookData(data);
            setPages(data.pages);

            const requestedPage = parseInt(page, 10);
            if (!isNaN(requestedPage) && requestedPage < data.pages.length) {
              setCurrentPageIndex(requestedPage);
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index: requestedPage, animated: false });
              }, 0);
            }

            setLoading(false);
          })
          .catch(err => {
            console.error('Failed to load online book', err);
            Alert.alert('Error', 'Failed to load book.');
            setLoading(false);
          });
      }
    };

    loadBook();
  }, [bookId, isOffline]);

  const handleSaveOffline = async () => {
    try {
      if (!bookData?.pages?.length) return;

      const bookDir = `${FileSystem.documentDirectory}offline/${bookId}`;
      await FileSystem.makeDirectoryAsync(bookDir, { intermediates: true });

      const coverPath = `${bookDir}/cover.jpg`;
      await FileSystem.downloadAsync(`${BACKEND_URL}${bookData.cover}`, coverPath);

      const pageInfos = await Promise.all(bookData.pages.map(async (page:any, idx:any) => {
        const imgPath = `${bookDir}/page_${idx + 1}.jpg`;
        await FileSystem.downloadAsync(`${BACKEND_URL}${page.image}`, imgPath);
        return {
          image: imgPath,
          text: page.text,
        };
      }));

      const offlineMeta = {
        id: bookId,
        title: bookData.title,
        cover: coverPath,
        pages: pageInfos,
      };

      await FileSystem.writeAsStringAsync(`${bookDir}/book.json`, JSON.stringify(offlineMeta), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      Alert.alert('Success', 'Book saved for offline use!');
    } catch (err) {
      console.error(' Failed to save offline:', err);
      Alert.alert('Error', 'Failed to save book offline.');
    }
  };

  const handleBookmark = async () => {
    if (isOffline) {
      Alert.alert('Offline Mode', 'Bookmarks not supported in offline mode.');
      return;
    }
    try {
      await fetch(`${BACKEND_URL}/books/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: bookId, page_index: currentPageIndex }),
      });
      Alert.alert('Success', 'Bookmark saved!');
    } catch (err) {
      Alert.alert('Error', 'Failed to save bookmark.');
    }
  };

  const handleRead = async () => {
    if (isOffline) {
      Alert.alert('Offline Mode', 'TTS not supported in offline mode.');
      return;
    }
    const text = pages[currentPageIndex]?.text;
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/chat_stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (base64) {
          const sound = new Audio.Sound();
          await sound.loadAsync({ uri: `data:audio/mpeg;base64,${base64}` });
          await sound.playAsync();
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      Alert.alert('TTS Error', 'Failed to play audio.');
    }
  };

  const renderPage = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.pageContainer}>
      <Image
        source={{ uri: isOffline ? `file://${item.image}` : `${BACKEND_URL}${item.image}` }}
        style={styles.pageImage}
        resizeMode="contain"
      />
      <Text style={styles.pageNumber}>{index + 1}</Text>
    </View>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>
        {!isOffline && (
          <TouchableOpacity onPress={handleSaveOffline}>
            <Ionicons name="cloud-download-outline" size={24} color="#E5911B" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={pages}
        horizontal
        pagingEnabled
        renderItem={renderPage}
        keyExtractor={(_, i) => i.toString()}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentPageIndex(index);
          if (!isOffline) {
            fetch(`${BACKEND_URL}/books/reading-log`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ book_id: bookId, page_index: index }),
            });
          }
        }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollToIndexFailed={({ index }) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index, animated: false });
          }, 500);
        }}
      />

      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.smallButton} onPress={handleRead}>
          <Text style={styles.buttonText}>📢 Read</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.smallButton, { backgroundColor: '#FF9800' }]} onPress={handleBookmark}>
          <Text style={styles.buttonText}>🔖 Bookmark</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageContainer: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  pageImage: {
    width: width,
    height: height * 0.7,
    backgroundColor: '#eee',
  },
  pageNumber: {
    marginTop: 6,
    fontSize: 14,
    color: '#999',
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2979FF',
    borderRadius: 16,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
