import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions, Button, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BadgeDetailModalProps {
  visible: boolean;
  title: string;
  description: string;
  imageUrl?: string;
  progress: number;
  unlocked: boolean;
  onClose: () => void;
  awardedAt?: string;
}

const { width } = Dimensions.get('window');

export default function BadgeDetailModal({
  visible,
  title,
  description,
  imageUrl,
  progress,
  unlocked,
  onClose,
  awardedAt
}: BadgeDetailModalProps) {
  const [localProgress, setLocalProgress] = useState(progress);

  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  const handleModalClose = () => {
    setLocalProgress(progress);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleModalClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleModalClose}>
            <Ionicons name="close" size={28} color="#E5911B" />
          </TouchableOpacity>
          
          <View style={[
            styles.statusBadge, 
            unlocked ? styles.unlockedStatusBadge : styles.lockedStatusBadge
          ]}>
            <Text style={styles.statusBadgeText}>
               {unlocked ? "Unlocked Badge" : "Locked Badge"}
            </Text>
            {unlocked && <Ionicons name="trophy" size={14} color="white" style={{marginLeft: 4}} />}
            {!unlocked && <Ionicons name="lock-closed" size={14} color="white" style={{marginLeft: 4}} />}
          </View>
          
          {unlocked && awardedAt && (
            <Text style={styles.awardedDateText}>
              {awardedAt}
            </Text>
          )}
          
          <View style={styles.badgeImageContainer}>
            {imageUrl ? (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.badgeImage} 
              />
            ) : (
              <View style={styles.placeholderImage} />
            )}
          </View>
          
          <Text style={styles.badgeTitle}>{title}</Text>
          <Text style={styles.badgeDescription}>{description}</Text>
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${localProgress}%` }]} />
          </View>
          
          <Text style={[
            styles.statusText, 
            unlocked ? styles.unlockedText : styles.lockedText
          ]}>
             {unlocked 
               ? "Yay! You unlocked this badge!" 
               : `Progress: ${localProgress}%. You're doing great!`
             }
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  badgeImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f4f8',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  badgeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#e2e8f0',
  },
  badgeTitle: {
    fontSize: 24,
    color: '#E5911B',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Chalkboard SE',
      android: 'casual',
  })
  },
  badgeDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.select({
      ios: 'Chalkboard SE',
      android: 'casual',
  })
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: 'Chalkboard SE',
      android: 'casual',
  })
  },
  unlockedText: {
    color: '#10B981',
  },
  lockedText: {
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedStatusBadge: {
    backgroundColor: '#10B981',
  },
  lockedStatusBadge: {
    backgroundColor: '#6B7280',
  },
  statusBadgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  awardedDateText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 14,
    fontStyle: 'italic',
    fontFamily: Platform.select({
      ios: 'Chalkboard SE',
      android: 'casual',
    })
  }
}); 