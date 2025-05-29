import React, { useRef } from 'react';
import { View, StyleSheet, Button, Text, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { supabase } from '@/utils/Supabase';
import { v4 as uuidv4 } from 'uuid';
import { Ionicons } from '@expo/vector-icons';

// Badge data type definition
interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  category: string;
}

const DrawingPage = () => {
  const ref = useRef<any>();
  const router = useRouter();

  // Update drawing achievements
  const updateDrawingAchievements = async (userId: string) => {
    try {
      // 1. Get total number of user's saved drawings
      const { data: drawingsData, error: drawingsError } = await supabase
        .from('user_drawings')
        .select('id')
        .eq('user_id', userId);
        
      if (drawingsError) {
        console.error('❌ Failed to get user drawing history:', drawingsError.message);
        return;
      }
      
      // Calculate number of user drawings
      const drawingsCount = drawingsData ? drawingsData.length : 0;
      
      console.log(`👀 User has saved ${drawingsCount} drawings`);
      
      // 2. Get all drawing type achievements
      const { data: badges, error: badgeError } = await supabase
        .from('badges')
        .select('*')
        .eq('category', 'drawing');
        
      if (badgeError) {
        console.error('❌ Failed to get drawing achievement list:', badgeError.message);
        return;
      }

      // List of newly unlocked badges
      const newUnlockedBadges: string[] = [];
      
      // 3. Update the progress of each achievement
      for (const badge of badges as BadgeType[]) {
        // Parse the number requirement from badge description
        let requirement = 1; // Default value
        const description = badge.description || '';
        
        // Support both Chinese and English description formats
        let chineseMatch = description.match(/完成(\d+)幅/);
        let englishMatch = description.match(/Complete (\d+) drawing/i);
        
        if (chineseMatch && chineseMatch[1]) {
          requirement = parseInt(chineseMatch[1]);
        } else if (englishMatch && englishMatch[1]) {
          requirement = parseInt(englishMatch[1]);
        } else if (description.includes('first drawing') || description.includes('第一幅')) {
          requirement = 1;
        }
        
        // Calculate progress percentage (max 100%)
        const progress = Math.min(Math.floor((drawingsCount / requirement) * 100), 100);
        const isEarned = drawingsCount >= requirement;
        
        // Check if user already has this badge record
        const { data: userBadge, error: userBadgeError } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', userId)
          .eq('badge_id', badge.id)
          .maybeSingle();
        
        // If query error (not "not found" error), skip this badge
        if (userBadgeError && userBadgeError.code !== 'PGRST116') {
          console.error(`❌ Failed to query user badge (${badge.name}):`, userBadgeError.message);
          continue;
        }
        
        // If badge already earned, skip
        if (userBadge && userBadge.awarded_at !== null) {
          continue;
        }
        
        let badgeUpdateError = null;
        
        // Update or insert based on whether record already exists
        if (userBadge) {
          // Update existing record
          const { error } = await supabase
            .from('user_badges')
            .update({
              progress: progress,
              awarded_at: isEarned ? new Date().toISOString() : null
            })
            .eq('id', userBadge.id);
          
          badgeUpdateError = error;
        } else {
          // Insert new record
          const { error } = await supabase
            .from('user_badges')
            .insert({
              id: uuidv4(),
              user_id: userId,
              badge_id: badge.id,
              progress: progress,
              awarded_at: isEarned ? new Date().toISOString() : null
            });
          
          badgeUpdateError = error;
        }
          
        if (badgeUpdateError) {
          console.error(`❌ Failed to update badge progress (${badge.name}):`, badgeUpdateError.message);
        } else {
          console.log(`✅ Badge "${badge.name}" progress updated to ${progress}%, requirement: ${requirement} drawings, current: ${drawingsCount} drawings`);
          
          // If this is a newly unlocked badge, add to list
          if (isEarned && (!userBadge || userBadge.awarded_at === null)) {
            newUnlockedBadges.push(badge.name);
          }
        }
      }
      
      // If there are newly unlocked badges, show notification
      if (newUnlockedBadges.length > 0) {
        const badgeNames = newUnlockedBadges.join(', ');
        Alert.alert(
          '🎉 Congratulations on unlocking new achievements!',
          `You have unlocked the following achievements: ${badgeNames}`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error updating drawing achievements:', error);
    }
  };

  // Open app settings
  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // Request media library permission
  const requestMediaLibraryPermission = async () => {
    // First check current permission status
    const { status: currentStatus } = await MediaLibrary.getPermissionsAsync();
    
    if (currentStatus === 'granted') {
      return true;
    }
    
    // If permission not requested before, or is "undetermined", try to request new permission
    if (currentStatus === 'undetermined') {
      const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
      return newStatus === 'granted';
    }
    
    // If permission denied, show prompt to guide user to settings
    Alert.alert(
      'Photo Library Permission Required',
      'Saving drawings requires access to your photo library. Please allow this app to access your photo library in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openSettings }
      ]
    );
    
    return false;
  };

  const handleOK = async (signature: string) => {
    try {
      // Request photo library permission
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) {
        return; // If no permission, return directly
      }

      const base64Data = signature.replace('data:image/png;base64,', '');
      const fileUri = FileSystem.cacheDirectory + 'drawing.png';

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const asset = await MediaLibrary.createAssetAsync(fileUri);
      const album = await MediaLibrary.getAlbumAsync('MyDrawings');

      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
      } else {
        await MediaLibrary.createAlbumAsync('MyDrawings', asset, false);
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Record user drawing
        const { error: drawingError } = await supabase
          .from('user_drawings')
          .insert({
            id: uuidv4(),
            user_id: user.id,
            drawing_uri: asset.uri,
            created_at: new Date().toISOString()
          });
          
        if (drawingError) {
          console.error('❌ Failed to record drawing:', drawingError.message);
        } else {
          console.log('✅ Successfully recorded user drawing');
          
          // Update drawing-related achievements
          await updateDrawingAchievements(user.id);
        }
      }

      Alert.alert('✅ Saving Successfully', 'Your Work is Saved in Photos! (MyDrawings)');
    } catch (err) {
      console.error('Save Failed:', err);
      Alert.alert('❌ Save Failed', 'Please Try Again');
    }
  };

  const handleClear = () => {
    ref.current?.clearSignature();
  };

  const handleUndo = () => {
    ref.current?.undo();
  };

  return (
    <View style={{ flex: 1 }}>

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/eduPage')} style={styles.backButton}>
         <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.seeMyWorkButton}
            onPress={() => {
                console.log('jump to ViewDrawings');
                router.push('/viewdrawings')
              }}
        >
            <Text style={styles.seeMyWorkText}>🖼 See My Work</Text>
        </TouchableOpacity>
        </View>

        

      <SignatureScreen
        ref={ref}
        onOK={handleOK}
        autoClear={false}
        webStyle={style}
      />

