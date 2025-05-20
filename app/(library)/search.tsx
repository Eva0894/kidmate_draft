import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getBookBackendUrl } from '@/utils/apiConfig';

const BACKEND_URL = getBookBackendUrl();
const { width } = Dimensions.get('window');

type Book = {
  id: string;
  title: string;
  cover: string;
};

export default function SearchScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch(`${BACKEND_URL}/books`)
      .then((res) => res.json())
      .then(setBooks)
      .catch(console.error);
  }, []);

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() =>
        router.push({
          pathname: '/(library)/[bookId]',
          params: {
            bookId: item.id,
            page: '0',
          },
        })
      }
    >
      <Image
        source={{ uri: item.cover ? `${BACKEND_URL}${item.cover}` : '' }}
        style={styles.bookCover}
      />
      <Text style={styles.bookTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>
        <Text style={styles.header}>Search Books</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#E5911B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Enter book title..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.booksList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 48,
    marginBottom: 12,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 10,
    zIndex: 999,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',
    }),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',
    }),
  },
  booksList: {
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
      android: 'casual',
    }),
  },
});
