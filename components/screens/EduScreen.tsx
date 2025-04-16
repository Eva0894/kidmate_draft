import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

const options = [
  {
    title: 'Game',
    image: require('../../assets/images/Game.png'),
    route: '/game',
  },
  {
    title: 'Painting',
    image: require('../../assets/images/painting.jpg'),
    route: '/drawing',
  },
  {
    title: 'Cartoon',
    image: require('../../assets/images/game.jpg'),
    route: '', 
  },
  {
    title: 'Piano',
    image: require('../../assets/images/Playing.png'),
    route: '/piano',
  },
  {
    title: 'Course',
    image: require('../../assets/images/Course.png'),
    route: '/course',
  },
  {
    title: 'Music',
    image: require('../../assets/images/Music.png'),
    route: '/song',
  },
];

export default function EduScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#e2ac30" />
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>Educational Activities</Text>
        <Ionicons name="arrow-forward" size={28} color="transparent" />
      </View>

      {/* Options Grid */}
      <FlatList
        data={options}
        numColumns={2}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.optionsContainer}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => {
              if (item.route) {
                router.push(item.route as any);
              }
            }}
          >
            <Image source={item.image} style={styles.optionImage} resizeMode="cover" />
            <Text style={styles.optionText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Progress Box */}
      <View style={styles.progressBox}>
        <Text style={styles.progressTitle}>Progress</Text>
        <Text style={styles.progressSubtitle}> (Stay tuned)</Text>
      </View>
    </SafeAreaView>
  );
}

const cardSize = (screenWidth - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    color: '#e2ac30',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginTop: 30,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  optionCard: {
    width: cardSize,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionImage: {
    width: '100%',
    height: '70%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  optionText: {
    marginTop: 6,
    fontSize: 14,
    color: '#e2ac30',
    fontWeight: '600',
  },
  progressBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e2ac30',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});
