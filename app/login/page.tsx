'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, KeyRound, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { AuthShell, FormAlert } from '@/components/auth/AuthShell';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setResendSuccess(false);

    try {
      const destination = new URLSearchParams(window.location.search).get('redirect') === '/admin' ? '/admin' : undefined;
      await login(formData.email.trim().toLowerCase(), formData.password, destination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'We could not log you in. Please try again.';
      const isUnverified = message.toLowerCase().includes('verify account') || message.toLowerCase().includes('please verify');
      setNeedsVerification(isUnverified);
      setError(isUnverified ? 'Your email still needs verifying before you can continue.' : message);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendSuccess(false);
    try {
      await authApi.resendVerification(formData.email.trim().toLowerCase());
      setResendSuccess(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not resend the email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Good to see you."
      description="Your links have been holding the fort. Sign in and pick up where you left off."
      sideTitle="Your corner of the internet missed you."
      footer={<>New around here? <Link href="/signup" className="font-extrabold text-primary hover:underline">Create your free account</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <FormAlert
            tone="error"
            title={needsVerification ? 'One quick thing' : 'That did not work'}
            action={needsVerification ? (
              <button type="button" onClick={handleResendVerification} disabled={isResending} className="font-extrabold underline underline-offset-4 disabled:opacity-50">
                {isResending ? 'Sending…' : 'Resend verification email'}
              </button>
            ) : undefined}
          >
            {error}
          </FormAlert>
        )}

        {resendSuccess && (
          <FormAlert tone="success" title="Email sent">
            Check your inbox for a fresh verification link.
          </FormAlert>
        )}

        <Input
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          leadingIcon={<Mail className="h-5 w-5" />}
          value={formData.email}
          onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
          required
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Password <span className="text-primary">*</span></span>
            <Link href="/forgot-password" className="text-xs font-extrabold text-primary hover:underline">Forgot it?</Link>
          </div>
          <PasswordInput
            aria-label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            leadingIcon={<KeyRound className="h-5 w-5" />}
            value={formData.password}
            onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          Sign in
          {!isLoading && <ArrowRight className="h-5 w-5" />}
        </Button>
      </form>
    </AuthShell>
  );
}
