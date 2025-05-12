import { supabase } from '@/utils/Supabase';
import { v4 as uuidv4 } from 'uuid';
import { Alert } from 'react-native';

// 读书成就的徽章ID（从CSV数据中获取）
const READING_BADGE_IDS = {
  FIRST_READING: '2cacf31a-5f9c-4a00-be4b-e6e4d0700415',  // 第一本书
  READING_LEARNER: '964866cc-92f9-44b7-8f24-7e3111abb592', // 读5本书
  BOOK_COLLECTOR: 'f3720eda-5761-4bea-8971-9821e4aa7948',  // 读10本书
  READING_MASTER: 'ad2afc4d-eb66-409b-9b09-ecdc8e14707b',  // 读20本书
  READING_LEGEND: 'd43dfee3-77d2-43bc-818b-102511004577'   // 读50本书
};

// 阅读徽章需求数量
const READING_BADGE_REQUIREMENTS = {
  [READING_BADGE_IDS.FIRST_READING]: 1,
  [READING_BADGE_IDS.READING_LEARNER]: 5,
  [READING_BADGE_IDS.BOOK_COLLECTOR]: 10,
  [READING_BADGE_IDS.READING_MASTER]: 20,
  [READING_BADGE_IDS.READING_LEGEND]: 50
};

// 记录书籍完成状态并更新成就
export const trackBookCompletion = async (userId: string, bookId: string) => {
  try {
    // 1. 检查该阅读记录是否已存在
    const { data: existingRecord, error: checkError } = await supabase
      .from('user_completed_books')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ check reading Record failed:', checkError.message);
      return;
    }
    
    // 如果记录不存在，则添加新记录
    if (!existingRecord) {
      const { error } = await supabase
        .from('user_completed_books')
        .insert({
          id: uuidv4(),
          user_id: userId,
          book_id: bookId,
          completed_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('❌ add reading Record failed:', error.message);
        return;
      }
      
      console.log('✅ add reading Record success');
      
      // 更新阅读成就
      await updateReadingAchievements(userId);
    }
  } catch (error) {
    console.error('track reading Record failed:', error);
  }
};

// 更新阅读成就
export const updateReadingAchievements = async (userId: string) => {
  try {
    // 1. 获取用户已完成的书籍总数
    const { data: booksData, error: booksError } = await supabase
      .from('user_completed_books')
      .select('id')
      .eq('user_id', userId);
      
    if (booksError) {
      console.error('❌ get user reading history failed:', booksError.message);
      return;
    }
    
    // 计算用户已完成阅读的书籍数量
    const completedBooksCount = booksData ? booksData.length : 0;
    
    console.log(`👀 The user has completed reading ${completedBooksCount} books`);
    
    // 2. 获取所有阅读类型的成就
    const { data: badges, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('category', 'reading');
      
    if (badgeError) {
      console.error('❌ get reading achievement list failed:', badgeError.message);
      return;
    }

    // 新解锁的徽章列表
    const newUnlockedBadges: string[] = [];
    
    // 3. 更新每个成就的进度
    for (const badge of badges) {
      // 获取徽章要求的阅读数量
      let requirement = READING_BADGE_REQUIREMENTS[badge.id] || 1;
      
      // 计算进度百分比 (上限100%)
      const progress = Math.min(Math.floor((completedBooksCount / requirement) * 100), 100);
      const isEarned = completedBooksCount >= requirement;
      
      // 检查用户是否已有该徽章记录
      const { data: userBadge, error: userBadgeError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .eq('badge_id', badge.id)
        .maybeSingle();
      
      // 如果查询出错(非未找到的错误)，则跳过此徽章
      if (userBadgeError && userBadgeError.code !== 'PGRST116') {
        console.error(`❌ get user badge failed (${badge.name}):`, userBadgeError.message);
        continue;
      }
      
      // 如果徽章已获得，则跳过
      if (userBadge && userBadge.awarded_at !== null) {
        continue;
      }
      
      let badgeUpdateError = null;
      
      // 根据是否已有记录决定更新还是插入
      if (userBadge) {
        // 更新现有记录
        const { error } = await supabase
          .from('user_badges')
          .update({
            progress: progress,
            awarded_at: isEarned ? new Date().toISOString() : null
          })
          .eq('id', userBadge.id);
        
        badgeUpdateError = error;
      } else {
        // 插入新记录
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
        console.error(`❌ update badge progress failed (${badge.name}):`, badgeUpdateError.message);
      } else {
        console.log(`✅ badge "${badge.name}" progress updated to ${progress}%`);
        
        // 如果是新解锁的徽章，添加到列表
        if (isEarned && (!userBadge || userBadge.awarded_at === null)) {
          newUnlockedBadges.push(badge.name);
        }
      }
    }
    
    // 如果有新解锁的徽章，显示通知
    if (newUnlockedBadges.length > 0) {
      const badgeNames = newUnlockedBadges.join('、');
      
      // 创建更详细的成就解锁消息
      let message = `You have completed reading${completedBooksCount}books, and unlocked the following reading achievements:\n\n`;
      message += newUnlockedBadges.map(name => `🏆 ${name}`).join('\n');
      message += '\n\nContinue reading more books to unlock more achievements!';
      
      Alert.alert(
        '🎉 Congratulations on unlocking reading achievements!',
        message,
        [{ text: 'OK', style: 'default' }]
      );
    }
  } catch (error) {
    console.error('update reading achievement failed:', error);
  }
};

// 判断一本书是否已经完成阅读
export const isBookCompleted = async (userId: string, bookId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_completed_books')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') {
      console.error('❌ check book completed status failed:', error.message);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('check book completed status failed:', error);
    return false;
  }
}; 