import * as SQLite from 'expo-sqlite';
// import { SQLiteProvider } from './SQLiteContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './ThemeContext';
import AuthGate from './AuthGate'; 
import { UserProvider } from './UserContext';
// import { initLocalDB } from '../utils/localDB';
import { SQLiteProvider } from './SQLiteContext';
import React, { useEffect, useState } from 'react';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/utils/Supabase';



// useEffect(() => {
//   initLocalDB();
// }, []);

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
       <SessionContextProvider supabaseClient={supabase}>
        <ThemeProvider>
          <UserProvider>
            {children}  
          </UserProvider>
        </ThemeProvider>
       </SessionContextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
