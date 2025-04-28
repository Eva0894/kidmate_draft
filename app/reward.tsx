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

// 类型定义
export type CategoryType = 'all' | 'game' | 'drawing' | 'cartoon' | 'course' | 'reading';

// 更新徽章数据接口
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
        // 获取当前用户
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error('用户未登录');
          setIsLoading(false);
          return;
        }

        // 从 supabase 获取所有徽章
        const { data: allBadges, error: badgeError } = await supabase
          .from('badges')
          .select('*');

        if (badgeError) {
          console.error('获取徽章错误:', badgeError);
          setIsLoading(false);
          return;
        }

        // 获取用户已获得的徽章
        const { data: userBadges, error: userBadgeError } = await supabase
          .from('user_badges')
          .select('badge_id, awarded_at, progress')
          .eq('user_id', user.id);

        if (userBadgeError) {
          console.error('获取用户徽章错误:', userBadgeError);
          setIsLoading(false);
          return;
        }

        // 创建徽章数组，标记哪些已获取及进度
        const userBadgeMap = (userBadges || []).reduce((acc, ub) => {
          // 确认徽章是否已获得，以及进度
          const isEarned = ub.awarded_at !== null;
          const progress = ub.progress !== null ? ub.progress : (isEarned ? 100 : 0);
          
          // 格式化授予时间为YYYY-MM-DD格式
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
        
        // 如果没有任何徽章数据，显示空状态
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
              description: badge.description || '完成特定挑战解锁此成就！',
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
        console.error('获取徽章数据出错:', error);
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

  // 渲染具有相同类型的徽章分组
  const renderBadgeGroup = (type: CategoryType, title: string, icon: string) => {
    // 根据当前活动分类过滤徽章
    const filteredBadges = activeCategory === 'all'
      ? badges.filter(badge => badge.type === type)
      : badges.filter(badge => badge.type === activeCategory && badge.type === type);
    
    if (activeCategory !== 'all' && activeCategory !== type) {
      return null;
    }

    // 如果当前没有徽章数据，不显示该分组
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
            // 如果该类别没有徽章，显示空状态
            <Text style={styles.emptyStateText}>暂无{title}类成就徽章</Text>
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

  // 处理徽章进度更新
  const handleUpdateProgress = (newProgress: number) => {
    if (!selectedBadge) return;
    
    updateBadgeProgress(selectedBadge.id, newProgress);
  };

  // 更新徽章进度的函数
  const updateBadgeProgress = async (badgeId: string, progress: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('用户未登录');
        return;
      }
      
      // 检查是否已存在用户徽章关联
      const { data: existingBadges } = await supabase
        .from('user_badges')
        .select('id, progress')
        .eq('user_id', user.id)
        .eq('badge_id', badgeId)
        .maybeSingle();
      
      let result;
      let awardedAtDate: string | undefined = undefined;
      
      // 如果进度达到100%，设置当前日期作为授予日期
      if (progress >= 100) {
        const now = new Date();
        awardedAtDate = now.toISOString().split('T')[0];
      }
      
      if (existingBadges) {
        // 更新已有进度
        result = await supabase
          .from('user_badges')
          .update({ 
            progress: progress,
            // 如果进度达到100%，设置awarded_at字段
            ...(progress >= 100 ? { awarded_at: new Date().toISOString() } : {})
          })
          .eq('id', existingBadges.id);
      } else {
        // 创建新的用户徽章关联
        result = await supabase
          .from('user_badges')
          .insert({ 
            user_id: user.id, 
            badge_id: badgeId, 
            progress: progress,
            // 如果进度达到100%，设置awarded_at字段
            ...(progress >= 100 ? { awarded_at: new Date().toISOString() } : {})
          });
      }
      
      if (result.error) {
        console.error('更新徽章进度失败:', result.error);
      } else {
        // 更新本地状态
        setBadges(prev => 
          prev.map(b => 
            b.id === badgeId 
              ? { ...b, progress, earned: progress >= 100, awardedAt: progress >= 100 ? awardedAtDate : undefined } 
              : b
          )
        );
        
        // 更新selectedBadge状态，确保在详情弹窗中显示的也是最新数据
        if (selectedBadge && selectedBadge.id === badgeId) {
          setSelectedBadge({
            ...selectedBadge,
            progress,
            earned: progress >= 100,
            awardedAt: progress >= 100 ? awardedAtDate : undefined
          });
        }
        
        // 如果进度达到100%且之前未解锁，更新总计数
        if (progress >= 100 && selectedBadge && selectedBadge.id === badgeId && !selectedBadge.earned) {
          setUserTotalBadges(prev => ({
            ...prev,
            earned: prev.earned + 1
          }));
        }
      }
    } catch (error) {
      console.error('处理徽章进度更新时出错:', error);
    }
  };

  const getIconNameForType = (type: string): string => {
    return type;
  };

  const getIconBackgroundColor = (type: CategoryType): string => {
    switch (type) {
      case 'game':
        return '#4ECDC4'; // 青色
      case 'drawing':
        return '#FFD166'; // 黄色
      case 'cartoon':
        return '#FF6B6B'; // 红色
      case 'course':
        return '#4ECDC4'; // 青色
      case 'reading':
        return '#FF6B6B'; // 红色
      default:
        return '#718096'; // 灰色
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
          {/* 头部 */}
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
          
          {/* 分类标签 */}
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
                  activeCategory === 'game' && styles.activeCategoryTab
                ]}
                onPress={() => setActiveCategory('game')}
              >
                <Text style={[
                  styles.categoryText, 
                  activeCategory === 'game' && styles.activeCategoryText
                ]}>Game</Text>
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
            // 空状态内容
            <View style={styles.emptyStateContainer}>
              <FontAwesome5 name="trophy" size={50} color="#E2E8F0" />
              <Text style={styles.emptyStateTitle}>暂无成就徽章</Text>
              <Text style={styles.emptyStateDescription}>
                当前数据库中没有任何徽章数据。请先添加徽章数据！
              </Text>
            </View>
          ) : (
            // 徽章内容
            <ScrollView 
              style={styles.content} 
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContainer}
            >
              <View style={styles.badgeSectionsWrapper}>
                {renderBadgeGroup('game', 'Game', 'gamepad')}
                {renderBadgeGroup('drawing', 'Drawing', 'paint-brush')}
                {renderBadgeGroup('cartoon', 'Cartoon', 'film')}
                {renderBadgeGroup('course', 'Course', 'book')}
                {renderBadgeGroup('reading', 'Reading', 'book-reader')}
              </View>
              <View style={{ height: 20 }} />
            </ScrollView>
          )}
          
          {/* 徽章详情模态框 */}
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
              onUpdateProgress={handleUpdateProgress}
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
        android: 'casual',
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
      android: 'casual',
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
      android: 'casual',
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
