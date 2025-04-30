import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/utils/Supabase';

interface UserContextType {
  userId: string | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  userId: null,
  loading: true,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          if (error.name !== 'AuthSessionMissingError') {
            console.error('Error fetching user:', error);
          }
          setUserId(null);
        } else if (user) {
          setUserId(user.id);
        }
      } catch (e) {
        console.error('Unexpected error in fetchUser:', e);
      } finally {
        setLoading(false);ß
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ userId, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);