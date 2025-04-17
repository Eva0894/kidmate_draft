import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';

const numColumns = 2;
const screenWidth = Dimensions.get('window').width;
const imageSize = (screenWidth - 36) / numColumns;

export default function ViewSavedDrawings() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  const loadDrawings = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Cannot access your gallery.');
      return;
    }

    const album = await MediaLibrary.getAlbumAsync('MyDrawings');
    if (!album) {
      setImages([]);
      setLoading(false);
      return;
    }

    const assets = await MediaLibrary.getAssetsAsync({
      album: album.id,
      mediaType: 'photo',
      first: 100,
      sortBy: [['creationTime', false]],
    });

    setImages(assets.assets);
    setLoading(false);
  };

  useEffect(() => {
    loadDrawings();
  }, []);

  const handleDelete = (item: any) => {
    Alert.alert('Delete Drawing', 'Are you sure you want to delete this drawing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await MediaLibrary.deleteAssetsAsync([item.id]);
          loadDrawings();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => setSelectedImage(item.uri)}
      onLongPress={() => handleDelete(item)}
      style={styles.imageWrapper}
    >
      <Image source={{ uri: item.uri }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Drawings</Text>
        <Text style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#e2ac30" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No Drawings Found</Text>}
        />
      )}

      <Modal visible={!!selectedImage} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedImage(null)}>
          <Image source={{ uri: selectedImage || '' }} style={styles.modalImage} />
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    marginTop: 50,
    marginBottom: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    zIndex: 10,
    color: '#e2ac30',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e2ac30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    color: '#ffcc00',
    marginTop: 30,
    marginBottom: 20,
    fontWeight: '800',
    fontFamily: 'Cochin',
    textShadowColor: '#444',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  imageWrapper: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    borderWidth: 2,
    borderColor: '#e2ac30',
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: 16,
  },
});