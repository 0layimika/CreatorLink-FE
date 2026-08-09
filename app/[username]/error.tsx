'use client';

import { useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';

export default function CreatorPageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Creator page failed to load:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <div className="w-full max-w-xl rounded-[32px] border border-border bg-card p-8 text-center sm:p-12">
        <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-ink bg-surface-pink text-ink">
          <WifiOff className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="font-display text-4xl font-black tracking-[-0.055em] sm:text-5xl">We couldn&apos;t load this page.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-text-secondary">
          The creator page still exists, but LinkVerse could not reach the server. Try again in a moment.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/" variant="outline">Go home</ButtonLink>
        </div>
      </div>
    </main>
  );
}
