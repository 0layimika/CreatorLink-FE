'use client';

import { useState, useEffect, useCallback } from 'react';
import { linksApi } from '@/lib/api';
import type { Link } from '@/types';

interface UseLinksReturn {
  links: Link[];
  isLoading: boolean;
  error: string | null;
  createLink: (data: { title: string; url: string; icon?: string }) => Promise<void>;
  updateLink: (id: number, data: { title?: string; url?: string; icon?: string }) => Promise<void>;
  deleteLink: (id: number) => Promise<void>;
  toggleLink: (id: number, enabled: boolean) => Promise<void>;
  reorderLinks: (linkIds: number[]) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useLinks(): UseLinksReturn {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await linksApi.getAll();
      if (response.success && response.data) {
        const mappedLinks: Link[] = response.data.map((link) => ({
          id: link.id.toString(),
          title: link.title,
          url: link.url,
          icon: link.icon || 'Link',
          clicks: link.clicks ?? 0, // Default to 0 if null/undefined
          enabled: link.is_active,
          order: link.position,
        }));
        setLinks(mappedLinks.sort((a, b) => a.order - b.order));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch links');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const createLink = useCallback(async (data: { title: string; url: string; icon?: string }) => {
    const response = await linksApi.create(data);
    if (response.success) {
      await fetchLinks();
    } else {
      throw new Error(response.message || 'Failed to create link');
    }
  }, [fetchLinks]);

  const updateLink = useCallback(async (id: number, data: { title?: string; url?: string; icon?: string }) => {
    const response = await linksApi.update(id, data);
    if (response.success) {
      await fetchLinks();
    } else {
      throw new Error(response.message || 'Failed to update link');
    }
  }, [fetchLinks]);

  const deleteLink = useCallback(async (id: number) => {
    const response = await linksApi.delete(id);
    if (response.success) {
      setLinks((prev) => prev.filter((link) => link.id !== id.toString()));
    } else {
      throw new Error(response.message || 'Failed to delete link');
    }
  }, []);

  const toggleLink = useCallback(async (id: number, enabled: boolean) => {
    const response = enabled
      ? await linksApi.activate(id)
      : await linksApi.deactivate(id);
    
    if (response.success) {
      setLinks((prev) =>
        prev.map((link) => (link.id === id.toString() ? { ...link, enabled } : link))
      );
    } else {
      throw new Error(response.message || 'Failed to toggle link');
    }
  }, []);

  const reorderLinks = useCallback(async (linkIds: number[]) => {
    const response = await linksApi.reorder(linkIds);
    if (response.success) {
      await fetchLinks();
    } else {
      throw new Error(response.message || 'Failed to reorder links');
    }
  }, [fetchLinks]);

  return {
    links,
    isLoading,
    error,
    createLink,
    updateLink,
    deleteLink,
    toggleLink,
    reorderLinks,
    refetch: fetchLinks,
  };
}
