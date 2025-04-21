import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export interface BadgeItemProps {
  id?: string;
  title: string;
  imageUrl?: string;
  progress: number; // 0-100
  description?: string;
  unlocked: boolean;
  onPress?: () => void;
}

export default function BadgeItem({
  title,
  imageUrl,
  progress,
  description,
  unlocked,
  onPress
}: BadgeItemProps) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[
        styles.imageContainer, 
        unlocked ? styles.unlockedContainer : styles.lockedContainer
      ]}>
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={[
              styles.image, 
              !unlocked && styles.lockedImage
            ]} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholderImage, !unlocked && styles.lockedImage]} />
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {!unlocked && progress < 100 && (
        <View style={styles.progressIndicator}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 72,
    marginHorizontal: 6,
    marginVertical: 8,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  unlockedContainer: {
    backgroundColor: '#fff',
  },
  lockedContainer: {
    backgroundColor: '#f1f5f9',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#e2e8f0',
  },
  lockedImage: {
    opacity: 0.5,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 3,
    color: '#333',
    width: '100%',
  },
  progressIndicator: {
    width: '80%',
    height: 2,
    backgroundColor: '#eee',
    borderRadius: 1,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 1,
  }
}); 