import { Sparkles } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

export default function CreatorNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <div className="w-full max-w-xl rounded-[32px] border border-border bg-card p-8 text-center sm:p-12">
        <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-ink bg-secondary text-ink">
          <Sparkles className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="font-display text-4xl font-black tracking-[-0.055em] sm:text-5xl">This page isn&apos;t here.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-text-secondary">
          The creator may have changed their username or taken their page offline.
        </p>
        <ButtonLink href="/" className="mt-7">Back to LinkVerse</ButtonLink>
      </div>
    </main>
  );
}
