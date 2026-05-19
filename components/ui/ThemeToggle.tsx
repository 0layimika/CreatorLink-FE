'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="border-border bg-card text-foreground"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon className="h-4 w-4 mr-1.5" /> : <Sun className="h-4 w-4 mr-1.5" />}
      {theme === 'light' ? 'Dark' : 'Light'}
    </Button>
  );
}
