'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verify } = useAuth();
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const storedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('verificationEmail') : null;

    if (token) {
      handleVerify(token);
    } else if (storedEmail) {
      setResendEmail(storedEmail);
      setStatus('pending');
    } else {
      setStatus('pending');
    }
  }, [searchParams]);

  const handleVerify = async (token: string) => {
    setStatus('verifying');
    setError(null);
    try {
      await verify(token);
      setStatus('success');
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('verificationEmail');
      }
      // Redirect to creator setup after a short delay
      setTimeout(() => {
        router.push('/setup-creator');
      }, 2000);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail) return;

    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      await authApi.resendVerification(resendEmail);
      setResendSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  if (status === 'verifying') {
    return (
      <Card className="p-8 max-w-md w-full text-center shadow-medium">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Verifying your email...</h2>
        <p className="text-text-secondary">Please wait while we verify your account.</p>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card className="p-8 max-w-md w-full text-center shadow-medium">
        <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Email Verified!</h2>
        <p className="text-text-secondary mb-4">Your account has been verified successfully.</p>
        <p className="text-sm text-text-secondary">Redirecting to creator setup...</p>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="p-8 max-w-md w-full text-center shadow-medium">
        <XCircle className="h-12 w-12 text-error mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Verification Failed</h2>
        <p className="text-text-secondary mb-4">{error || 'The verification link is invalid or has expired.'}</p>

        <div className="mb-6 space-y-3">
          <p className="text-sm text-text-secondary">Enter your email to resend verification:</p>
          <Input
            type="email"
            placeholder="you@example.com"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
          />
          {resendSuccess && (
            <p className="text-sm text-success">Verification email sent!</p>
          )}
          <Button
            onClick={handleResendVerification}
            variant="outline"
            className="w-full"
            isLoading={isResending}
          >
            Resend verification email
          </Button>
        </div>

        <div className="flex flex-col space-y-2">
          <Button onClick={() => router.push('/signup')}>
            Sign up again
          </Button>
          <Button variant="ghost" onClick={() => router.push('/login')}>
            Go to login
          </Button>
        </div>
      </Card>
    );
  }

  // Pending - show check email message
  return (
    <Card className="p-8 max-w-md w-full text-center shadow-medium">
      <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
      <h2 className="text-xl font-bold text-foreground mb-2">Check your email</h2>
      <p className="text-text-secondary mb-4">
        We&apos;ve sent a verification link to your email address. Please click the link to verify your account.
      </p>

      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm mb-4">
          {error}
        </div>
      )}

      {resendSuccess && (
        <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm mb-4">
          Verification email sent!
        </div>
      )}

      <div className="mb-6 space-y-3">
        <p className="text-sm text-text-secondary">Didn&apos;t receive the email?</p>
        <Input
          type="email"
          placeholder="Enter your email"
          value={resendEmail}
          onChange={(e) => setResendEmail(e.target.value)}
        />
        <Button
          onClick={handleResendVerification}
          variant="outline"
          className="w-full"
          isLoading={isResending}
          disabled={!resendEmail}
        >
          Resend verification email
        </Button>
      </div>

      <Button onClick={() => router.push('/login')} variant="ghost" className="w-full">
        Go to login
      </Button>
    </Card>
  );
}

function LoadingFallback() {
  return (
    <Card className="p-8 max-w-md w-full text-center shadow-medium">
      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
      <h2 className="text-xl font-bold text-foreground mb-2">Loading...</h2>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4">
      <Suspense fallback={<LoadingFallback />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
