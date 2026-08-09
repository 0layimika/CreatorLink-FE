'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, AtSign, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { AuthShell, FormAlert } from '@/components/auth/AuthShell';

const USERNAME_PATTERN = /^[a-z0-9_]+$/;

export default function SetupCreatorPage() {
  const router = useRouter();
  const { createCreator, isLoading, user, creator } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ username: '', first_name: '', last_name: '', bio: '' });

  useEffect(() => {
    if (!isLoading && creator) router.replace('/dashboard');
    else if (!isLoading && !user) router.replace('/login');
  }, [creator, isLoading, router, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!USERNAME_PATTERN.test(formData.username)) {
      setError('Your username can use lowercase letters, numbers and underscores.');
      return;
    }
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('Add your first and last name so people know who they have found.');
      return;
    }

    try {
      await createCreator({
        username: formData.username,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        bio: formData.bio.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not create your profile. Please try again.');
    }
  };

  return (
    <AuthShell
      eyebrow="Set up your page"
      title="Now make it yours."
      description="Choose the name on your link and tell people a little about the person behind it. You can change these details later."
      step="Step 3 of 3"
      wide
      sideTitle="Put your name on something lovely."
      sideDescription="This is the last little form. Your blank canvas—and your dashboard—are waiting on the other side."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <FormAlert tone="error" title="One thing to fix">{error}</FormAlert>}

        <Input
          label="Your LinkVerse username"
          type="text"
          inputMode="text"
          autoComplete="username"
          placeholder="amara_makes"
          leadingIcon={<AtSign className="h-5 w-5" />}
          helperText={formData.username ? <>Your page will live at <strong className="text-foreground">linkverse.live/{formData.username}</strong></> : 'Lowercase letters, numbers and underscores only.'}
          value={formData.username}
          maxLength={30}
          onChange={(event) => setFormData((current) => ({ ...current, username: event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="First name"
            autoComplete="given-name"
            placeholder="Amara"
            leadingIcon={<UserRound className="h-5 w-5" />}
            value={formData.first_name}
            onChange={(event) => setFormData((current) => ({ ...current, first_name: event.target.value }))}
            required
          />
          <Input
            label="Last name"
            autoComplete="family-name"
            placeholder="Jones"
            leadingIcon={<UserRound className="h-5 w-5" />}
            value={formData.last_name}
            onChange={(event) => setFormData((current) => ({ ...current, last_name: event.target.value }))}
            required
          />
        </div>

        <Textarea
          label="A tiny bio"
          placeholder="I make joyful things for the internet."
          helperText={<span className="flex justify-between gap-4"><span>Optional. Keep it short and human.</span><span>{formData.bio.length}/160</span></span>}
          value={formData.bio}
          maxLength={160}
          onChange={(event) => setFormData((current) => ({ ...current, bio: event.target.value }))}
          rows={4}
        />

        <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
          Finish and open my dashboard
          {!isLoading && <ArrowRight className="h-5 w-5" />}
        </Button>
      </form>
    </AuthShell>
  );
}
