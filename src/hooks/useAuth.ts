
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsAdmin(session?.user?.email === 'schifeling@gmail.com');
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session:', session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsAdmin(session?.user?.email === 'schifeling@gmail.com');
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string, linkedinProfile: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: firstName,
          last_name: lastName,
          linkedin_profile: linkedinProfile,
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out...');
    
    try {
      // Clear state immediately for instant UI feedback
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      
      // Then call supabase signout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Signout error:', error);
        // If there's an error, we still want to clear the local state
        // as the user has initiated a logout
      }
      
      console.log('Signout completed');
      return { error };
    } catch (error: any) {
      console.error('Signout catch error:', error);
      return { error };
    }
  };

  return {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    isAdmin,
  };
};
