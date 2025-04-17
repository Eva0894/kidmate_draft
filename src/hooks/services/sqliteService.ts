// import { type Database } from 'expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

type SQLiteDB = ReturnType<typeof openDatabaseSync>;


export const initTables = async (db: SQLiteDB) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS local_ai_interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      response TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      chat_type TEXT,
      tags TEXT,
      synced BOOLEAN DEFAULT 0
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS local_analyzed_chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      summary TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      synced BOOLEAN DEFAULT 0
    );
  `);
};

// AI Interactions
export const insertInteraction = async (
  db: SQLiteDB,
  message: string,
  response: string,
  chat_type?: string,
  tags?: string
) => {
  await db.runAsync(
    `INSERT INTO local_ai_interactions (message, response, chat_type, tags, synced) VALUES (?, ?, ?, ?, 0)`,
    [message, response, chat_type ?? null, tags ?? null]
  );
};

export const getUnsyncedInteractions = async (db: SQLiteDB) => {
  return await db.getAllAsync('SELECT * FROM local_ai_interactions WHERE synced = 0');
};

export const markInteractionAsSynced = async (db: SQLiteDB, id: number) => {
  await db.runAsync('UPDATE local_ai_interactions SET synced = 1 WHERE id = ?', [id]);
};

// Analyzed Chats
export const insertAnalyzedChat = async (
  db: SQLiteDB,
  title: string,
  summary: string
) => {
  await db.runAsync(
    `INSERT INTO local_analyzed_chats (title, summary, synced) VALUES (?, ?, 0)`,
    [title, summary]
  );
};

export const getUnsyncedAnalyzedChats = async (db: SQLiteDB) => {
  return await db.getAllAsync('SELECT * FROM local_analyzed_chats WHERE synced = 0');
};

export const markAnalyzedChatAsSynced = async (db: SQLiteDB, id: number) => {
  await db.runAsync('UPDATE local_analyzed_chats SET synced = 1 WHERE id = ?', [id]);
};
