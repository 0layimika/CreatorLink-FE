'use client';

import { useState, useRef } from 'react';
import { Plus, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { LinkItem } from '@/components/dashboard/LinkItem';
import { PhoneMockup } from '@/components/dashboard/PhoneMockup';
import { useAuth } from '@/contexts/AuthContext';
import { useLinks } from '@/hooks/useLinks';
import { useProfileConfig } from '@/hooks/useProfileConfig';
import { mediaApi } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import type { Link } from '@/types';

export default function LinksPage() {
  const { user, creator, updateCreator } = useAuth();
  const { addToast } = useToast();
  const { links, isLoading, createLink, updateLink, toggleLink, deleteLink } = useLinks();
  const { config: profileConfig, updateConfig: updateProfileConfig } = useProfileConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const newLinkThumbRef = useRef<HTMLInputElement>(null);
  const editLinkThumbRef = useRef<HTMLInputElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ title: '', url: '', thumbnail_url: '' as string | null });
  const [editData, setEditData] = useState({ title: '', url: '', thumbnail_url: '' as string | null });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bgImageUploading, setBgImageUploading] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState<'new' | 'edit' | null>(null);
  const [themeDraft, setThemeDraft] = useState<{
    background_type: 'color' | 'image';
    background_value: string | null;
    text_color: string | null;
    support_button_text: string | null;
  } | null>(null);
  const defaultTheme = {
    background_type: 'color' as const,
    background_value: '#faf9f7' as string | null,
    text_color: '#1a1a1a' as string | null,
    support_button_text: 'Support me' as string | null,
  };
  const theme = themeDraft ?? profileConfig ?? defaultTheme;
  type ThemeType = {
    background_type: 'color' | 'image';
    background_value: string | null;
    text_color: string | null;
    support_button_text: string | null;
  };
  const ensureTheme = (t: Partial<ThemeType>): ThemeType => {
    const base = (themeDraft ?? theme) as ThemeType;
    return {
      background_type: t.background_type ?? base.background_type ?? 'color',
      background_value: t.background_value !== undefined ? t.background_value : base.background_value,
      text_color: t.text_color ?? base.text_color ?? '#1a1a1a',
      // FIXED: Allow empty string, don't force "Support me" when user is typing
      support_button_text: t.support_button_text !== undefined ? t.support_button_text : base.support_button_text,
    };
  };

  const displayName = `${creator?.first_name || ''} ${creator?.last_name || ''}`.trim() || creator?.username || user?.username || 'Creator';
  const avatarUrl = creator?.avatar_url || user?.avatar || '';

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    setAvatarUploading(true);
    setError(null);
    try {
      const response = await mediaApi.upload(file);
      if (response.success && response.data?.url) {
        await updateCreator({ avatar_url: response.data.url });
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      addToast(err instanceof Error ? err.message : 'Failed to upload image', 'error');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleBgImageClick = () => {
    bgImageInputRef.current?.click();
  };

  const handleBgImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    setBgImageUploading(true);
    setError(null);
    try {
      const response = await mediaApi.upload(file);
      if (response.success && response.data?.url) {
        setThemeDraft((d) => ensureTheme({
          ...(d ?? theme),
          background_type: 'image',
          background_value: response.data!.url,
        }));
        await updateProfileConfig({
          background_type: 'image',
          background_value: response.data.url,
        });
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      addToast(err instanceof Error ? err.message : 'Failed to upload image', 'error');
    } finally {
      setBgImageUploading(false);
      e.target.value = '';
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'new' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }
    setThumbnailUploading(mode);
    setError(null);
    try {
      const response = await mediaApi.upload(file);
      if (response.success && response.data?.url) {
        if (mode === 'new') {
          setNewLink((prev) => ({ ...prev, thumbnail_url: response.data!.url }));
        } else {
          setEditData((prev) => ({ ...prev, thumbnail_url: response.data!.url }));
        }
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      addToast(err instanceof Error ? err.message : 'Failed to upload image', 'error');
    } finally {
      setThumbnailUploading(null);
    }
    e.target.value = '';
  };

  const mockUser = {
    id: String(user?.id || '1'),
    name: displayName,
    username: user?.username || 'creator',
    email: user?.email || '',
    bio: creator?.bio || 'Creator on LinkVerse',
    avatar: avatarUrl || '/avatar.jpg',
    verified: user?.verified || false,
    createdAt: new Date().toISOString(),
  };

  const handleAddLink = async () => {
    if (!newLink.title || !newLink.url) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Ensure URL has protocol
      let url = newLink.url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      await createLink({
        title: newLink.title,
        url,
        thumbnail_url: newLink.thumbnail_url || null,
      });
      setNewLink({ title: '', url: '', thumbnail_url: '' });
      setIsAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (link: Link) => {
    setEditingLink(link);
    setEditData({ title: link.title, url: link.url, thumbnail_url: link.thumbnail_url ?? '' });
    setIsAdding(false);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
    setEditData({ title: '', url: '', thumbnail_url: '' });
    setError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingLink || !editData.title || !editData.url) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Ensure URL has protocol
      let url = editData.url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      await updateLink(parseInt(editingLink.id), {
        title: editData.title,
        url,
        thumbnail_url: editData.thumbnail_url || null,
      });
      setEditingLink(null);
      setEditData({ title: '', url: '', thumbnail_url: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await toggleLink(parseInt(id), enabled);
    } catch (err) {
      console.error('Failed to toggle link:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLink(parseInt(id));
    } catch (err) {
      console.error('Failed to delete link:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Links</h1>
        <p className="text-text-secondary mt-1">
          Manage the links on your public profile
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Edit Panel */}
        <div className="space-y-4">
          {/* Avatar Section - prominent like links */}
          <Card className="p-4 shadow-soft">
            <h2 className="text-lg font-semibold text-foreground mb-4">Profile Photo</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div
                  onClick={handleAvatarClick}
                  className="cursor-pointer group"
                >
                  {avatarUrl ? (
                    <div className="relative h-24 w-24 rounded-full overflow-hidden shadow-medium">
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <Avatar name={displayName} size="xl" className="h-24 w-24 text-2xl" />
                      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-text-secondary">
                  Click to upload a new photo. JPG, PNG or GIF. Max 5MB.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={handleAvatarClick}
                  disabled={avatarUploading}
                >
                  {avatarUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 mr-2" />
                  )}
                  {avatarUploading ? 'Uploading...' : 'Change Photo'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Page Theme / Appearance */}
          <Card className="p-4 shadow-soft">
            <h2 className="text-lg font-semibold text-foreground mb-4">Page Appearance</h2>
            <p className="text-sm text-text-secondary mb-4">
              Customize how your public profile page looks
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Background
                </label>
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="background_type"
                      checked={theme.background_type === 'color'}
                      onChange={() => setThemeDraft((d) => ensureTheme({ ...(d ?? theme), background_type: 'color' }))}
                      className="rounded"
                    />
                    <span className="text-sm">Color</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="background_type"
                      checked={theme.background_type === 'image'}
                      onChange={() => setThemeDraft((d) => ensureTheme({ ...(d ?? theme), background_type: 'image' }))}
                      className="rounded"
                    />
                    <span className="text-sm">Image</span>
                  </label>
                </div>
                {theme.background_type === 'image' ? (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Background Image</label>
                    <div className="flex items-center gap-4">
                      {theme.background_value ? (
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-border">
                          <img
                            src={theme.background_value}
                            alt="Background"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : null}
                      <div>
                        <input
                          ref={bgImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleBgImageChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleBgImageClick}
                          disabled={bgImageUploading}
                        >
                          {bgImageUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                          {bgImageUploading ? 'Uploading...' : theme.background_value ? 'Change' : 'Upload Image'}
                        </Button>
                        {theme.background_value && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-2 text-error"
                            onClick={() => {
                              setThemeDraft((d) => ensureTheme({ ...(d ?? theme), background_value: null }));
                              updateProfileConfig({ background_value: null });
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-text-secondary">Color:</label>
                    <input
                      type="color"
                      value={theme.background_value || '#faf9f7'}
                      onChange={(e) =>
                        setThemeDraft((d) => ensureTheme({ ...(d ?? theme), background_value: e.target.value }))
                      }
                      className="h-10 w-14 cursor-pointer rounded border border-border"
                    />
                    <Input
                      value={theme.background_value || '#faf9f7'}
                      onChange={(e) =>
                        setThemeDraft((d) => ensureTheme({ ...(d ?? theme), background_value: e.target.value || null }))
                      }
                      className="flex-1"
                    />
                  </div>
                )}
              </div>
              <Input
                label="Support Button Text"
                placeholder="Support me"
                value={theme.support_button_text ?? ''}
                onChange={(e) =>
                  // FIXED: Allow empty string to be set
                  setThemeDraft((d) => ensureTheme({ ...(d ?? theme), support_button_text: e.target.value }))
                }
              />
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground">Text Color:</label>
                <input
                  type="color"
                  value={theme.text_color || '#1a1a1a'}
                  onChange={(e) =>
                    setThemeDraft((d) => ensureTheme({ ...(d ?? theme), text_color: e.target.value }))
                  }
                  className="h-10 w-14 cursor-pointer rounded border border-border"
                />
                <Input
                  value={theme.text_color || '#1a1a1a'}
                  onChange={(e) =>
                    setThemeDraft((d) => ensureTheme({ ...(d ?? theme), text_color: e.target.value || null }))
                  }
                  className="flex-1"
                />
              </div>
              <Button
                onClick={async () => {
                  // FIXED: Save whatever the user typed, even if empty
                  await updateProfileConfig({
                    ...theme,
                    support_button_text: theme.support_button_text ?? 'Support me',
                  });
                  setThemeDraft(null);
                }}
              >
                Save Appearance
              </Button>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Your Links</h2>
            <Button size="sm" onClick={() => setIsAdding(true)} className="shadow-soft">
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>

          {isAdding && (
            <Card className="p-4 shadow-soft">
              <div className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                    {error}
                  </div>
                )}
                <Input
                  label="Title"
                  placeholder="Link title"
                  value={newLink.title}
                  onChange={(e) =>
                    setNewLink({ ...newLink, title: e.target.value })
                  }
                />
                <Input
                  label="URL"
                  type="url"
                  placeholder="https://example.com"
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink({ ...newLink, url: e.target.value })
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Thumbnail (optional)</label>
                  <div className="flex items-center gap-3">
                    {newLink.thumbnail_url ? (
                      <div className="w-12 h-12 rounded overflow-hidden border border-border shrink-0">
                        <img src={newLink.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <div>
                      <input
                        ref={newLinkThumbRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleThumbnailUpload(e, 'new')}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => newLinkThumbRef.current?.click()}
                        disabled={thumbnailUploading === 'new'}
                      >
                        {thumbnailUploading === 'new' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                        {thumbnailUploading === 'new' ? 'Uploading...' : newLink.thumbnail_url ? 'Change' : 'Upload'}
                      </Button>
                      {newLink.thumbnail_url && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={() => setNewLink((prev) => ({ ...prev, thumbnail_url: null }))}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">JPG, PNG or GIF. Max 5MB.</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddLink} isLoading={isSubmitting}>
                    Add Link
                  </Button>
                  <Button variant="outline" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {editingLink && (
            <Card className="p-4 shadow-soft border-primary/50">
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Edit Link</h3>
                {error && (
                  <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                    {error}
                  </div>
                )}
                <Input
                  label="Title"
                  placeholder="Link title"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                />
                <Input
                  label="URL"
                  type="url"
                  placeholder="https://example.com"
                  value={editData.url}
                  onChange={(e) =>
                    setEditData({ ...editData, url: e.target.value })
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Thumbnail (optional)</label>
                  <div className="flex items-center gap-3">
                    {editData.thumbnail_url ? (
                      <div className="w-12 h-12 rounded overflow-hidden border border-border shrink-0">
                        <img src={editData.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <div>
                      <input
                        ref={editLinkThumbRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleThumbnailUpload(e, 'edit')}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => editLinkThumbRef.current?.click()}
                        disabled={thumbnailUploading === 'edit'}
                      >
                        {thumbnailUploading === 'edit' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                        {thumbnailUploading === 'edit' ? 'Uploading...' : editData.thumbnail_url ? 'Change' : 'Upload'}
                      </Button>
                      {editData.thumbnail_url && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={() => setEditData((prev) => ({ ...prev, thumbnail_url: null }))}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">JPG, PNG or GIF. Max 5MB.</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSaveEdit} isLoading={isSubmitting}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {links.map((link) => (
              <LinkItem
                key={link.id}
                link={link}
                onEdit={handleStartEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {links.length === 0 && !isAdding && (
            <Card className="p-8 text-center shadow-soft">
              <p className="text-text-secondary">
                No links yet. Add your first link to get started.
              </p>
            </Card>
          )}
        </div>

        {/* Preview Panel */}
        <div className="hidden lg:block">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <PhoneMockup user={mockUser} links={links} profileConfig={theme} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
