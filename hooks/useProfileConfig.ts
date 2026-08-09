'use client';

import { useState, useEffect, useCallback } from 'react';
import { profileApi } from '@/lib/api';
import type { ProfileConfig } from '@/types';

interface UseProfileConfigReturn {
  config: ProfileConfig | null;
  isLoading: boolean;
  error: string | null;
  updateConfig: (data: Partial<ProfileConfig>) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useProfileConfig(): UseProfileConfigReturn {
  const [config, setConfig] = useState<ProfileConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await profileApi.getProfileConfig();
      if (response.success && response.data) {
        const data = response.data;
        setConfig({
          background_type: data.background_type || 'color',
          background_value: data.background_value ?? null,
          text_color: data.text_color ?? null,
          support_button_text: data.support_button_text ?? 'Support me',
          accent_color: data.accent_color ?? null,
          card_style: data.card_style ?? null,
          profile_alignment: data.profile_alignment ?? null,
          avatar_shape: data.avatar_shape ?? null,
          avatar_size: data.avatar_size ?? null,
          support_button_style: data.support_button_style ?? null,
          support_enabled: data.support_enabled ?? true,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile config');
        setConfig({
        background_type: 'color',
        background_value: null,
        text_color: null,
        support_button_text: 'Support me',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = useCallback(async (data: Partial<ProfileConfig>) => {
    const response = await profileApi.updateProfileConfig(data);
    if (response.success && response.data) {
      const updated = response.data;
      setConfig({
        background_type: updated.background_type || 'color',
        background_value: updated.background_value ?? null,
        text_color: updated.text_color ?? null,
          support_button_text: updated.support_button_text ?? 'Support me',
          accent_color: updated.accent_color ?? null,
          card_style: updated.card_style ?? null,
          profile_alignment: updated.profile_alignment ?? null,
          avatar_shape: updated.avatar_shape ?? null,
          avatar_size: updated.avatar_size ?? null,
          support_button_style: updated.support_button_style ?? null,
          support_enabled: updated.support_enabled ?? true,
      });
    } else {
      throw new Error('Failed to update profile config');
    }
  }, []);

  return {
    config,
    isLoading,
    error,
    updateConfig,
    refetch: fetchConfig,
  };
}
