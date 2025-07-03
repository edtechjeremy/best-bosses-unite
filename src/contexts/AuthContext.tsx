import React, { createContext } from 'react';
import { useAuthState } from '@/hooks/useAuth';

interface AuthContextType {
  user: any;
  session: any;
  isLoading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, linkedinProfile: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthState();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};