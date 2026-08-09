'use client';

import { useCallback, useEffect, useState } from 'react';
import { profileApi } from '@/lib/api';
import type { SocialLink } from '@/types';

export function useSocialLinks() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await profileApi.getSocialLinks();
      setSocialLinks(response.data?.social_links || []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load social links.');
      setSocialLinks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const save = useCallback(async (nextLinks: SocialLink[]) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await profileApi.updateSocialLinks(nextLinks);
      const savedLinks = response.data?.social_links || nextLinks;
      setSocialLinks(savedLinks);
      return savedLinks;
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Could not save social links.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { socialLinks, isLoading, isSaving, error, save, refetch };
}
