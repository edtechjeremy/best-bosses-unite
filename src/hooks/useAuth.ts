import { useState, useEffect, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if user is admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('user_id', session.user.id)
            .single();
          
          setIsAdmin(profile?.email === 'schifeling@gmail.com');
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string, linkedinProfile: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
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
    try {
      console.log('SignOut: Starting supabase.auth.signOut()...');
      
      // Add a timeout to prevent hanging
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SignOut timeout')), 5000)
      );
      
      const { error } = await Promise.race([signOutPromise, timeoutPromise]) as any;
      
      console.log('SignOut: Supabase call completed, error:', error);
      
      if (error) throw error;
      
      // Clear the state immediately
      console.log('SignOut: Clearing state...');
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsLoading(false);
      
      console.log('SignOut: State cleared successfully');
      return { error: null };
    } catch (error) {
      console.error('SignOut: Error occurred:', error);
      
      // Even if there's an error, clear the local state
      console.log('SignOut: Clearing state due to error...');
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsLoading(false);
      
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