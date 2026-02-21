'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { siteConfig } from '@/lib/constants';
import { authApi } from '@/lib/api';
import { CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      
      // Check if error is about account verification
      if (errorMessage.toLowerCase().includes('verify account') || errorMessage.toLowerCase().includes('please verify')) {
        // Automatically resend verification email
        setIsResending(true);
        try {
          const response = await authApi.resendVerification(formData.email);
          if (response.success) {
            setSuccess('Verification email sent! Please check your email inbox (and spam folder) for the verification link.');
          } else {
            setError(response.message || 'Failed to resend verification email. Please try again.');
          }
        } catch {
          setError('Failed to resend verification email. Please try again later.');
        } finally {
          setIsResending(false);
        }
      } else {
        setError(errorMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4">
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
            Welcome back
          </h1>
          <p className="mt-2 text-text-secondary">
            Log in to your account to continue
          </p>
        </div>

        <Card className="p-6 shadow-medium">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-success font-medium text-sm mb-1">Verification Email Sent!</p>
                    <p className="text-success/80 text-sm">{success}</p>
                  </div>
                </div>
              </div>
            )}
            
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-secondary">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading || isResending} disabled={isResending}>
              {isResending ? 'Sending verification email...' : 'Log in'}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
