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
import libStyles from './libStyles';



// const BACKEND_URL = 'http://127.0.0.1:8000';
// 根据平台设置 API 地址
const BACKEND_URL =
Platform.OS === 'ios'
  ? 'http://localhost:8000'
  : 'http://10.0.2.2:8000';

console.log('Using API URL:', BACKEND_URL);

const { width } = Dimensions.get('window');

type Book = { id: number; title: string; cover?: string };

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
          pathname: '/bookId' as const,
          params: { id: String(item.id), page: '0' },
        })
      }
    >
      <Image
        source={{ uri: `${BACKEND_URL}${item.cover}` }}
        style={styles.bookCover}
      />
      <Text style={styles.bookTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={libStyles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Search Books</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={28} color="#E5911B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Enter book title..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id.toString()}
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
    paddingVertical: 10,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
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
    marginRight: 16,
    color:'#E5911B',
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
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
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'casual',}),
    color:'#E5911B',
  },
});