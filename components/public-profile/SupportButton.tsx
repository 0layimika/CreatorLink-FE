'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SupportButtonProps { username: string; buttonText?: string; className?: string; buttonStyle?: 'solid' | 'outline' | null; }

export function SupportButton({ username, buttonText = 'Support me', className, buttonStyle = 'solid' }: SupportButtonProps) {
  return <Button onClick={() => { window.location.href = `/${encodeURIComponent(username)}/gift`; }} className={cn(buttonStyle === 'outline' ? 'border-2 border-[var(--creator-accent)] bg-transparent text-[var(--creator-accent)]' : 'bg-[var(--creator-accent)] text-white', className)}><Heart className="mr-2 h-4 w-4" />{buttonText}</Button>;
}
