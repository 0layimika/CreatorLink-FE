'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

interface ShareProfileButtonProps {
  displayName: string;
}

export function ShareProfileButton({ displayName }: ShareProfileButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: displayName,
      text: `Have a look at ${displayName}'s page`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--creator-text)_22%,transparent)] bg-[color:color-mix(in_srgb,var(--creator-text)_8%,transparent)] px-4 text-sm font-extrabold text-[var(--creator-text)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[color:color-mix(in_srgb,var(--creator-text)_13%,transparent)]"
      aria-label="Share this page"
    >
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
      <span>{copied ? 'Copied' : 'Share'}</span>
    </button>
  );
}
