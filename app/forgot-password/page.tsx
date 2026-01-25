'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { siteConfig } from '@/lib/constants';
import { authApi } from '@/lib/api';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await authApi.resendForgotPassword(email);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center shadow-medium">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Check your email</h2>
            <p className="text-text-secondary mb-6">
              We&apos;ve sent a password reset link to <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="text-sm text-text-secondary mb-6">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-primary hover:underline font-medium"
              >
                click here to resend
              </button>
            </p>
            {error && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm mb-4">
                {error}
              </div>
            )}
            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Image
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-foreground">
              {siteConfig.name}
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-foreground">
            Forgot your password?
          </h1>
          <p className="mt-2 text-text-secondary">
            No worries, we&apos;ll send you reset instructions.
          </p>
        </div>

        <Card className="p-6 shadow-medium">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              <Mail className="h-4 w-4 mr-2" />
              Send reset link
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-text-secondary">
          <Link href="/login" className="text-primary hover:underline font-medium inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
