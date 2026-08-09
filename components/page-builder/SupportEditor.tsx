'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { BuilderPanel } from '@/components/page-builder/BuilderPanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { requestCreatorPreviewRefresh } from '@/lib/creator-preview';

export function SupportEditor({ buttonText, enabled, onChange, onEnabledChange, onSave }: {
  buttonText: string;
  enabled: boolean;
  onChange: (value: string) => void;
  onEnabledChange: (value: boolean) => void;
  onSave: (value: string, enabled: boolean) => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const save = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await onSave(buttonText, enabled);
      requestCreatorPreviewRefresh();
      setFeedback('Support button updated.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not update the support button.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BuilderPanel icon={Heart} title="Support" description="Make the contribution prompt feel natural in your own voice.">
      <div className="space-y-5">
        <Input
          label="Button text"
          value={buttonText}
          maxLength={48}
          placeholder="Support me"
          helperText="If left blank, your page safely falls back to “Support me”."
          onChange={(event) => { onChange(event.target.value); setFeedback(null); }}
        />
        <label className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm font-bold text-foreground">
          <span>Show support card on my page</span>
          <input type="checkbox" checked={enabled} onChange={(event) => onEnabledChange(event.target.checked)} className="h-5 w-5 accent-primary" />
        </label>
        <div className="rounded-[24px] border border-border bg-muted/40 p-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-text-secondary">Preview</p>
          <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-extrabold text-white">
            <Heart className="h-4 w-4" /> {buttonText || 'Support me'}
          </div>
        </div>
        {feedback && <p className="text-sm text-text-secondary" role="status">{feedback}</p>}
        <Button type="button" onClick={() => void save()} isLoading={isSaving}>Save support button</Button>
      </div>
    </BuilderPanel>
  );
}
