'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Eye, EyeOff, Save, Share2 } from 'lucide-react';
import { BuilderPanel } from '@/components/page-builder/BuilderPanel';
import { SOCIAL_PLATFORM_LABELS } from '@/components/public-profile/SocialLinksRow';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { requestCreatorPreviewRefresh } from '@/lib/creator-preview';
import { SOCIAL_PLATFORMS, type SocialLink, type SocialPlatform } from '@/types';

const placeholders: Partial<Record<SocialPlatform, string>> = {
  email: 'hello@example.com',
  whatsapp: '2348012345678',
  telegram: 'username',
};

function buildRows(savedLinks: SocialLink[]) {
  const existing = new Map(savedLinks.map((link) => [link.platform, link]));
  return SOCIAL_PLATFORMS.map((platform, index) => existing.get(platform) || {
    platform,
    url: '',
    position: index,
    is_visible: true,
  }).sort((a, b) => a.position - b.position);
}

export function SocialsEditor({ socialLinks, isSaving, error, onDraftChange, onSave }: {
  socialLinks: SocialLink[];
  isSaving: boolean;
  error?: string | null;
  onDraftChange?: (links: SocialLink[]) => void;
  onSave: (links: SocialLink[]) => Promise<void>;
}) {
  const [rows, setRows] = useState(() => buildRows(socialLinks));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [savingPlatform, setSavingPlatform] = useState<SocialPlatform | null>(null);
  // Keep legacy Website rows intact when replacing the newer supported set.
  const legacyLinks = socialLinks.filter((link) => link.platform === 'website');

  const setNextRows = (nextRows: SocialLink[]) => {
    const positioned = nextRows.map((row, position) => ({ ...row, position }));
    setRows(positioned);
    onDraftChange?.(positioned);
    setFeedback(null);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setNextRows(next);
  };

  const saveRows = async (rowsToSave: SocialLink[], platform?: SocialPlatform) => {
    const populated = [...legacyLinks, ...rowsToSave]
      .filter((row) => row.url.trim())
      .map((row, position) => ({ ...row, url: row.url.trim(), position }));
    if (populated.filter((row) => row.is_visible !== false).length > 4) {
      setFeedback('Choose up to four socials to show publicly.');
      return;
    }
    setSavingPlatform(platform || null);
    try {
      await onSave(populated);
      requestCreatorPreviewRefresh();
      setFeedback(platform ? `${SOCIAL_PLATFORM_LABELS[platform]} saved.` : 'Social links updated.');
    } catch (saveError) {
      setFeedback(saveError instanceof Error ? saveError.message : 'Could not save social links.');
    } finally {
      setSavingPlatform(null);
    }
  };

  const visibleCount = rows.filter((row) => row.url.trim() && row.is_visible !== false).length;

  return (
    <BuilderPanel icon={Share2} title="Socials" description="Add a username or paste a full link. Choose up to four socials to show on your page.">
      <div className="space-y-3">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-text-secondary">
          <strong className="text-foreground">{visibleCount}/4 selected.</strong> Empty fields stay off your public page.
        </div>
        {rows.map((row, index) => (
          <div key={row.platform} className="rounded-[22px] border border-border bg-muted/35 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-extrabold text-foreground">{SOCIAL_PLATFORM_LABELS[row.platform]}</span>
              <div className="ml-auto flex items-center gap-1">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="grid h-8 w-8 place-items-center rounded-full text-text-secondary hover:bg-card disabled:opacity-25" aria-label={`Move ${row.platform} up`}><ChevronUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === rows.length - 1} className="grid h-8 w-8 place-items-center rounded-full text-text-secondary hover:bg-card disabled:opacity-25" aria-label={`Move ${row.platform} down`}><ChevronDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => {
                  if (!row.is_visible && visibleCount >= 4 && row.url.trim()) {
                    setFeedback('Choose up to four socials to show publicly.');
                    return;
                  }
                  setNextRows(rows.map((item) => item.platform === row.platform ? { ...item, is_visible: !item.is_visible } : item));
                }} className="grid h-8 w-8 place-items-center rounded-full text-text-secondary hover:bg-card" aria-label={`${row.is_visible ? 'Hide' : 'Show'} ${row.platform}`}>
                  {row.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Input value={row.url} placeholder={placeholders[row.platform] || 'username or full link'} className={!row.is_visible ? 'opacity-55' : undefined} onChange={(event) => setNextRows(rows.map((item) => item.platform === row.platform ? { ...item, url: event.target.value } : item))} aria-label={`${SOCIAL_PLATFORM_LABELS[row.platform]} username or URL`} />
            <Button type="button" size="sm" variant="outline" className="mt-3 w-full sm:w-auto" onClick={() => void saveRows(rows, row.platform)} isLoading={isSaving && savingPlatform === row.platform} disabled={isSaving}>
              {savingPlatform === row.platform ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />} Save {SOCIAL_PLATFORM_LABELS[row.platform]}
            </Button>
          </div>
        ))}
        {(feedback || error) && <p className="text-sm text-text-secondary" role="status">{feedback || error}</p>}
        <Button type="button" onClick={() => void saveRows(rows)} isLoading={isSaving && !savingPlatform}>Save all socials</Button>
      </div>
    </BuilderPanel>
  );
}