<View style={styles.buttonContainer}>
  <TouchableOpacity style={styles.customButton} onPress={() => ref.current.readSignature()}>
    <Text style={styles.text}>Save</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.customButton} onPress={handleClear}>
    <Text style={styles.text}>Clear</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.customButton} onPress={handleUndo}>
    <Text style={styles.text}>Revoke</Text>
  </TouchableOpacity>
</View>
    </View>
  );
};

const style = `.m-signature-pad { box-shadow: none; border: none; }
  .m-signature-pad--body { border: 2px solid #e2ac30; }
  .m-signature-pad--footer { display: none; margin: 0px; }
  body,html { width: 100%; height: 100%; margin: 0; padding: 0; }`;

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),

  },
  viewButtonContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  text: {
    fontSize: 24,
    color: '#E5911B',
    fontWeight: 'bold',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
    marginTop: -40,
  },
  seeMyWorkButton: {
    padding: 8,
    marginBottom: 5,
  },
  seeMyWorkText: {
    fontSize: 18,
    color: '#E5911B',
    fontWeight: 'bold',
    fontFamily: Platform.select({
          ios: 'ChalkboardSE-Regular',
          android: 'monospace',}),
  },
  customButton: {
  flexDirection: 'row',  // 横向排列
  justifyContent: 'space-between',  // 按钮之间留空间
  paddingHorizontal: 20,  // 整体左右留点间距
  marginTop: -10,
  paddingVertical: 50,
 },
});

export default DrawingPage;
