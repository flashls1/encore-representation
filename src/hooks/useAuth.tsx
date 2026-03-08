import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; isAdmin?: boolean }>;
  signOut: () => Promise<{ error: any }>;
  checkAdminStatus: (userId?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async (userId?: string): Promise<boolean> => {
    const userIdToCheck = userId || user?.id;
    if (!userIdToCheck) {
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userIdToCheck,
        _role: 'admin'
      });

      if (error) {
        return false;
      }

      return data || false;
    } catch {
      return false;
    }
  };

  const updateAuthState = async (session: Session | null) => {
    // Only re-enter loading when signing IN (session exists).
    // Signing out (session is null) doesn't need a loading phase —
    // the previous setLoading(true) here was causing a stuck spinner on sign-out.
    if (session?.user) {
      setLoading(true);
    }
    setSession(session);
    setUser(session?.user ?? null);

    try {
      if (session?.user) {
        const adminStatus = await checkAdminStatus(session.user.id);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only synchronous work in callback; defer async updates
      setTimeout(() => {
        updateAuthState(session);
      }, 0);
    });

    // Check for existing session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await updateAuthState(session);
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setLoading(false);
      return { error };
    }

    // Immediately resolve admin status BEFORE returning to caller.
    // This eliminates the race where Login navigates before isAdmin is known.
    let adminStatus = false;
    if (data.session?.user) {
      setSession(data.session);
      setUser(data.session.user);

      adminStatus = await checkAdminStatus(data.session.user.id);
      setIsAdmin(adminStatus);
    }

    setLoading(false);
    return { error: null, isAdmin: adminStatus };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setLoading(false);
    }
    return { error };
  };

  const value: AuthContextType = {
    user,
    session,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
    checkAdminStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};