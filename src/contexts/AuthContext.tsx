import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};