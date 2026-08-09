'use client';

import { useEffect, useState } from 'react';
import { AtSign, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ProfileIdentityEditorProps {
  displayName?: string | null;
  fallbackName: string;
  username: string;
  onSave: (displayName: string | null) => Promise<void>;
}

export function ProfileIdentityEditor({
  displayName,
  fallbackName,
  username,
  onSave,
}: ProfileIdentityEditorProps) {
  const savedValue = displayName?.trim() ?? '';
  const [draft, setDraft] = useState(savedValue);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setDraft(savedValue);
  }, [savedValue]);

  const normalizedDraft = draft.trim();
  const hasChanges = normalizedDraft !== savedValue;

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await onSave(normalizedDraft || null);
      setDraft(normalizedDraft);
      setFeedback(normalizedDraft ? 'Display name updated.' : `Using ${fallbackName} again.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not update your display name.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-border bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink bg-secondary text-ink">
          <UserRound className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-xl font-black tracking-[-0.035em] text-foreground">Page identity</h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Give your public page a name that feels like you. Your username stays visible for recognition.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          label="Display name"
          value={draft}
          maxLength={80}
          placeholder={fallbackName}
          onChange={(event) => {
            setDraft(event.target.value);
            setFeedback(null);
          }}
          helperText={`Leave this blank to show “${fallbackName}”.`}
        />

        <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/60 px-4 py-3 text-sm text-text-secondary">
          <AtSign className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{username}</span>
          <span className="ml-auto text-xs font-bold uppercase tracking-[0.12em]">always shown</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" size="sm" onClick={handleSave} isLoading={isSaving} disabled={!hasChanges}>
            Save display name
          </Button>
          {draft && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isSaving}
              onClick={() => {
                setDraft('');
                setFeedback(null);
              }}
            >
              Use default name
            </Button>
          )}
          {feedback && <p className="text-sm text-text-secondary" role="status">{feedback}</p>}
        </div>
      </div>
    </section>
  );
}
