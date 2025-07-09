// This file sets up an authentication provider using Supabase and React Context. 
// It keeps the user logged in if they logged in and checks if they are logged in. 

// app/providers/AuthProvider.tsx or context/AuthProvider.tsx
import React, { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';

const AuthContext = createContext<{ session: Session | null }>({ session: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get the current session on app start
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        router.replace('/'); // Redirect to home if session exists
      }
    });

    // Listen for changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
