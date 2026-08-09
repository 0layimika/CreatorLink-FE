'use client';

import { useState } from 'react';
import { ExternalLink, Heart, Link2, Palette, Share2, UserRound } from 'lucide-react';
import { AppearanceEditor } from '@/components/page-builder/AppearanceEditor';
import { CreatorPagePreview } from '@/components/page-builder/CreatorPagePreview';
import { LinksEditor } from '@/components/page-builder/LinksEditor';
import { ProfileEditor } from '@/components/page-builder/ProfileEditor';
import { SocialsEditor } from '@/components/page-builder/SocialsEditor';
import { SupportEditor } from '@/components/page-builder/SupportEditor';
import { DashboardError, DashboardLoading, DashboardPageHeader } from '@/components/dashboard/DashboardUI';
import { ButtonLink } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useLinks } from '@/hooks/useLinks';
import { useProfileConfig } from '@/hooks/useProfileConfig';
import { useSocialLinks } from '@/hooks/useSocialLinks';
import type { ProfileConfig } from '@/types';

const sections = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'socials', label: 'Socials', icon: Share2 },
  { id: 'links', label: 'Links', icon: Link2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'support', label: 'Support', icon: Heart },
] as const;

type SectionId = (typeof sections)[number]['id'];

const defaultConfig: ProfileConfig = {
  background_type: 'color',
  background_value: '#f4f3ee',
  text_color: '#111111',
  support_button_text: 'Support me',
  accent_color: '#2457ff',
  card_style: 'glass',
  profile_alignment: 'center',
  support_button_style: 'solid',
};

export default function MyPageBuilder() {
  const { user, creator, updateCreator } = useAuth();
  const linkState = useLinks();
  const profileState = useProfileConfig();
  const socialState = useSocialLinks();
  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const [configDraft, setConfigDraft] = useState<ProfileConfig | null>(null);

  const username = creator?.username || user?.username || 'creator';
  const fallbackName = `${creator?.first_name || ''} ${creator?.last_name || ''}`.trim() || username;
  const currentConfig = configDraft || profileState.config || defaultConfig;

  if (linkState.isLoading || profileState.isLoading || socialState.isLoading) {
    return <DashboardLoading label="Opening your page builder…" />;
  }

  return (
    <div className="page-builder-shell space-y-6">
      <DashboardPageHeader
        eyebrow="Public page"
        title="My Page"
        description="Shape your profile, socials and links in one place. Changes preserve everything your existing visitors already use."
        actions={
          <ButtonLink href={`/${username}`} target="_blank" variant="outline" size="sm">
            Open public page <ExternalLink className="h-4 w-4" />
          </ButtonLink>
        }
      />

      {(linkState.error || profileState.error) && (
        <DashboardError message={linkState.error || profileState.error || 'Could not load part of your page.'} />
      )}

      <div className="page-builder-grid grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="page-builder-editor max-w-4xl">
          <nav className="page-builder-tabs mb-5 flex gap-2 overflow-x-auto pb-2" aria-label="Page builder sections">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-extrabold transition ${activeSection === id ? 'border-ink bg-secondary text-ink' : 'border-border bg-card text-foreground hover:border-ink'}`}
                aria-current={activeSection === id ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>

          {activeSection === 'profile' && (
            <ProfileEditor
              key={creator?.id || 'profile'}
              username={username}
              fallbackName={fallbackName}
              displayName={creator?.display_name}
              bio={creator?.bio}
              avatarUrl={creator?.avatar_url || user?.avatar}
              onSave={updateCreator}
            />
          )}
          {activeSection === 'socials' && (
            <SocialsEditor
              socialLinks={socialState.socialLinks}
              isSaving={socialState.isSaving}
              error={socialState.error}
              onDraftChange={() => undefined}
              onSave={async (links) => {
                await socialState.save(links);
              }}
            />
          )}
          {activeSection === 'links' && (
            <LinksEditor
              links={linkState.links}
              createLink={linkState.createLink}
              updateLink={linkState.updateLink}
              toggleLink={linkState.toggleLink}
              deleteLink={linkState.deleteLink}
              reorderLinks={linkState.reorderLinks}
            />
          )}
          {activeSection === 'appearance' && (
            <AppearanceEditor
              config={currentConfig}
              onChange={setConfigDraft}
              onSave={async (config) => {
                await profileState.updateConfig(config);
                setConfigDraft(null);
              }}
            />
          )}
          {activeSection === 'support' && (
            <SupportEditor
              buttonText={currentConfig.support_button_text || ''}
              enabled={currentConfig.support_enabled !== false}
              onChange={(value) => setConfigDraft({ ...currentConfig, support_button_text: value })}
              onEnabledChange={(enabled) => setConfigDraft({ ...currentConfig, support_enabled: enabled })}
              onSave={async (value, enabled) => {
                await profileState.updateConfig({ support_button_text: value, support_enabled: enabled });
                setConfigDraft(null);
              }}
            />
          )}
        </div>

        <aside className="page-builder-preview xl:sticky xl:top-24">
          <CreatorPagePreview username={username} />
        </aside>
      </div>
    </div>
  );
}
