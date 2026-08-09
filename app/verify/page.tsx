'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { AuthShell, AuthState } from '@/components/auth/AuthShell';

function VerifyRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    router.replace(token ? `/verify-email?token=${encodeURIComponent(token)}` : '/verify-email');
  }, [router, searchParams]);

  return <RedirectState />;
}

function RedirectState() {
  return (
    <AuthShell eyebrow="Email verification" title="Taking you to the right place…" description="This will only take a second.">
      <AuthState title="Opening verification" description="Your link is being prepared.">
        <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-primary" />
      </AuthState>
    </AuthShell>
  );
}

export default function VerifyPage() {
  return <Suspense fallback={<RedirectState />}><VerifyRedirect /></Suspense>;
}
