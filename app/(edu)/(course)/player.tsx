import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/Supabase';
import { v4 as uuidv4 } from 'uuid';

type VideoParams = {
  id: string;
  title: string;
  url: string;
};

// Badge data type definition
interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  category: string;
}

export default function CoursePlayerPage() {
  const { id, title, url } = useLocalSearchParams<VideoParams>();
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVideoError = (error: string) => {
    console.error('Video playback error:', error);
    setError('Video playback failed, please try again later');
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        handleVideoError(status.error);
      }
    }
  };

  // Update course achievements
  const updateCourseAchievements = async (userId: string) => {
    try {
      // 1. Get total number of user watched courses
      const { data: watchedData, error: watchedError } = await supabase
        .from('user_watched_courses')
        .select('course_id')
        .eq('user_id', userId);
        
      if (watchedError) {
        console.error('❌ Failed to get user course watch history:', watchedError.message);
        return;
      }
      
      // Calculate unique watched course count
      const watchedCourseIds = watchedData.map(item => item.course_id);
      const uniqueWatchedCount = new Set(watchedCourseIds).size;
      
      console.log(`👀 User has watched ${uniqueWatchedCount} different courses`);
      
      // 2. Get all course type achievements
      const { data: badges, error: badgeError } = await supabase
        .from('badges')
        .select('*')
        .eq('category', 'course');
        
      if (badgeError) {
        console.error('❌ Failed to get course achievement list:', badgeError.message);
        return;
      }

      // List of newly unlocked badges
      const newUnlockedBadges: string[] = [];
      
      // 3. Update progress for each achievement
      for (const badge of badges as BadgeType[]) {
        // Parse the number requirement from badge description
        let requirement = 1; // Default value
        const description = badge.description || '';
        const match = description.match(/Complete (\d+) courses/);
        
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
      console.error('Error updating course achievements:', error);
    }
  };

  // Record user course views and update recently played time
  useEffect(() => {
    const recordWatchCourse = async () => {
      if (!id) return;
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error('User not logged in');
          return;
        }
        
        // 1. Update course recently played time
        const { error: updateError } = await supabase
          .from('courses')
          .update({ recent_played_at: new Date().toISOString() })
          .eq('id', id);

        if (updateError) {
          console.error('❌ Failed to update recent_played_at:', updateError.message);
        } else {
          console.log('✅ Successfully updated recent_played_at');
        }
        
        // 2. Record user watch history (using unique constraint to prevent duplicates)
        const { error: watchError } = await supabase
          .from('user_watched_courses')
          .upsert({
            id: uuidv4(),
            user_id: user.id,
            course_id: id,
            watched_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,course_id',
            ignoreDuplicates: false // Update existing records
          });
          
        if (watchError) {
          console.error('❌ Failed to record watch history:', watchError.message);
        } else {
          console.log('✅ Successfully recorded user watch history');
          
          // 3. Update course related achievements
          await updateCourseAchievements(user.id);
        }
      } catch (error) {
        console.error('Failed to record course watch:', error);
      }
    };

    recordWatchCourse();
  }, [id]);

  if (!url) {
    return (
      <View style={styles.center}>
        <Text>Video not found</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setError(null)}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#E5911B" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <Video
        ref={videoRef}
        source={{ uri: url }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        onError={handleVideoError}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
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
  },
  errorText: {
    color: '#ff0000',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#D38300',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});