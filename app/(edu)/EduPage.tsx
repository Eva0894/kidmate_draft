import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import OptionCard from './OptionCard';

const screenWidth = Dimensions.get('window').width;
const cardSize = (screenWidth - 48) / 2;

const options = [
  {
    title: 'Game',
    image: require('../../assets/images/Game.png'),
    onPress: (router: any) => router.push('/game'),
  },
  {
    title: 'Painting',
    image: require('../../assets/images/painting.jpg'),
    onPress: (router: any) => router.push('/drawing'),
  },
  {
    title: 'Cartoon',
    image: require('../../assets/images/game.jpg'),
    onPress: () => {},
  },
  {
    title: 'Piano',
    image: require('../../assets/images/Playing.png'),
    onPress: (router: any) => router.push('/piano'),
  },
  {
    title: 'Course',
    image: require('../../assets/images/Course.png'),
    onPress: (router: any) => router.push('/course'),
  },
  {
    title: 'Music',
    image: require('../../assets/images/Music.png'),
    onPress: (router: any) => router.push('/song'),
  },
];

export default function EduPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#e2ac30" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Educational Activities</Text>
        <Ionicons name="arrow-forward" size={28} color="transparent" />
      </View> */}

      <FlatList
        data={options}
        numColumns={2}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.optionsContainer}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.optionCard} onPress={() => item.onPress?.(router)}>
            <Image source={item.image} style={styles.optionImage} resizeMode="cover" />
            <Text style={styles.optionText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.progressBox}>
        <Text style={styles.progressTitle}>Progress</Text>
        <Text style={styles.progressSubtitle}> (Stay tuneds)</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#e2ac30',
    fontWeight: 'bold',
  },
  optionsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  optionCard: {
    width: (screenWidth - 48) / 2,
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
    color: '#e2ac30',
    fontWeight: '600',
  },
  bottomImage: {
    width: '100%',
    height: 300,
    marginTop: 20,
  },
});
