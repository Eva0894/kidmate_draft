import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function MainPage() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#DAA520' }}>
          Home
        </Text>
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#DAA520" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      {/* Header 内容 */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <TouchableOpacity
            style={styles.ageContainer}
            // onPress={() => navigation.navigate('(me)/profile')}
            onPress={() => router.push('/(me)/profile')}
          >
            <Image
              source={require('../assets/images/profile.png')}
              style={styles.profileImage}
            />
            <Text style={styles.ageRange}>3-7</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Image
          source={require('../assets/images/banner-image.png')}
          style={styles.bannerImage}
        />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerText}>Hi!</Text>
          <Text style={styles.bannerSubText}>I'm your AI learning companion</Text>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categories}>
        <TouchableOpacity
          style={styles.category}
        //   onPress={() => navigation.navigate('chat')}
          onPress={() => router.push('/chat')}
        >
        <Text style={styles.categoryText}>AI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.category}>
          <Text style={styles.categoryText}>Storytelling</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={styles.category}
            onPress={() => router.push('/(tabs)/eduPage')}
            >
            <Text style={styles.categoryText}>Educational Activities</Text>
            </TouchableOpacity>
        <TouchableOpacity style={styles.category}>
          <Text style={styles.categoryText}>Digital</Text>
        </TouchableOpacity>
      </View>

      {/* Recommendations */}
      <View style={styles.recommendations}>
        <Text style={styles.sectionTitle}>Recommendation</Text>
        <View style={styles.books}>
          <TouchableOpacity style={styles.book}>
            <Image
              source={require('../assets/images/book1.png')}
              style={styles.bookImage}
            />
            <Text style={styles.bookTitle}>Alex's Super Medicine</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.book}>
            <Image
              source={require('../assets/images/book2.png')}
              style={styles.bookImage}
            />
            <Text style={styles.bookTitle}>Brave Bora</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.book}>
            <Image
              source={require('../assets/images/book3.png')}
              style={styles.bookImage}
            />
            <Text style={styles.bookTitle}>Sam's Treasures</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#FDEBD0',
  },
  ageRange: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D68910',
  },
  banner: {
    backgroundColor: '#f1e4c2',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    margin: 16,
  },
  bannerImage: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D68910',
  },
  bannerSubText: {
    fontSize: 16,
    color: '#D68910',
    marginTop: 4,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  category: {
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  recommendations: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  books: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  book: {
    alignItems: 'center',
    width: 100,
  },
  bookImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  bookTitle: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
});
