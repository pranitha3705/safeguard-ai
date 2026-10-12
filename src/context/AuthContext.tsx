import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  enableDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'usr-demo-771',
  email: 'victim_safety_advocate@safeguard.demo',
  full_name: 'Alex Rivera',
  phone: '+1 (555) 019-2831',
  created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    // Check if demo mode was previously active
    const savedDemo = localStorage.getItem('safeguard_demo_mode');
    if (savedDemo === 'true') {
      setUser(DEMO_USER);
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    if (!isConfigured) {
      // By default if Supabase isn't configured, allow easy demo mode
      setLoading(false);
      return;
    }

    // Live Supabase Auth check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            created_at: session.user.created_at,
          });
        }
      } catch (err) {
        console.error('Session load error', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          created_at: session.user.created_at,
        });
        setIsDemoMode(false);
        localStorage.removeItem('safeguard_demo_mode');
      } else if (!isDemoMode) {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signIn = async (email: string, password: string) => {
    if (!isConfigured) {
      // Automatic demo fallback for seamless beginners experience
      setUser({
        id: 'usr-local-test',
        email,
        full_name: email.split('@')[0],
        created_at: new Date().toISOString(),
      });
      setIsDemoMode(true);
      localStorage.setItem('safeguard_demo_mode', 'true');
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          created_at: data.user.created_at,
        });
        setIsDemoMode(false);
        localStorage.removeItem('safeguard_demo_mode');
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isConfigured) {
      setUser({
        id: 'usr-local-' + Date.now(),
        email,
        full_name: fullName || email.split('@')[0],
        created_at: new Date().toISOString(),
      });
      setIsDemoMode(true);
      localStorage.setItem('safeguard_demo_mode', 'true');
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          full_name: fullName,
          created_at: data.user.created_at,
        });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registration failed' };
    }
  };

  const signOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsDemoMode(false);
    localStorage.removeItem('safeguard_demo_mode');
  };

  const enableDemoMode = () => {
    setUser(DEMO_USER);
    setIsDemoMode(true);
    localStorage.setItem('safeguard_demo_mode', 'true');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        isConfigured,
        signIn,
        signUp,
        signOut,
        enableDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
