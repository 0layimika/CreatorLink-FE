'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, KeyRound, LoaderCircle } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/Input';
import { AuthShell, AuthState, FormAlert } from '@/components/auth/AuthShell';
import { authApi } from '@/lib/api';

function ResetPasswordContent() {
  const token = useSearchParams().get('token');
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (formData.newPassword.length < 8) {
      setError('Your new password needs at least 8 characters.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Those passwords do not match yet.');
      return;
    }
    if (!token) {
      setError('This reset link is missing its token. Request a fresh one below.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, formData.newPassword, formData.confirmPassword);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not reset your password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell eyebrow="That link has wandered off" title="You’ll need a fresh reset link." description="Reset links expire to keep your account safe. Ask for another and we’ll email it straight over." backHref="/login" backLabel="Back to sign in">
        <AuthState icon="error" title="Invalid or expired link" description="Nothing is wrong with your account. This particular link just cannot be used.">
          <ButtonLink href="/forgot-password" size="lg" className="w-full">Request a new link <ArrowRight className="h-5 w-5" /></ButtonLink>
        </AuthState>
      </AuthShell>
    );
  }

  if (isSuccess) {
    return (
      <AuthShell eyebrow="All sorted" title="New password, ready to go." description="Your account is secure and waiting for you." sideTitle="Fresh password. Same brilliant page.">
        <AuthState icon="success" title="Password changed" description="Use your new password the next time you sign in.">
          <ButtonLink href="/login" size="lg" className="w-full">Sign in now <ArrowRight className="h-5 w-5" /></ButtonLink>
        </AuthState>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Almost back in"
      title="Choose a fresh password."
      description="Make it memorable for you and difficult for everyone else. Eight characters minimum."
      backHref="/login"
      backLabel="Back to sign in"
      sideTitle="Fresh password. Same brilliant page."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <FormAlert tone="error" title="Not quite">{error}</FormAlert>}
        <PasswordInput
          label="New password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          leadingIcon={<KeyRound className="h-5 w-5" />}
          helperText="Use something unique to LinkVerse."
          value={formData.newPassword}
          onChange={(event) => setFormData((current) => ({ ...current, newPassword: event.target.value }))}
          required
        />
        <PasswordInput
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Type it once more"
          leadingIcon={<KeyRound className="h-5 w-5" />}
          value={formData.confirmPassword}
          onChange={(event) => setFormData((current) => ({ ...current, confirmPassword: event.target.value }))}
          error={formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? 'The passwords are different.' : undefined}
          required
        />
        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          Save my new password
          {!isLoading && <ArrowRight className="h-5 w-5" />}
        </Button>
      </form>
    </AuthShell>
  );
}

function LoadingFallback() {
  return (
    <AuthShell eyebrow="Just a second" title="Opening your reset link…" description="We’re checking that everything is valid.">
      <AuthState title="Loading" description="This should only take a moment.">
        <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-primary" />
      </AuthState>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<LoadingFallback />}><ResetPasswordContent /></Suspense>;
}
