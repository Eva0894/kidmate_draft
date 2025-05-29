import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/Supabase';
import { v4 as uuidv4 } from 'uuid';

// Define type interfaces
interface CartoonType {
  id: number;
  title: string;
  video_url: string;
  cover_url?: string;
  favorite?: boolean;
  category_id: number;
  recent_played_at?: string;
  created_at?: string;
}

interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  category: string;
}

export default function CartoonPlayerPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const videoRef = useRef(null);
  const [cartoon, setCartoon] = useState<CartoonType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartoon = async () => {
      const { data, error } = await supabase
        .from('cartoon')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setCartoon(data);
      
        // Update recent play time
        const { error: updateError } = await supabase
          .from('cartoon')
          .update({ recent_played_at: new Date().toISOString() })
          .eq('id', id);
      
        if (updateError) {
          console.error('❌ Failed to update recent_played_at:', updateError.message);
        } else {
          console.log('✅ Successfully updated recent_played_at');
          
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Record user watching cartoon
            recordUserWatched(user.id, id as string);
          }
        }
      }
 
      setLoading(false);
    };

    if (id) fetchCartoon();
  }, [id]);

  // Record user watched cartoons and update achievements
  const recordUserWatched = async (userId: string, cartoonId: string | number) => {
    try {
      // First check if the watch record already exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('user_watched_cartoons')
        .select('*')
        .eq('user_id', userId)
        .eq('cartoon_id', cartoonId)
        .maybeSingle();
      
      if (checkError) {
        console.error('❌ Failed to check watch record:', checkError.message);
        return;
      }
      
      let watchError = null;
      
      // If record already exists, update observed_at time
      if (existingRecord) {
        const { error } = await supabase
          .from('user_watched_cartoons')
          .update({
            watched_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('cartoon_id', cartoonId);
        
        watchError = error;
      } else {
        // If record doesn't exist, create new record
        const { error } = await supabase
          .from('user_watched_cartoons')
          .insert({
            user_id: userId,
            cartoon_id: cartoonId,
            watched_at: new Date().toISOString()
          });
        
        watchError = error;
      }
      
      if (watchError) {
        console.error('❌ Failed to record user watch:', watchError.message);
        return;
      }
      
      console.log('✅ Successfully recorded user watch');
      
      // Update cartoon achievements
      updateCartoonAchievements(userId);
    } catch (error) {
      console.error('Error recording watch history:', error);
    }
  };

  // Update cartoon related achievements
  const updateCartoonAchievements = async (userId: string) => {
    try {
      // 1. Get total number of user watched cartoons
      const { data: watchedData, error: watchedError } = await supabase
        .from('user_watched_cartoons')
        .select('cartoon_id')
        .eq('user_id', userId);
        
      if (watchedError) {
        console.error('❌ Failed to get user watch history:', watchedError.message);
        return;
      }
      
      // Calculate unique watched cartoon count
      const watchedCartoonIds = watchedData.map(item => item.cartoon_id);
      const uniqueWatchedCount = new Set(watchedCartoonIds).size;
      
      console.log(`👀 User has watched ${uniqueWatchedCount} different cartoons`);
      
      // 2. Get all cartoon type achievements
      const { data: badges, error: badgeError } = await supabase
        .from('badges')
        .select('*')
        .eq('category', 'cartoon');
        
      if (badgeError) {
        console.error('❌ Failed to get achievement list:', badgeError.message);
        return;
      }

      // List of newly unlocked badges
      const newUnlockedBadges: string[] = [];
      
      // 3. Update progress for each achievement
      for (const badge of badges as BadgeType[]) {
        // Parse the number requirement from badge description
        let requirement = 1; // Default value
        const description = badge.description || '';
        const match = description.match(/Watch (\d+) cartoons/);
        
        if (match && match[1]) {
          requirement = parseInt(match[1]);
        }
        
        // Calculate progress percentage (max 100%)
        const progress = Math.min(Math.floor((uniqueWatchedCount / requirement) * 100), 100);
        const isEarned = progress >= 100;
        
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
          console.log(`✅ Badge "${badge.name}" progress updated to ${progress}%`);
          
          // If newly unlocked badge, add to list
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
      console.error('Error updating cartoon achievements:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}><Text>Loading...</Text></View>
    );
  }

  if (!cartoon) {
    return (
      <View style={styles.center}><Text>Cartoon not found</Text></View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#E5911B" />
      </TouchableOpacity>
      <Text style={styles.title}>{cartoon.title}</Text>
      <Video
        ref={videoRef}
        source={{ uri: cartoon.video_url }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  video: {
    width: '90%',
    height: 220,
    borderRadius: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
});

