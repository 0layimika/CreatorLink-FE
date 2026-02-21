'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { GlobalMutationLoader } from '@/components/providers/GlobalMutationLoader';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <GlobalMutationLoader />
        {children}
      </AuthProvider>
    </ToastProvider>
  );
}
