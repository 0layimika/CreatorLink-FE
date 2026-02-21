'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { siteConfig } from '@/lib/constants';
import { authApi } from '@/lib/api';
import { Lock, CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword(token, formData.newPassword, formData.confirmPassword);
      setIsSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // No token provided
  if (!token) {
    return (
      <Card className="p-8 max-w-md w-full text-center shadow-medium">
        <XCircle className="h-12 w-12 text-error mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Invalid Reset Link</h2>
        <p className="text-text-secondary mb-6">
          The password reset link is invalid or has expired. Please request a new one.
        </p>
        <div className="flex flex-col space-y-2">
          <Link href="/forgot-password">
            <Button className="w-full">Request new link</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Back to login
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <Card className="p-8 max-w-md w-full text-center shadow-medium">
        <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Password Reset!</h2>
        <p className="text-text-secondary mb-4">
          Your password has been reset successfully. You can now log in with your new password.
        </p>
        <p className="text-sm text-text-secondary">Redirecting to login...</p>
      </Card>
    );
  }

  // Reset form
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-2">
          <Image
            src={siteConfig.logoWordmark}
            alt={siteConfig.name}
            width={168}
            height={40}
            className="h-9 w-auto"
          />
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          Reset your password
        </h1>
        <p className="mt-2 text-text-secondary">
          Enter your new password below
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
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            <Lock className="h-4 w-4 mr-2" />
            Reset password
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

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4">
      <Suspense fallback={<LoadingFallback />}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
