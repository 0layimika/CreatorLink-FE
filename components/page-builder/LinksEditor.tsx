'use client';

import { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, ImagePlus, Link2, Pencil, Plus, Trash2 } from 'lucide-react';
import { BuilderPanel } from '@/components/page-builder/BuilderPanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mediaApi } from '@/lib/api';
import type { Link } from '@/types';
import { requestCreatorPreviewRefresh } from '@/lib/creator-preview';

type LinkDraft = { title: string; url: string; thumbnail_url: string | null; display_type: 'standard' | 'featured'; description: string };
const emptyDraft: LinkDraft = { title: '', url: '', thumbnail_url: null, display_type: 'standard', description: '' };

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function LinksEditor({ links, createLink, updateLink, toggleLink, deleteLink, reorderLinks }: {
  links: Link[];
  createLink: (data: LinkDraft) => Promise<void>;
  updateLink: (id: number, data: LinkDraft) => Promise<void>;
  toggleLink: (id: number, enabled: boolean) => Promise<void>;
  deleteLink: (id: number) => Promise<void>;
  reorderLinks: (ids: number[]) => Promise<void>;
}) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<LinkDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const resetForm = () => {
    setDraft(emptyDraft);
    setEditingId(null);
    setShowForm(false);
    setFeedback(null);
  };

  const save = async () => {
    if (!draft.title.trim() || !draft.url.trim()) {
      setFeedback('Add a title and URL first.');
      return;
    }
    setIsSaving(true);
    setFeedback(null);
    const payload = { ...draft, title: draft.title.trim(), url: normalizeUrl(draft.url) };
    try {
      if (editingId) await updateLink(editingId, payload);
      else await createLink(payload);
      requestCreatorPreviewRefresh();
      resetForm();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not save this link.');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadThumbnail = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      setFeedback('Choose an image smaller than 10MB.');
      return;
    }
    setIsUploading(true);
    try {
      const response = await mediaApi.upload(file);
      if (!response.data?.url) throw new Error('The upload did not return an image.');
      setDraft((current) => ({ ...current, thumbnail_url: response.data!.url }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not upload that thumbnail.');
    } finally {
      setIsUploading(false);
      if (uploadRef.current) uploadRef.current.value = '';
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    const reordered = [...links];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    try {
      await reorderLinks(reordered.map((link) => Number(link.id)));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not reorder your links.');
    }
  };

  return (
    <BuilderPanel icon={Link2} title="Links" description="Add, arrange and switch off destinations without deleting them.">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button type="button" size="sm" onClick={() => { setShowForm(true); setEditingId(null); setDraft(emptyDraft); }}>
            <Plus className="h-4 w-4" /> Add link
          </Button>
        </div>

        {showForm && (
          <div className="space-y-4 rounded-[24px] border border-primary/35 bg-primary/5 p-4">
            <h3 className="font-display text-lg font-black text-foreground">{editingId ? 'Edit link' : 'New link'}</h3>
            <Input label="Title" value={draft.title} placeholder="My latest video" onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            <Input label="URL" value={draft.url} placeholder="https://…" onChange={(event) => setDraft({ ...draft, url: event.target.value })} />
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => setDraft({ ...draft, display_type: 'standard' })} className={`rounded-2xl border px-4 py-3 text-left text-sm font-extrabold ${draft.display_type === 'standard' ? 'border-ink bg-secondary text-ink' : 'border-border bg-card text-foreground'}`}>Standard link</button>
              <button type="button" onClick={() => setDraft({ ...draft, display_type: 'featured' })} className={`rounded-2xl border px-4 py-3 text-left text-sm font-extrabold ${draft.display_type === 'featured' ? 'border-ink bg-secondary text-ink' : 'border-border bg-card text-foreground'}`}>Featured link</button>
            </div>
            {draft.display_type === 'featured' && <Input label="Description" value={draft.description} maxLength={240} placeholder="Tell people why this is worth opening" onChange={(event) => setDraft({ ...draft, description: event.target.value })} />}
            <div className="flex flex-wrap items-center gap-3">
              {draft.thumbnail_url && <img src={draft.thumbnail_url} alt="" className="h-14 w-14 rounded-2xl border border-border object-cover" />}
              <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={(event) => void uploadThumbnail(event.target.files?.[0])} />
              <Button type="button" size="sm" variant="outline" onClick={() => uploadRef.current?.click()} isLoading={isUploading}>
                <ImagePlus className="h-4 w-4" /> {draft.thumbnail_url ? 'Change thumbnail' : 'Add thumbnail'}
              </Button>
              {draft.thumbnail_url && <Button type="button" size="sm" variant="ghost" onClick={() => setDraft({ ...draft, thumbnail_url: null })}>Remove</Button>}
            </div>
            {feedback && <p className="text-sm text-error" role="alert">{feedback}</p>}
            <div className="flex gap-2">
              <Button type="button" onClick={() => void save()} isLoading={isSaving}>Save link</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </div>
        )}

        {links.map((link, index) => (
          <article key={link.id} className={`creator-link-row flex items-center gap-3 rounded-[22px] border border-border bg-muted/35 p-3 ${link.enabled ? '' : 'opacity-55'}`}>
            {link.thumbnail_url ? (
              <img src={link.thumbnail_url} alt="" className="h-12 w-12 shrink-0 rounded-2xl object-cover" />
            ) : (
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-card"><Link2 className="h-5 w-5 text-text-secondary" /></span>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-extrabold text-foreground">{link.title}</h3>
              <p className="mt-0.5 truncate text-xs text-text-secondary">{link.url}</p>
            </div>
            <div className="creator-link-actions flex shrink-0 items-center gap-1">
              <button type="button" onClick={() => void move(index, -1)} disabled={index === 0} className="grid h-8 w-8 place-items-center rounded-full hover:bg-card disabled:opacity-20" aria-label="Move link up"><ChevronUp className="h-4 w-4" /></button>
              <button type="button" onClick={() => void move(index, 1)} disabled={index === links.length - 1} className="grid h-8 w-8 place-items-center rounded-full hover:bg-card disabled:opacity-20" aria-label="Move link down"><ChevronDown className="h-4 w-4" /></button>
              <label className="relative mx-1 inline-flex cursor-pointer items-center">
                <input type="checkbox" checked={link.enabled} onChange={() => void toggleLink(Number(link.id), !link.enabled)} className="peer sr-only" />
                <span className="h-6 w-11 rounded-full bg-border after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:bg-primary peer-checked:after:translate-x-5" />
              </label>
              <button type="button" onClick={() => { setEditingId(Number(link.id)); setDraft({ title: link.title, url: link.url, thumbnail_url: link.thumbnail_url || null, display_type: link.display_type || 'standard', description: link.description || '' }); setShowForm(true); }} className="grid h-8 w-8 place-items-center rounded-full hover:bg-card" aria-label="Edit link"><Pencil className="h-4 w-4" /></button>
              <button type="button" onClick={() => { if (window.confirm(`Delete “${link.title}”?`)) void deleteLink(Number(link.id)); }} className="grid h-8 w-8 place-items-center rounded-full text-error hover:bg-error/10" aria-label="Delete link"><Trash2 className="h-4 w-4" /></button>
            </div>
          </article>
        ))}

        {!links.length && !showForm && (
          <div className="rounded-[24px] border border-dashed border-border p-8 text-center">
            <p className="font-display text-xl font-black text-foreground">Your page is ready for its first link.</p>
            <p className="mt-2 text-sm text-text-secondary">Add somewhere worth visiting.</p>
          </div>
        )}
        {!showForm && feedback && <p className="text-sm text-error" role="alert">{feedback}</p>}
      </div>
    </BuilderPanel>
  );
}
