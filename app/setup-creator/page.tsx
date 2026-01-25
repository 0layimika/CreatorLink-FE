'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { siteConfig } from '@/lib/constants';
import Link from 'next/link';
import Image from 'next/image';

export default function SetupCreatorPage() {
  const { createCreator, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    bio: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.username || !formData.first_name || !formData.last_name) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError('Username can only contain lowercase letters and numbers');
      return;
    }

    try {
      await createCreator({
        username: formData.username.toLowerCase(),
        first_name: formData.first_name,
        last_name: formData.last_name,
        bio: formData.bio || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create creator profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4 py-12">
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
            Set up your creator profile
          </h1>
          <p className="mt-2 text-text-secondary">
            Complete your profile to get started
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
              label="Username"
              type="text"
              placeholder="amarajones"
              helperText="This will be your public profile URL (lowercase letters and numbers only)"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })
              }
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                type="text"
                placeholder="Amara"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                required
              />
              <Input
                label="Last name"
                type="text"
                placeholder="Jones"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                required
              />
            </div>

            <Textarea
              label="Bio (optional)"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={4}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Complete Setup
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

