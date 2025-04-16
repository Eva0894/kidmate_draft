import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, Image, FlatList, Dimensions,
  ActivityIndicator, StyleSheet, TouchableOpacity, Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import libStyles from './libStyles';



const BACKEND_URL = 'http://127.0.0.1:8000';
const { width, height } = Dimensions.get('window');

export default function BookReaderPage() {
  const { bookId, page } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  // const flatListRef = useRef();
  const flatListRef = useRef<FlatList<any>>(null);

  const handleDownloadPDF = async (title: string) => {
    try {
      const encodedTitle = encodeURIComponent(title);
      const downloadUrl = `${BACKEND_URL}/books/download-pdf-by-title/${encodedTitle}`;
      const localUri = `${FileSystem.documentDirectory}${title}.pdf`;

      const { uri } = await FileSystem.downloadAsync(downloadUrl, localUri);
      console.log('✅ PDF downloaded to:', uri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Download Complete', `Saved to: ${uri}`);
      }
    } catch (error) {
      console.error('❌ Failed to download PDF:', error);
      Alert.alert('Download Error', 'Unable to download the PDF file.');
    }
  };

  useEffect(() => {
    fetch(`${BACKEND_URL}/books/${bookId}`)
      .then(res => res.json())
      .then(data => {
        setPages(data.pages);

        navigation.setOptions({
          title: data.title,
          headerRight: () => (
            <TouchableOpacity onPress={() => handleDownloadPDF(data.title)} style={{ marginRight: 16 }}>
              <Text style={{ fontSize: 16 }}>⬇️</Text>
            </TouchableOpacity>
          ),
        });

        const pageStr = typeof page === 'string' ? page : page?.[0] ?? '0';
        const requestedPage = parseInt(pageStr, 10);
        
        if (!isNaN(requestedPage)) {
          setCurrentPageIndex(requestedPage);
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: requestedPage, animated: false });
          }, 0);
        } else {
          // fallback
          fetch(`${BACKEND_URL}/books/reading-log`)
            .then(res => res.json())
            .then((logs) => {
              const log = logs.find((l) => l.book_id === bookId);
              if (log && flatListRef.current) {
                setCurrentPageIndex(log.page_index);
                setTimeout(() => {
                  flatListRef.current?.scrollToIndex({ index: requestedPage, animated: false });
                }, 0);
              }
            });
        }

        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load book', err);
        setLoading(false);
      });
  }, [bookId]);

  const handleRead = async () => {
    const text = pages[currentPageIndex]?.text;
    if (!text) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/chat_stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result;
        if (typeof result === 'string') {
          const base64 = result.split(',')[1];
          const sound = new Audio.Sound();
          await sound.loadAsync({ uri: `data:audio/mpeg;base64,${base64}` });
          await sound.playAsync();
        } else {
          console.error('❌ 解析失败: reader.result 不是字符串');
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      Alert.alert('TTS Error', 'Failed to play audio');
    }
  };

  const handleBookmark = async () => {
    try {
      await fetch(`${BACKEND_URL}/books/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: bookId,
          page_index: currentPageIndex,
        }),
      });
      Alert.alert('Success', 'Bookmark saved!');
    } catch (err) {
      Alert.alert('Error', 'Failed to save bookmark.');
    }
  };

  const renderPage = ({ item, index }: { item: BookPage; index: number }) => (
    <View style={styles.pageContainer}>
      <Image
        source={{ uri: `${BACKEND_URL}${item.image}` }}
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
      <TouchableOpacity onPress={() => router.back()} style={libStyles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
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
          fetch(`${BACKEND_URL}/books/reading-log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book_id: bookId, page_index: index }),
          });
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
