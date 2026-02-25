'use client';

import { useEffect, useState, useRef } from 'react';
import { Camera, Loader2, Save, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { mediaApi } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

export default function SettingsPage() {
  const { user, creator, updateCreator, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    username: creator?.username || '',
    first_name: creator?.first_name || '',
    last_name: creator?.last_name || '',
    bio: creator?.bio || '',
  });
  const [avatarUrl, setAvatarUrl] = useState(creator?.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const showUploadError = (message: string) => {
    setError(message);
    addToast(message, 'error');
  };

  useEffect(() => {
    if (!creator) return;

    setFormData({
      username: creator.username || '',
      first_name: creator.first_name || '',
      last_name: creator.last_name || '',
      bio: creator.bio || '',
    });
    setAvatarUrl(creator.avatar_url || '');
  }, [creator]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showUploadError('Image too large. Keep it below 10MB.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await mediaApi.upload(file);
      if (response.success && response.data) {
        setAvatarUrl(response.data.url);
        setSuccess('Avatar uploaded. Click "Save Changes" to apply.');
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      addToast(err instanceof Error ? err.message : 'Failed to upload image', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const updateData: Record<string, string> = {};

      // Only include changed fields
      if (formData.username !== creator?.username) {
        updateData.username = formData.username;
      }
      if (formData.first_name !== creator?.first_name) {
        updateData.first_name = formData.first_name;
      }
      if (formData.last_name !== creator?.last_name) {
        updateData.last_name = formData.last_name;
      }
      if (formData.bio !== creator?.bio) {
        updateData.bio = formData.bio;
      }
      if (avatarUrl !== creator?.avatar_url) {
        updateData.avatar_url = avatarUrl;
      }

      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        setError('No changes to save');
        setIsSaving(false);
        return;
      }

      await updateCreator(updateData);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = `${formData.first_name} ${formData.last_name}`.trim() || formData.username || 'Creator';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-text-secondary mt-1">
          Manage your profile and account settings
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
                {success}
              </div>
            )}

            {/* Avatar Upload */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
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
                  {isUploading && (
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
                <p className="text-sm font-medium text-foreground">Profile Photo</p>
                <p className="text-xs text-text-secondary mt-1">
                  Click to upload a new photo. JPG, PNG or GIF. Max 10MB.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Username */}
            <Input
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="yourname"
              helperText={`Your public profile URL: https://www.linkverse.live/${formData.username || 'yourname'}`}
            />

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="John"
              />
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Doe"
              />
            </div>

            {/* Bio */}
            <Textarea
              label="Bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell your audience about yourself..."
              rows={4}
              helperText={`${formData.bio.length}/500 characters`}
            />

            {/* Email (Read-only) */}
            <Input
              label="Email"
              value={user?.email || ''}
              disabled
              helperText="Email cannot be changed"
            />

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="submit" disabled={isSaving || authLoading}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
