'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { GlobalMutationLoader } from '@/components/providers/GlobalMutationLoader';
import { ThemeFloatingToggle } from '@/components/providers/ThemeFloatingToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <GlobalMutationLoader />
          <ThemeFloatingToggle />
          {children}
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
