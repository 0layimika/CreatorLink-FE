'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, RotateCw, Smartphone } from 'lucide-react';
import Image from 'next/image';
import { Button, ButtonLink } from '@/components/ui/Button';

interface CreatorPagePreviewProps {
  username: string;
}

/**
 * A simulator shell around the canonical public page. It is the real public page
 * in a phone viewport and reloads after successful builder saves.
 */
export function CreatorPagePreview({ username }: CreatorPagePreviewProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const previewUrl = `/${encodeURIComponent(username)}?preview=1&v=${refreshKey}`;

  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);
    window.addEventListener('creator-preview:refresh', refresh);
    return () => window.removeEventListener('creator-preview:refresh', refresh);
  }, []);

  return (
    <section aria-label="Live page preview">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-primary">
          <Smartphone className="h-4 w-4" aria-hidden="true" />
          Preview only
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setRefreshKey((value) => value + 1)}
            aria-label="Refresh preview"
          >
            <RotateCw className="h-4 w-4" aria-hidden="true" />
          </Button>
          <ButtonLink href={`/${encodeURIComponent(username)}`} target="_blank" size="sm" variant="outline">
            Open live <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>

      <div className="relative mx-auto aspect-[1204/2448] w-full max-w-[390px] drop-shadow-2xl">
        <div
          className="absolute inset-[1.8%_2.5%_0.9%_4%] overflow-hidden bg-background"
          style={{ borderRadius: 'clamp(12px, 4vw, 22px)' }}
        >
          <iframe
            title={`Preview of ${username}'s public page`}
            src={previewUrl}
            className="block h-full w-full overflow-y-auto border-0 bg-background"
            style={{ pointerEvents: 'auto', touchAction: 'pan-y' }}
            loading="eager"
            scrolling="yes"
          />
        </div>
        <Image
          src="/assets/phone/velio-iphone-frame.png"
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 390px"
          className="pointer-events-none absolute inset-0 object-contain"
          aria-hidden="true"
        />
      </div>

      <p className="mt-2 text-center text-xs font-semibold text-text-secondary">
        This is the live public page. Save a change to refresh it here.
      </p>
    </section>
  );
}
