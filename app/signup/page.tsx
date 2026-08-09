'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, KeyRound, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { AuthShell, FormAlert } from '@/components/auth/AuthShell';

export default function SignupPage() {
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });

  const passwordChecks = useMemo(() => [
    { label: '8 characters or more', met: formData.password.length >= 8 },
    { label: 'Passwords match', met: Boolean(formData.confirmPassword) && formData.password === formData.confirmPassword },
  ], [formData.password, formData.confirmPassword]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (formData.password.length < 8) {
      setError('Give your password at least 8 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Those passwords do not match yet.');
      return;
    }

    const email = formData.email.trim().toLowerCase();
    try {
      await register({ ...formData, email });
      sessionStorage.setItem('verificationEmail', email);
      router.push('/verify-email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not create your account. Please try again.');
    }
  };

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Make yourself at home."
      description="Start with an account. We’ll help you pick your link and dress it up next."
      step="Step 1 of 3"
      sideTitle="A good home for everything you make."
      footer={<>Already have an account? <Link href="/login" className="font-extrabold text-primary hover:underline">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <FormAlert tone="error" title="Nearly there">{error}</FormAlert>}

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
        <PasswordInput
          label="Create a password"
          autoComplete="new-password"
          placeholder="Something only you know"
          leadingIcon={<KeyRound className="h-5 w-5" />}
          value={formData.password}
          onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
          required
        />
        <PasswordInput
          label="Confirm your password"
          autoComplete="new-password"
          placeholder="Type it once more"
          leadingIcon={<KeyRound className="h-5 w-5" />}
          value={formData.confirmPassword}
          onChange={(event) => setFormData((current) => ({ ...current, confirmPassword: event.target.value }))}
          error={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'The passwords are different.' : undefined}
          required
        />

        <div className="flex flex-wrap gap-2">
          {passwordChecks.map((check) => (
            <span key={check.label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${check.met ? 'bg-secondary text-ink' : 'bg-muted text-text-secondary'}`}>
              <Check className="h-3.5 w-3.5" /> {check.label}
            </span>
          ))}
        </div>

        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          Create my account
          {!isLoading && <ArrowRight className="h-5 w-5" />}
        </Button>

        <p className="text-center text-xs leading-5 text-text-secondary">
          By continuing, you agree to use LinkVerse responsibly and keep things kind.
        </p>
      </form>
    </AuthShell>
  );
}
