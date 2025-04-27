// scripts/send-push.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 URL:', SUPABASE_URL);
console.log('🔐 Key:', SUPABASE_SERVICE_ROLE_KEY?.slice(0, 6) + '...'); 

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendPushNotifications() {
  const { data: users, error } = await supabase
    .from('users')
    .select('expo_push_token')
    .not('expo_push_token', 'is', null);

  if (error) {
    console.error('❌ Failed to fetch tokens:', error.message);
    return;
  }

  const messages = users.map((user) => ({
    to: user.expo_push_token,
    sound: 'default',
    title: '🧠 New Course Available!',
    body: 'Check out the new Math course just added!',
    data: { screen: 'course' },
  }));

  const { data: pingData, error: pingError } = await supabase.from('users').select('*').limit(1);
  console.log('📡 Ping result:', pingData, pingError);

  const chunks = chunkArray(messages, 100); // Expo最多每次发送100条

  for (const chunk of chunks) {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chunk),
    });

    const result = await response.json();
    console.log('✅ Push response:', result);
  }
}

function chunkArray(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

sendPushNotifications();