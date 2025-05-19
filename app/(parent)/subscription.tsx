import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/Supabase';
import { useSession } from '@supabase/auth-helpers-react';
import { getUserIdSafe } from '@/utils/userHelpers';

const PLAN_FEATURES: Record<string, string[]> = {
  'basic': [
    'Access first 2 books in each category',
    'AI chat up to 3 times daily',
    'Unlock 3 educational mini-games',
  ],
  'standard': [
    'Unlimited book access',
    'AI chat up to 10 times daily with voice',
    'All educational games unlocked',
    'Daily learning progress reports',
  ],
  'premium': [
    'Unlimited book access',
    'Unlimited AI chat (voice enhanced)',
    'All games + new content weekly',
    'Personalized recommendations',
    'Weekly parent reports & analytics',
  ],
};

export default function SubscriptionPage() {
  const router = useRouter();
  const session = useSession();
  const [subInfo, setSubInfo] = useState<{
    plan: string;
    sub_started_at: number;
    sub_ends_at: number;
  } | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        if (!session) {
          console.warn('⚠️ 无法获取会话信息');
          return;
        }

        // 打印 session 信息
        console.log('✅ Session:', session);

        const userId = session?.user?.id;
        if (!userId) {
          console.warn('⚠️ 无用户 ID');
          return;
        }

        console.log('🟢 当前用户 ID:', userId);

        // 调整数据库查询：检查是否为 plan 或 sub_plan
        const { data, error } = await supabase
          .from('sub')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        console.log('🔥 SUB RESULT:', data);

        if (error) {
          console.warn('❌ 查询出错:', error);
          return;
        }

        if (!data) {
          console.warn('❌ 没有找到订阅记录');
          return;
        }

        // 使用正确的字段名称：plan 或 sub_plan
        const plan = data.plan?.trim() || data.sub_plan?.trim() || 'basic';
        console.log('🟢 订阅计划:', plan);

        const cleaned = {
          ...data,
          plan: plan,
        };

        const now = Math.floor(Date.now() / 1000);
        if (cleaned.sub_started_at <= now && cleaned.sub_ends_at >= now) {
          setSubInfo(cleaned);
          const diffSeconds = cleaned.sub_ends_at - now;
          setDaysLeft(Math.ceil(diffSeconds / (60 * 60 * 24)));
        } else {
          setSubInfo(null);
        }
      } catch (err) {
        console.error('❌ 异常捕获:', err);
      }
    };

    fetchSub();
  }, [session]);

  const formatDate = (unix: number) =>
    new Date(unix * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  return (
    <ImageBackground
      source={require('@/assets/images/subscription-bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>

        <Text style={styles.header}>🎁 Subscription</Text>

        {subInfo ? (
          <View style={styles.card}>
            <Text style={styles.status}>✅ Subscribed</Text>
            <Text style={styles.detail}>Current Plan: {subInfo.plan}</Text>
            <Text style={styles.detail}>Valid From: {formatDate(subInfo.sub_started_at)}</Text>
            <Text style={styles.detail}>Expires On: {formatDate(subInfo.sub_ends_at)}</Text>

            <View style={styles.featuresSection}>
              {PLAN_FEATURES[subInfo.plan]?.map((feature, idx) => (
                <Text key={idx} style={styles.featureText}>• {feature}</Text>
              ))}
            </View>

            {daysLeft !== null && daysLeft <= 7 && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.expireNotice}>
                  ⏰ Your subscription expires in {daysLeft} day{daysLeft > 1 ? 's' : ''}.
                </Text>
                <TouchableOpacity
                  style={styles.subscribeButton}
                  onPress={() => router.push('/(parent)/subscriptionPlans')}
                >
                  <Text style={styles.buttonText}>Renew Plan</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              ❌ You don’t have an active subscription.
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(parent)/subscriptionPlans')}
              style={styles.subscribeButton}
            >
              <Text style={styles.buttonText}>View Subscription Plans</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  backButton: {
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#E5911B',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffffcc',
    elevation: 2,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2e7d32',
  },
  detail: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  featuresSection: {
    marginTop: 12,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#c8e6c9',
  },
  featureText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 4,
  },
  expireNotice: {
    fontSize: 15,
    color: '#d84315',
    marginBottom: 8,
  },
  subscribeButton: {
    backgroundColor: '#FFB300',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
});
