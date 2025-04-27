import { useRootNavigationState, useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/Supabase';
import { ActivityIndicator } from 'react-native';



export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const navReady = useRootNavigationState();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!navReady?.key) return; 

      if (user) {
        setAuthenticated(true);
      } else {
        router.replace('../app/chat'); 
      }

      setChecking(false);
    };

    checkAuth();
  }, [navReady]); 

  if (checking) {
    return <ActivityIndicator />;
  }

  return <>{authenticated ? children : null}</>;
}
