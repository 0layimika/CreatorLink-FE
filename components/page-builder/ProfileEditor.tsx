'use client';

import { useEffect, useRef, useState } from 'react';
import { AtSign, Camera, Loader2, UserRound } from 'lucide-react';
import { BuilderPanel } from '@/components/page-builder/BuilderPanel';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { mediaApi } from '@/lib/api';
import { requestCreatorPreviewRefresh } from '@/lib/creator-preview';

interface ProfileEditorProps {
  username: string;
  fallbackName: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  onDraftChange?: (draft: { displayName: string; bio: string; avatarUrl: string }) => void;
  onSave: (data: { display_name: string | null; bio: string; avatar_url?: string }) => Promise<void>;
}

export function ProfileEditor({ username, fallbackName, displayName, bio, avatarUrl, onDraftChange, onSave }: ProfileEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [nameDraft, setNameDraft] = useState(displayName || '');
  const [bioDraft, setBioDraft] = useState(bio || '');
  const [avatarDraft, setAvatarDraft] = useState(avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    onDraftChange?.({ displayName: nameDraft, bio: bioDraft, avatarUrl: avatarDraft });
  }, [avatarDraft, bioDraft, nameDraft, onDraftChange]);

  const handleAvatar = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      setFeedback('Choose a JPG, PNG or GIF smaller than 10MB.');
      return;
    }
    setIsUploading(true);
    setFeedback(null);
    try {
      const response = await mediaApi.upload(file);
      if (!response.data?.url) throw new Error('The upload did not return an image.');
      setAvatarDraft(response.data.url);
      await onSave({ display_name: nameDraft.trim() || null, bio: bioDraft, avatar_url: response.data.url });
      requestCreatorPreviewRefresh();
      setFeedback('Profile photo updated.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not upload that image.');
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await onSave({ display_name: nameDraft.trim() || null, bio: bioDraft.trim() });
      requestCreatorPreviewRefresh();
      setFeedback(nameDraft.trim() ? 'Profile updated.' : `Profile updated. Your page will show “${fallbackName}”.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not save your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BuilderPanel icon={UserRound} title="Profile" description="The identity people see first when they open your page.">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 rounded-[24px] border border-border bg-muted/45 p-4 sm:flex-row sm:items-center">
          <Avatar src={avatarDraft} name={nameDraft || fallbackName} className="h-24 w-24 text-2xl" />
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => void handleAvatar(event.target.files?.[0])} />
            <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()} isLoading={isUploading}>
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Change photo
            </Button>
            <p className="mt-2 text-xs leading-5 text-text-secondary">JPG, PNG or GIF. Maximum 10MB.</p>
          </div>
        </div>

        <Input
          label="Display name"
          value={nameDraft}
          maxLength={80}
          placeholder={fallbackName}
          helperText={`Optional. Leave blank to show “${fallbackName}”.`}
          onChange={(event) => { setNameDraft(event.target.value); setFeedback(null); }}
        />
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/45 px-4 py-3 text-sm text-text-secondary">
          <AtSign className="h-4 w-4" aria-hidden="true" />
          <span>{username}</span>
          <span className="ml-auto text-xs font-black uppercase tracking-[0.12em]">managed</span>
        </div>
        <Textarea
          label="Bio"
          value={bioDraft}
          maxLength={500}
          rows={4}
          helperText={`${bioDraft.length}/500 characters`}
          placeholder="A quick hello, what you make, or what people should know."
          onChange={(event) => { setBioDraft(event.target.value); setFeedback(null); }}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={handleSave} isLoading={isSaving}>Save profile</Button>
          {nameDraft && <Button type="button" variant="ghost" onClick={() => setNameDraft('')}>Use default name</Button>}
          {feedback && <p className="text-sm text-text-secondary" role="status">{feedback}</p>}
        </div>
      </div>
    </BuilderPanel>
  );
}
