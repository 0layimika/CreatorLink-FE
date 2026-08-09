'use client';

import { useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthShell, AuthState, FormAlert } from '@/components/auth/AuthShell';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const sendResetEmail = async (isResend = false) => {
    setError(null);
    setResendSuccess(false);
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (isResend) await authApi.resendForgotPassword(normalizedEmail);
      else await authApi.forgotPassword(normalizedEmail);
      setIsSuccess(true);
      setResendSuccess(isResend);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not send the reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Password rescue"
      title={isSuccess ? 'Go check your inbox.' : 'Forgot your password? It happens.'}
      description={isSuccess ? <>We sent reset instructions to <strong className="text-foreground">{email}</strong>.</> : 'Tell us where to send the reset link and we’ll get you back in.'}
      backHref="/login"
      backLabel="Back to sign in"
      sideTitle="A tiny detour. You’ll be back in no time."
    >
      {isSuccess ? (
        <AuthState icon="success" title="Email on the way" description="Open the link in the email to choose a new password. It expires shortly, so don’t leave it hanging.">
          <div className="space-y-3">
            {resendSuccess && <FormAlert tone="success">A fresh link is on its way.</FormAlert>}
            {error && <FormAlert tone="error">{error}</FormAlert>}
            <Button type="button" variant="outline" size="lg" className="w-full" isLoading={isLoading} onClick={() => sendResetEmail(true)}>
              Resend the email
            </Button>
            <button type="button" onClick={() => { setIsSuccess(false); setError(null); }} className="text-sm font-extrabold text-primary hover:underline">
              Use a different email
            </button>
          </div>
        </AuthState>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); void sendResetEmail(); }} className="space-y-5" noValidate>
          {error && <FormAlert tone="error" title="Couldn’t send that">{error}</FormAlert>}
          <Input
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            leadingIcon={<Mail className="h-5 w-5" />}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
            Send my reset link
            {!isLoading && <ArrowRight className="h-5 w-5" />}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
