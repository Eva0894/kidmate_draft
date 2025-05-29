import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ImageBackground, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator, 
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { supabase } from '../utils/Supabase';
import BadgeItem, { BadgeItemProps } from '../components/BadgeItem';
import BadgeDetailModal from '../components/BadgeDetailModal';

const { width } = Dimensions.get('window');

// Type definitions
export type CategoryType = 'all' | 'drawing' | 'cartoon' | 'course' | 'reading';

// Badge data interface
interface BadgeData {
  id: string;
  name: string;
  type: CategoryType;
  description: string;
  imageUrl?: string;
  progress: number;
  earned: boolean;
  awardedAt?: string;
}

export default function RewardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userTotalBadges, setUserTotalBadges] = useState({ earned: 0, total: 0 });

  useEffect(() => {
    async function fetchBadges() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error('User not logged in');
          setIsLoading(false);
          return;
        }

        // Get all badges from supabase
        const { data: allBadges, error: badgeError } = await supabase
          .from('badges')
          .select('*');

        if (badgeError) {
          console.error('Error fetching badges:', badgeError);
          setIsLoading(false);
          return;
        }

        // Get user's earned badges
        const { data: userBadges, error: userBadgeError } = await supabase
          .from('user_badges')
          .select('badge_id, awarded_at, progress')
          .eq('user_id', user.id);

        if (userBadgeError) {
          console.error('Error fetching user badges:', userBadgeError);
          setIsLoading(false);
          return;
        }

        // Create badge array, marking which ones are earned and their progress
        const userBadgeMap = (userBadges || []).reduce((acc, ub) => {
          // Check if badge is earned and its progress
          const isEarned = ub.awarded_at !== null;
          const progress = ub.progress !== null ? ub.progress : (isEarned ? 100 : 0);
          
          // Format awarded time to YYYY-MM-DD format
          let formattedAwardedAt: string | undefined = undefined;
          if (ub.awarded_at) {
            formattedAwardedAt = new Date(ub.awarded_at).toISOString().split('T')[0];
          }
          
          acc[ub.badge_id] = { 
            earned: isEarned, 
            progress: progress,
            awardedAt: formattedAwardedAt
          };
          return acc;
        }, {} as Record<string, { earned: boolean; progress: number; awardedAt: string | undefined }>);
        
        // If no badge data, show empty state
        if (!allBadges || allBadges.length === 0) {
          setBadges([]);
          setUserTotalBadges({
            earned: 0,
            total: 0
          });
        } else {
          const formattedBadges = allBadges.map(badge => {
            const userBadgeInfo = userBadgeMap[badge.id] || { earned: false, progress: 0, awardedAt: undefined };
            return {
              id: badge.id,
              name: badge.name,
              type: badge.category as CategoryType,
              description: badge.description || 'Complete specific challenges to unlock this achievement!',
              imageUrl: badge.icon_url,
              progress: userBadgeInfo.progress,
              earned: userBadgeInfo.earned,
              awardedAt: userBadgeInfo.awardedAt
            };
          });

          setUserTotalBadges({
            earned: Object.keys(userBadgeMap).filter(key => userBadgeMap[key].earned).length,
            total: allBadges.length
          });

          setBadges(formattedBadges);
        }
      } catch (error) {
        console.error('Error fetching badge data:', error);
        setBadges([]);
        setUserTotalBadges({
          earned: 0,
          total: 0
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchBadges();
  }, []);

  // Render badge group of the same type
  const renderBadgeGroup = (type: CategoryType, title: string, icon: string) => {
    // Filter badges by current active category
    const filteredBadges = activeCategory === 'all'
      ? badges.filter(badge => badge.type === type)
      : badges.filter(badge => badge.type === activeCategory && badge.type === type);
    
    if (activeCategory !== 'all' && activeCategory !== type) {
      return null;
    }

    // If no badge data, don't show this group
    if (badges.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor(type) }]}>
            <FontAwesome5 
              name={getIconNameForType(icon)} 
              size={14} 
              color="white"
              solid
            />
          </View>
          <Text style={styles.sectionTitle}>{title} Reward</Text>
        </View>
        
        <View style={styles.badgesGrid}>
          {filteredBadges.length > 0 ? (
            filteredBadges.map((badge) => (
              <BadgeItem
                key={badge.id}
                title={badge.name}
                imageUrl={badge.imageUrl}
                progress={badge.progress}
                unlocked={badge.earned}
                onPress={() => handleBadgePress(badge)}
              />
            ))
          ) : (
            // If no badges in this category, show empty state
            <Text style={styles.emptyStateText}>No {title} achievement badges yet</Text>
          )}
        </View>
      </View>
    );
  };

  const handleBadgePress = (badge: BadgeData) => {
    setSelectedBadge(badge);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const getIconNameForType = (type: string): string => {
    return type;
  };

  const getIconBackgroundColor = (type: CategoryType): string => {
    switch (type) {
      case 'drawing':
        return '#FFD166'; // Yellow
      case 'cartoon':
        return '#FF6B6B'; // Red
      case 'course':
        return '#4ECDC4'; // Cyan
      case 'reading':
        return '#FF6B6B'; // Red
      default:
        return '#718096'; // Gray
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ImageBackground
        source={require('../assets/images/reward_background.jpg')}
        style={styles.background}
        imageStyle={{ opacity: 0.5 }}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={28} color="#E5911B" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Achievements</Text>
            </View>
            <View style={styles.badgeCounter}>
              <Text style={styles.badgeCountText}>
                {userTotalBadges.earned}/{userTotalBadges.total}
              </Text>
              <Ionicons name="trophy" size={16} color="#FFD166" />
            </View>
          </View>
          
          {/* Category tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContainer}
          >
            <View style={styles.categoryContainer}>
              <TouchableOpacity 
                style={[
                  styles.categoryTab, 
                  activeCategory === 'all' && styles.activeCategoryTab
                ]}
                onPress={() => setActiveCategory('all')}
              >
                <Text style={[
                  styles.categoryText, 
                  activeCategory === 'all' && styles.activeCategoryText
                ]}>All</Text>
              </TouchableOpacity>
              

              <TouchableOpacity 
                style={[
                  styles.categoryTab, 
                  activeCategory === 'drawing' && styles.activeCategoryTab
                ]}
                onPress={() => setActiveCategory('drawing')}
              >
                <Text style={[
                  styles.categoryText, 
                  activeCategory === 'drawing' && styles.activeCategoryText
                ]}>Drawing</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.categoryTab, 
                  activeCategory === 'cartoon' && styles.activeCategoryTab
                ]}
                onPress={() => setActiveCategory('cartoon')}
              >
                <Text style={[
                  styles.categoryText, 
                  activeCategory === 'cartoon' && styles.activeCategoryText
                ]}>Cartoon</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.categoryTab, 
                  activeCategory === 'course' && styles.activeCategoryTab
                ]}
                onPress={() => setActiveCategory('course')}
              >
                <Text style={[
                  styles.categoryText, 
                  activeCategory === 'course' && styles.activeCategoryText
                ]}>Course</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.categoryTab, 
                  activeCategory === 'reading' && styles.activeCategoryTab
                ]}
                onPress={() => setActiveCategory('reading')}
              >
                <Text style={[
                  styles.categoryText, 
                  activeCategory === 'reading' && styles.activeCategoryText
                ]}>Reading</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          {badges.length === 0 ? (
            // Empty state content
            <View style={styles.emptyStateContainer}>
              <FontAwesome5 name="trophy" size={50} color="#E2E8F0" />
              <Text style={styles.emptyStateTitle}>No Achievement Badges</Text>
              <Text style={styles.emptyStateDescription}>
                There are no badge data in the database. Please add badge data first!
              </Text>
            </View>
          ) : (
            // Badge content
            <ScrollView 
              style={styles.content} 
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContainer}
            >
              <View style={styles.badgeSectionsWrapper}>
                {renderBadgeGroup('drawing', 'Drawing', 'paint-brush')}
                {renderBadgeGroup('cartoon', 'Cartoon', 'film')}
                {renderBadgeGroup('course', 'Course', 'book')}
                {renderBadgeGroup('reading', 'Reading', 'book-reader')}
              </View>
              <View style={{ height: 20 }} />
            </ScrollView>
          )}
          
          {/* Badge detail modal */}
          {selectedBadge && (
            <BadgeDetailModal
              visible={modalVisible}
              title={selectedBadge.name}
              description={selectedBadge.description}
              imageUrl={selectedBadge.imageUrl}
              progress={selectedBadge.progress}
              unlocked={selectedBadge.earned}
              awardedAt={selectedBadge.awardedAt}
              onClose={handleCloseModal}
            />
          )}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'absolute',
    left: 0,
  },
  headerTitle: {
    fontSize: 24,
    color: '#E5911B',
    textAlign: 'center',
    fontFamily: Platform.select({
        ios: 'Chalkboard SE',
        android: 'monospace',
    }),
  },
  badgeCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    position: 'absolute',
    right: 16,
  },
  badgeCountText: {
    fontSize: 16,
    fontWeight: Platform.select({
      ios: '600',
      android: 'normal',
    }),
    fontFamily: Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
    }),
    color: '#333',
  },
  categoryScrollContainer: {
    paddingHorizontal: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  categoryTab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    height:43,
    
  },
  activeCategoryTab: {
    backgroundColor: '#FF6B6B',
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'Chalkboard SE',
      android: 'monospace',
  })
  },
  activeCategoryText: {
    color: 'white',
  },
  content: {
    height: '90%',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  badgeSectionsWrapper: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  sectionContainer: {
    marginBottom: 0,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#E5911B',
    marginLeft: 8,
    fontFamily: Platform.select({
      ios: 'Chalkboard SE',
      android: 'monospace',
  })
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    padding: 10,
    width: '100%',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: '80%',
  },
});
