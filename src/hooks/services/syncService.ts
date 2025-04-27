import { supabase } from '@/utils/Supabase';
import {
  getUnsyncedInteractions,
  getUnsyncedAnalyzedChats,
  markInteractionAsSynced,
  markAnalyzedChatAsSynced,
} from './sqliteService';
// import { type ReturnType } from 'expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';


export type SQLiteDB = ReturnType<typeof openDatabaseSync>;

// 定义类型
type InteractionRow = {
  id: number;
  message: string;
  response: string;
  timestamp: string;
  chat_type?: string;
  tags?: string;
};

type ChatRow = {
  id: number;
  title: string;
  summary: string;
  created_at: string;
};

export const syncToSupabase = async (db: SQLiteDB, userId: string) => {
  const unsyncedInteractions = await getUnsyncedInteractions(db);
  const unsyncedChats = await getUnsyncedAnalyzedChats(db);

  // Sync AI Interactions
  for (const item of unsyncedInteractions as InteractionRow[]) {
    const { error } = await supabase.from('ai_interactions').insert({
      user_id: userId,
      message: item.message,
      response: item.response,
      time: item.timestamp,
      chat_type: item.chat_type,
      tags: item.tags,
    });

    if (!error) {
      await markInteractionAsSynced(db, item.id);
    } else {
      console.warn(`❌ Failed to sync interaction ID ${item.id}:`, error.message);
    }
  }

  // Sync Analyzed Chats
  for (const chat of unsyncedChats as ChatRow[]) {
    const { error } = await supabase.from('analyzed_chats').insert({
      user_id: userId,
      title: chat.title,
      summary: chat.summary,
      created_at: chat.created_at,
    });

    if (!error) {
      await markAnalyzedChatAsSynced(db, chat.id);
    } else {
      console.warn(`❌ Failed to sync chat ID ${chat.id}:`, error.message);
    }
  }
};