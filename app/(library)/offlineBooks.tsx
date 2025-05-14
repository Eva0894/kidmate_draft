import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OfflineBooksScreen() {
  const [offlineBooks, setOfflineBooks] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadOfflineBooks = async () => {
      try {
        const baseDir = `${FileSystem.documentDirectory}offline/`;
        const dirs = await FileSystem.readDirectoryAsync(baseDir);

        const books = await Promise.all(
          dirs.map(async (bookId) => {
            try {
              const bookJsonPath = `${baseDir}${bookId}/book.json`;
              const jsonStr = await FileSystem.readAsStringAsync(bookJsonPath);
              const book = JSON.parse(jsonStr);
              return book;
            } catch (e) {
              return null;
            }
          })
        );

        setOfflineBooks(books.filter(Boolean));
      } catch (err) {
        console.error('📁 Failed to load offline books:', err);
      }
    };

    loadOfflineBooks();
  }, []);

  const deleteOfflineBook = async (bookId: string) => {
    try {
      const dir = `${FileSystem.documentDirectory}offline/${bookId}`;
      await FileSystem.deleteAsync(dir, { idempotent: true });
      setOfflineBooks((prev) => prev.filter((b) => b.id !== bookId));
      Alert.alert('Success', 'Book has been deleted.');
    } catch (err) {
      console.error('❌ Failed to delete book:', err);
      Alert.alert('Error', 'Failed to delete offline book.');
    }
  };

  return (
    <View style={styles.container}>
      {/* 返回按钮 */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#E5911B" />
      </TouchableOpacity>

      <Text style={styles.header}>Offline Books</Text>

      <FlatList
        data={offlineBooks}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.bookList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bookCard}
            onPress={() => {
              router.push({
                pathname: '/(library)/[bookId]',
                params: { bookId: item.id, offline: 'true' }, // 👈 离线标志
              });
            }}
            onLongPress={() => {
              Alert.alert(
                'Delete Book',
                `Are you sure you want to delete "${item.title}"?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteOfflineBook(item.id),
                  },
                ]
              );
            }}
          >
            <Image
              source={{ uri: `file://${item.cover}`.replace('file://file://', 'file://') }}
              style={styles.bookCover}
            />
            <Text style={styles.bookTitle} numberOfLines={2}>
              {item.title}
            </Text>
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
    padding: 12,
  },
  backButton: {
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    marginBottom: 10,
    marginLeft: 4,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5911B',
    marginBottom: 12,
    marginLeft: 4,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  bookList: {
    paddingBottom: 60,
  },
  bookCard: {
    width: (width - 48) / 3,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 4,
  },
  bookCover: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  bookTitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
});
