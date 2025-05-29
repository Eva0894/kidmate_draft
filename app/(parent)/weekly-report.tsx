import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/Supabase';

type UsageRecord = {
  usage_date: string;
  used_seconds: number;
};

export default function WeeklyReportPage() {
  const router = useRouter();
  const [records, setRecords] = useState<UsageRecord[]>([]);

  useEffect(() => {
    const fetchUsageRecords = async () => {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (!user || userErr) {
        console.warn('⚠️ 获取用户失败:', userErr);
        return;
      }

      // ✅ 可选：检查是否存在订阅记录（不再区分 plan 类型）
      const { data: sub, error: subErr } = await supabase
        .from('sub')
        .select('sub_ends_at')
        .eq('user_id', user.id)
        .maybeSingle();

      const isSubscribed =
        sub?.sub_ends_at &&
        new Date(sub.sub_ends_at * 1000) > new Date();

      if (!isSubscribed) {
        Alert.alert(
          'Subscription Required',
          'Please subscribe to access usage records.',
          [
            {
              text: 'Go to Subscribe',
              onPress: () => router.replace('/(parent)/subscription'),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      // ✅ 计算本周周一
      const today = new Date();
      const day = today.getDay(); // 周日为 0，周一为 1
      const diff = day === 0 ? -6 : 1 - day;
      const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
      monday.setHours(0, 0, 0, 0);
      const mondayISO = monday.toISOString().split('T')[0];

      console.log('🟡 当前用户 ID:', user.id);
      console.log('📅 本周周一为:', mondayISO);

      try {
        const res = await fetch(`https://weekly-report-server-2aw8trm90-songs-projects-44ad46d2.vercel.app/api/time-report?userId=${user.id}`);
        const allRecords = await res.json();

        const filtered = allRecords
          .filter((r: any) => r.date >= mondayISO)
          .map((r: any) => ({
            usage_date: r.date,
            used_seconds: r.duration_minutes * 60,
          }));

        console.log('✅ 本周记录:', filtered);
        setRecords(filtered);
      } catch (error) {
        console.error('❌ 获取 usageRecords 出错:', error);
      }
    };

    fetchUsageRecords();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="#E5911B" />
      </TouchableOpacity>

      <Text style={styles.header}>This Week's Usage</Text>

      <View style={styles.cardGroup}>
        {records.length === 0 ? (
          <Text style={styles.noRecord}>No usage records this week.</Text>
        ) : (
          records.map((r, i) => (
            <ReportCard
              key={i}
              title={r.usage_date}
              value={`${Math.floor(r.used_seconds / 3600)}h ${Math.floor((r.used_seconds % 3600) / 60)}m`}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function ReportCard({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8EC',
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5911B',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',
    }),
  },
  cardGroup: {
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',
    }),
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E5911B',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',
    }),
  },
  noRecord: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
});
