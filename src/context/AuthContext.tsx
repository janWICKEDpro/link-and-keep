
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import supabase from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { cleanupAuthState } from '@/lib/authUtils';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);

        // Use setTimeout to defer additional data fetching to prevent deadlocks
        if (newSession?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            // Additional user data could be fetched here if needed
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clean up existing auth state
      cleanupAuthState();
      
      // // Attempt global sign out first
      // try {
      //   await supabase.auth.signOut({ scope: 'global' });
      // } catch (err) {
      //   // Continue even if this fails
      // }
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      toast.success('Signed in successfully');
       navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      console.error('Error signing in:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password - updated to not require email verification
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      
      // Clean up existing auth state
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success('Account created successfully! Signing you in...');
        // Auto-sign in after successful registration
        await signIn(email, password);
      } else {
        toast.error('Something went wrong during signup');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
      console.error('Error signing up:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clean up auth state first
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      toast.success('Signed out successfully');
      
      // Use window.location for a clean refresh after sign out
      window.location.href = '/login';
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
