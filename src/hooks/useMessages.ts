import { useEffect, useState, useCallback } from 'react';
import { useSQLiteContext } from '../../components/SQLiteContext';
import { insertInteraction } from './services/sqliteService';

interface Message {
  id?: number;
  message: string;
  response: string;
  timestamp?: string;
  chat_type?: string;
  tags?: string;
}

export const useMessages = () => {
  const db = useSQLiteContext();
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchMessages = useCallback(async () => {
    if (!db) return;
    // const rows = await db.getAllAsync('SELECT * FROM local_ai_interactions ORDER BY timestamp DESC');
    const rows = await db.getAllAsync('SELECT * FROM local_ai_interactions ORDER BY timestamp DESC') as Message[];
    setMessages(rows);
  }, [db]);

  const addMessage = useCallback(
    async (message: string, response: string, chat_type?: string, tags?: string) => {
      if (!db) return;
      await insertInteraction(db, message, response, chat_type, tags);
      await fetchMessages();
    },
    [db, fetchMessages]
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    addMessage,
    refreshMessages: fetchMessages,
  };
};
