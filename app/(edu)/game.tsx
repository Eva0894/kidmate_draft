import React, { useEffect , useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';

import { supabase } from '@/utils/Supabase';
import dayjs from 'dayjs'; 
import { Image } from 'react-native';
import { Platform } from 'react-native';
export default function GameCenterPage() {
  const router = useRouter();
  const [totalToday, setTotalToday] = useState(0);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [showProfile, setShowProfile] = useState(false);
  useEffect(() => {
    
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
    lockOrientation();
  
  }, []);

  const games = [
    { title: 'Flappy Bird', path: '/(games)/flappy',image: require('@/assets/images/flappy.png'), }, 
    { title: 'Railroad Repair Reboot', path: '/(games)/railroad', image: require('@/assets/images/railway.png'), },
    { title: 'guessFeeling', path: '/(games)/guessFeeling',image: require('@/assets/images/guessfeeling.png'), },
    { title: 'Bridge Builder', path: '/(games)/bridgebuilder',image: require('@/assets/images/bridgebuilder.png'), },
    
    { title: 'bob-dog', path: '/(games)/bobdogiframe',image: require('@/assets/images/bobdog.png'), },
    { title: 'Dominoes', path: '/(games)/dominoes',image: require('@/assets/images/dominoes.png'),},
    { title: 'Watts of Trouble', path: '/(games)/Watts_of_Trouble',image: require('@/assets/images/watts.png'),},
    { title: 'Sorting Box', path: '/(games)/sortingBox',image: require('@/assets/images/sort.png'),},
    { title: '3 2 1 Snack', path: '/(games)/321snack',image: require('@/assets/images/321snack.png'), },
    { title: 'Track Stars', path: '/(games)/trackStars',image: require('@/assets/images/trackstar.png'),},
  ];
 
   useEffect(() => {
      const fetchAvatarAndStudyTime = async () => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError.message);
          return;
        }
  
        const userId = session?.user.id;
        if (!userId) return;
  
        const { data: avatarData } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('user_id', userId)
          .single();
        
        if (avatarData) {
          setAvatarUrl(avatarData.avatar_url || null);
        }
  
        const today = dayjs().startOf('day').toISOString();
        const { data: studyData } = await supabase
          .from('study_log')
          .select('duration_sec')
          .gte('created_at', today);
  
        if (studyData) {
          const total = studyData.reduce((sum, row) => sum + row.duration_sec, 0);
          setTotalToday(total);
        }
      };
  
      fetchAvatarAndStudyTime();
    }, []);
  
    const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  
  return (
    
    
    <View style={styles.container}>
      
      {/* 返回按钮 */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/eduPage')}>
        <Ionicons name="arrow-back" size={28} color="#E5911B" />
        </TouchableOpacity>
          
        <Text style={styles.title}>🎮 Game Zone</Text>
            <ScrollView contentContainerStyle={styles.grid}>
              {games.map((game, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.card}
                  onPress={() => router.push(game.path as never)}
                >
                  <Image source={game.image} style={styles.cover} resizeMode="cover" />
                  <Text style={styles.cardText}>{game.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );
      } 

const styles = StyleSheet.create({
  cover: {
    width: '100%',
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  backText: {
    color: '#e67e22',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 6,
  },
  container: {
    flex: 1,
    backgroundColor: '#fffaf2',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5911B',
    alignSelf: 'center',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    alignSelf: 'center',
    marginBottom: 20,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#fff4e6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5911B',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 16,
    fontFamily: Platform.select({
      ios: 'ChalkboardSE-Regular',
      android: 'monospace',}),
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ccc' },
});