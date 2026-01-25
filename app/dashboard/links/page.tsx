'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LinkItem } from '@/components/dashboard/LinkItem';
import { PhoneMockup } from '@/components/dashboard/PhoneMockup';
import { useAuth } from '@/contexts/AuthContext';
import { useLinks } from '@/hooks/useLinks';
import type { Link } from '@/types';

export default function LinksPage() {
  const { user } = useAuth();
  const { links, isLoading, createLink, updateLink, toggleLink, deleteLink } = useLinks();
  const [isAdding, setIsAdding] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [editData, setEditData] = useState({ title: '', url: '' });

  const mockUser = {
    id: String(user?.id || '1'),
    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'Creator',
    username: user?.username || 'creator',
    email: user?.email || '',
    bio: user?.bio || 'Creator on LinkVerse',
    avatar: user?.avatar || '/avatar.jpg',
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

      await createLink({ title: newLink.title, url });
      setNewLink({ title: '', url: '' });
      setIsAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (link: Link) => {
    setEditingLink(link);
    setEditData({ title: link.title, url: link.url });
    setIsAdding(false);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
    setEditData({ title: '', url: '' });
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

      await updateLink(parseInt(editingLink.id), { title: editData.title, url });
      setEditingLink(null);
      setEditData({ title: '', url: '' });
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
              <PhoneMockup user={mockUser} links={links} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
