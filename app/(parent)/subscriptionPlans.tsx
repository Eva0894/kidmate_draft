import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/Supabase';
import { getUserIdSafe } from '../../utils/userHelpers';

export default function SubscriptionPlansPage() {
  const router = useRouter();
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchSubStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fixedId = getUserIdSafe(user.id);

      const { data, error } = await supabase
        .from('sub')
        .select('sub_ends_at')
        .eq('user_id', fixedId)
        .maybeSingle();

      if (data?.sub_ends_at) {
        const now = new Date();
        const end = new Date(data.sub_ends_at * 1000);
        setSubscribed(end > now);
      }
    };

    fetchSubStatus();
  }, []);

  const handleSubscribe = (plan: string) => {
    const stripeLinks: Record<string, string> = {
      'Standard Plan': 'https://buy.stripe.com/test_14AbJ184ig8U1Idbgy6J200',
      'Premium Plan (Yearly)': 'https://buy.stripe.com/eVa29fgkw1vAfGU9AC',
      'Premium Plan (Quarterly)': 'https://buy.stripe.com/dR63djfgs8Y266k5kn',
    };

    let selectedLink = '';
    if (plan === 'Premium Plan') {
      selectedLink = stripeLinks['Premium Plan (Yearly)'];
    } else {
      selectedLink = stripeLinks[plan];
    }

    if (selectedLink) {
      Linking.openURL(selectedLink);
    } else {
      Alert.alert('Payment link not found for selected plan.');
    }
  };

  const plans = [
    {
      name: 'Basic Plan',
      price: '$0 / month',
      color: '#8BC34A',
      features: [
        'Access first 2 books in each category',
        'AI chat available up to 3 times per day',
        'Unlock 3 educational mini-games',
        'Parental control enabled',
      ],
      selectable: false,
    },
    {
      name: 'Standard Plan',
      price: '¥9 / month',
      color: '#FFCA28',
      features: [
        'Unlimited access to all books',
        'AI chat up to 10 times daily (voice supported)',
        'All educational games unlocked',
        'Parental control enabled',
        'Daily learning progress reports',
      ],
      selectable: true,
    },
    {
      name: 'Premium Plan',
      price: '$25 / quarter or $88 / year',
      color: '#42A5F5',
      features: [
        'Unlimited access to all books',
        'Unlimited AI chat (with voice enhancements)',
        'All games + new content weekly',
        'Parental control + personalized recommendations',
        'Weekly parent reports + visual analytics',
      ],
      selectable: true,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 返回按钮（统一风格） */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#E5911B" />
      </TouchableOpacity>

      <Text style={styles.header}>🎁 Choose a Subscription Plan</Text>

      {plans.map((plan, index) => (
        <View key={index} style={[styles.card, { borderColor: plan.color }]}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planPrice}>{plan.price}</Text>
          {plan.features.map((feature, i) => (
            <Text key={i} style={styles.feature}>• {feature}</Text>
          ))}
          {plan.selectable && (
            <TouchableOpacity
              style={[styles.subscribeButton, { backgroundColor: plan.color }]}
              onPress={() => handleSubscribe(plan.name)}
            >
              <Text style={styles.buttonText}>Choose this Plan</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fffdf5',
    padding: 20,
    paddingBottom: 40,
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
    color: '#E5911B',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: Platform.select({
          ios: 'ChalkboardSE-Regular',
          android: 'monospace',
        }),
  },
  card: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',
    }),
  },
  planPrice: {
    fontSize: 16,
    marginBottom: 12,
    color: '#666',
    
  },
  feature: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',
    }),
  },
  subscribeButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',
    }),
  },
});


