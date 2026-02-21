'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type MutationEventDetail = {
  id: string;
  method: string;
  endpoint: string;
};

export function GlobalMutationLoader() {
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  useEffect(() => {
    const onStart = (event: Event) => {
      const customEvent = event as CustomEvent<MutationEventDetail>;
      const id = customEvent.detail?.id;
      if (!id) return;
      setPendingIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    const onEnd = (event: Event) => {
      const customEvent = event as CustomEvent<MutationEventDetail>;
      const id = customEvent.detail?.id;
      if (!id) return;
      setPendingIds((prev) => prev.filter((pendingId) => pendingId !== id));
    };

    window.addEventListener('api:mutation:start', onStart);
    window.addEventListener('api:mutation:end', onEnd);

    return () => {
      window.removeEventListener('api:mutation:start', onStart);
      window.removeEventListener('api:mutation:end', onEnd);
    };
  }, []);

  const pendingCount = useMemo(() => pendingIds.length, [pendingIds]);

  if (pendingCount === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[120] pointer-events-none">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/95 backdrop-blur-md px-3 py-2 shadow-medium">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-xs text-foreground font-medium">
          Saving...
        </span>
      </div>
    </div>
  );
}
