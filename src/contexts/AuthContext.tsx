import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { supabaseDB } from '../lib/db_supabase';
import { User } from '../lib/db';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (user: User) => void; // Kept for compatibility, but mostly internal now
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const profile = await supabaseDB.getUserProfile(userId);
      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name,
          email: email,
          phone: profile.phone,
          created_at: profile.created_at,
          // is_expert: profile.is_expert // Add this to User type if needed, currently inferred from email in MockDB
        });
      } else {
        // Profile might not exist yet if just signed up, handle gracefully or create?
        // For now, set basic user
        setUser({
          id: userId,
          name: email.split('@')[0],
          email: email,
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback: Set user from session data even if profile fetch fails
      setUser({
        id: userId,
        name: email.split('@')[0],
        email: email,
        created_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
