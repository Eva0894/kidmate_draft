import React, { createContext, useContext, useEffect, useState } from 'react';
import { openDatabaseSync } from 'expo-sqlite';

export type SQLiteDB = ReturnType<typeof openDatabaseSync>;

const SQLiteContext = createContext<SQLiteDB | null>(null);

type SQLiteProviderProps = {
  children: React.ReactNode;
  databaseName?: string;
};

export const SQLiteProvider = ({ children, databaseName = 'app.db' }: SQLiteProviderProps) => {
  const [db, setDb] = useState<SQLiteDB | null>(null);

  useEffect(() => {
    const database = openDatabaseSync(databaseName);

    database.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    setDb(database);
  }, [databaseName]);

  if (!db) return null;

  return <SQLiteContext.Provider value={db}>{children}</SQLiteContext.Provider>;
};

export const useSQLiteContext = () => {
  const context = useContext(SQLiteContext);
  if (!context) {
    throw new Error('useSQLiteContext must be used within a <SQLiteProvider>');
  }
  return context;
};
