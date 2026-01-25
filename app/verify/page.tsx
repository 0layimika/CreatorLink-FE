'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Redirect to verify-email page with the token
      router.replace(`/verify-email?token=${token}`);
    } else {
      // No token, redirect to verify-email page
      router.replace('/verify-email');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4">
      <Card className="p-8 max-w-md w-full text-center shadow-medium">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Redirecting...</h2>
        <p className="text-text-secondary">Please wait while we redirect you to the verification page.</p>
      </Card>
    </div>
  );
}

