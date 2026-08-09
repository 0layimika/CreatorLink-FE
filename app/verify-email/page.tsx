'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, LoaderCircle, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthShell, AuthState, FormAlert } from '@/components/auth/AuthShell';

type VerificationStatus = 'pending' | 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verify } = useAuth();
  const attemptedToken = useRef<string | null>(null);
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [error, setError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleVerify = useCallback(async (token: string) => {
    setStatus('verifying');
    setError(null);
    try {
      await verify(token);
      sessionStorage.removeItem('verificationEmail');
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'We could not verify this link.');
    }
  }, [verify]);

  useEffect(() => {
    const token = searchParams.get('token');
    const storedEmail = sessionStorage.getItem('verificationEmail');
    if (storedEmail) setResendEmail(storedEmail);
    if (token && attemptedToken.current !== token) {
      attemptedToken.current = token;
      void handleVerify(token);
    }
  }, [handleVerify, searchParams]);

  useEffect(() => {
    if (status !== 'success') return;
    const redirect = window.setTimeout(() => router.replace('/setup-creator'), 1400);
    return () => window.clearTimeout(redirect);
  }, [router, status]);

  const handleResend = async () => {
    if (!resendEmail.trim()) return;
    setIsResending(true);
    setError(null);
    setResendSuccess(false);
    try {
      await authApi.resendVerification(resendEmail.trim().toLowerCase());
      sessionStorage.setItem('verificationEmail', resendEmail.trim().toLowerCase());
      setResendSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not resend the verification email.');
    } finally {
      setIsResending(false);
    }
  };

  if (status === 'verifying') {
    return (
      <AuthShell eyebrow="Step 2 of 3" title="Checking your link…" description="Hold tight while we verify your email." sideTitle="Just one click between you and your new page.">
        <AuthState title="Verifying your email" description="This should only take a moment.">
          <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-primary" />
        </AuthState>
      </AuthShell>
    );
  }

  if (status === 'success') {
    return (
      <AuthShell eyebrow="Step 2 of 3" title="You’re officially you." description="Email verified. Now let’s put your name on your page." sideTitle="That’s the serious bit done. Time for the fun part.">
        <AuthState icon="success" title="Email verified" description="Taking you to your profile setup now…">
          <Button type="button" size="lg" className="w-full" onClick={() => router.replace('/setup-creator')}>
            Set up my page <ArrowRight className="h-5 w-5" />
          </Button>
        </AuthState>
      </AuthShell>
    );
  }

  const isError = status === 'error';
  return (
    <AuthShell
      eyebrow="Step 2 of 3"
      title={isError ? 'That link didn’t work.' : 'One click left. Check your email.'}
      description={isError ? 'It may have expired or already been used. Ask for a fresh link below.' : <>We sent a verification link{resendEmail ? <> to <strong className="text-foreground">{resendEmail}</strong></> : ''}. Open it to continue.</>}
      step="Step 2 of 3"
      sideTitle="One quick check. Then your page is all yours."
      footer={<>Already verified? <Link href="/login" className="font-extrabold text-primary hover:underline">Sign in</Link></>}
    >
      <div className="space-y-5">
        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-ink bg-surface-blue text-ink shadow-[4px_4px_0_var(--ink)]">
          <Mail className="h-6 w-6" />
        </div>

        {error && <FormAlert tone="error" title="Fresh link needed">{error}</FormAlert>}
        {resendSuccess && <FormAlert tone="success" title="Sent">A new verification link is in your inbox.</FormAlert>}

        <Input
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          leadingIcon={<Mail className="h-5 w-5" />}
          value={resendEmail}
          onChange={(event) => setResendEmail(event.target.value)}
          helperText="Use the same email you signed up with."
          required
        />
        <Button type="button" variant={isError ? 'primary' : 'outline'} size="lg" className="w-full" isLoading={isResending} disabled={!resendEmail.trim()} onClick={handleResend}>
          Send me a fresh link
        </Button>
      </div>
    </AuthShell>
  );
}

function LoadingFallback() {
  return (
    <AuthShell eyebrow="Step 2 of 3" title="Opening your verification…" description="Just a second.">
      <AuthState title="Loading" description="We’re getting your verification ready.">
        <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-primary" />
      </AuthState>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<LoadingFallback />}><VerifyEmailContent /></Suspense>;
}
