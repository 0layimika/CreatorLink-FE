'use client';

import { useRef, useState } from 'react';
import { Camera, Palette } from 'lucide-react';
import { BuilderPanel } from '@/components/page-builder/BuilderPanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mediaApi } from '@/lib/api';
import type { ProfileConfig } from '@/types';
import { requestCreatorPreviewRefresh } from '@/lib/creator-preview';

const isHex = (value?: string | null) => Boolean(value && /^#[0-9a-f]{6}$/i.test(value));


export function AppearanceEditor({ config, onChange, onSave }: {
  config: ProfileConfig;
  onChange: (config: ProfileConfig) => void;
  onSave: (config: Partial<ProfileConfig>) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const update = (patch: Partial<ProfileConfig>) => {
    onChange({ ...config, ...patch });
    setFeedback(null);
  };

  const upload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      setFeedback('Choose a JPG, PNG or GIF smaller than 10MB.');
      return;
    }
    setIsUploading(true);
    try {
      const response = await mediaApi.upload(file, { preserveQuality: true });
      if (!response.data?.url) throw new Error('The upload did not return an image.');
      update({ background_type: 'image', background_value: response.data.url });
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not upload that background.');
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await onSave({
        background_type: config.background_type,
        background_value: config.background_value,
        text_color: config.text_color,
        accent_color: config.accent_color,
        card_style: config.card_style,
        profile_alignment: config.profile_alignment,
        support_button_style: config.support_button_style,
      });
      requestCreatorPreviewRefresh();
      setFeedback('Appearance updated.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not save your appearance.');
    } finally {
      setIsSaving(false);
    }
  };

  const backgroundColor = isHex(config.background_value) ? config.background_value! : '#f4f3ee';
  const textColor = isHex(config.text_color) ? config.text_color! : '#111111';

  return (
    <BuilderPanel icon={Palette} title="Appearance" description="Choose the canvas and text colours that frame your content.">
      <div className="space-y-6">
        <div>
          <p className="mb-3 text-sm font-bold text-foreground">Background</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => update({ background_type: 'color', background_value: backgroundColor })} className={`rounded-2xl border px-4 py-3 text-sm font-extrabold ${config.background_type === 'color' ? 'border-ink bg-secondary text-ink' : 'border-border bg-card text-foreground'}`}>Colour</button>
            <button type="button" onClick={() => update({ background_type: 'image', background_value: isHex(config.background_value) ? null : config.background_value })} className={`rounded-2xl border px-4 py-3 text-sm font-extrabold ${config.background_type === 'image' ? 'border-ink bg-secondary text-ink' : 'border-border bg-card text-foreground'}`}>Image</button>
          </div>
        </div>

        {config.background_type === 'color' ? (
          <div className="flex items-end gap-3"><label className="grid h-14 w-14 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-2xl border border-border" style={{ backgroundColor: backgroundColor }}><input type="color" value={backgroundColor} onChange={(event) => update({ background_value: event.target.value })} className="sr-only" /></label><Input label="Background colour" value={backgroundColor} onChange={(event) => update({ background_value: event.target.value })} /></div>
        ) : (
          <div className="rounded-[24px] border border-border bg-muted/35 p-4">
            {config.background_value && !isHex(config.background_value) && <img src={config.background_value} alt="Current page background" className="mb-4 aspect-[16/8] w-full rounded-[18px] object-cover" />}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => void upload(event.target.files?.[0])} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()} isLoading={isUploading}><Camera className="h-4 w-4" />{config.background_value ? 'Change image' : 'Upload image'}</Button>
              {config.background_value && <Button type="button" size="sm" variant="ghost" onClick={() => update({ background_value: null })}>Remove</Button>}
            </div>
          </div>
        )}

        <div className="flex items-end gap-3"><label className="grid h-14 w-14 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-2xl border border-border" style={{ backgroundColor: textColor }}><input type="color" value={textColor} onChange={(event) => update({ text_color: event.target.value })} className="sr-only" /></label><Input label="Text colour" value={textColor} onChange={(event) => update({ text_color: event.target.value })} /></div>

        <div>
          <p className="mb-3 text-sm font-bold text-foreground">Accent colour</p>
          <div className="flex items-end gap-3"><label className="grid h-14 w-14 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-2xl border border-border" style={{ backgroundColor: config.accent_color || '#2457ff' }}><input type="color" value={config.accent_color || '#2457ff'} onChange={(event) => update({ accent_color: event.target.value })} className="sr-only" /></label><Input label="Accent colour" value={config.accent_color || '#2457ff'} onChange={(event) => update({ accent_color: event.target.value })} /></div>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold text-foreground">Link cards</p>
          <div className="grid grid-cols-3 gap-2">
            {(['solid', 'outline', 'glass'] as const).map((style) => <button key={style} type="button" onClick={() => update({ card_style: style })} className={`rounded-2xl border px-3 py-3 text-sm font-extrabold capitalize ${config.card_style === style ? 'border-ink bg-secondary text-ink' : 'border-border bg-card text-foreground'}`}>{style}</button>)}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold text-foreground">Profile alignment</p>
          <div className="grid grid-cols-3 gap-2">
            {(['left', 'center', 'right'] as const).map((alignment) => <button key={alignment} type="button" onClick={() => update({ profile_alignment: alignment })} className={`rounded-2xl border px-3 py-3 text-sm font-extrabold capitalize ${config.profile_alignment === alignment ? 'border-ink bg-secondary text-ink' : 'border-border bg-card text-foreground'}`}>{alignment}</button>)}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-bold text-foreground">Support button</p>
          <div className="grid grid-cols-2 gap-2">
            {(['solid', 'outline'] as const).map((style) => <button key={style} type="button" onClick={() => update({ support_button_style: style })} className={`rounded-2xl border px-4 py-3 text-sm font-extrabold capitalize ${config.support_button_style === style ? 'border-ink bg-secondary text-ink' : 'border-border bg-card text-foreground'}`}>{style}</button>)}
          </div>
        </div>

        {feedback && <p className="text-sm text-text-secondary" role="status">{feedback}</p>}
        <Button type="button" onClick={() => void save()} isLoading={isSaving}>Save appearance</Button>
      </div>
    </BuilderPanel>
  );
}
