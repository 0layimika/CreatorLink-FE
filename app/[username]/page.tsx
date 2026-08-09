import type { CSSProperties } from 'react';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { Heart } from 'lucide-react';
import { ProfileHeader } from '@/components/public-profile/ProfileHeader';
import { LinkButton } from '@/components/public-profile/LinkButton';
import { ShareProfileButton } from '@/components/public-profile/ShareProfileButton';
import { SocialLinksRow } from '@/components/public-profile/SocialLinksRow';
import { StoreSpotlight } from '@/components/public-profile/StoreSpotlight';
import { SupportButton } from '@/components/public-profile/SupportButton';
import { getCreatorDisplayName } from '@/lib/creator-display-name';
import { siteConfig } from '@/lib/constants';
import { analyticsApi, ApiError, profileApi, storeApi } from '@/lib/api';
import type { StoreProduct } from '@/types';

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ preview?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string }>;
}

type PublicStoreProduct = StoreProduct & { deleted_at?: string | null };

async function getProfile(username: string) {
  try {
    const response = await profileApi.getPublicProfile(username);
    return response.success && response.data
      ? { kind: 'found' as const, profile: response.data }
      : { kind: 'not-found' as const };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return { kind: 'not-found' as const };
    return {
      kind: 'error' as const,
      error: error instanceof Error ? error : new Error('Unable to load this creator page.'),
    };
  }
}

async function getStore(username: string) {
  try {
    const response = await storeApi.getStorefront(username);
    return response.success && response.data ? response.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  noStore();
  const { username } = await params;
  const result = await getProfile(username.toLowerCase());
  const displayName = result.kind === 'found'
    ? getCreatorDisplayName(result.profile)
    : username;

  return {
    title: `${displayName} (@${username}) | ${siteConfig.name}`,
    description: `Links, work and more from ${displayName} on ${siteConfig.name}.`,
  };
}

export default async function PublicProfilePage({ params, searchParams }: PublicProfilePageProps) {
  noStore();
  const { username: routeUsername } = await params;
  const lookupUsername = routeUsername.toLowerCase();
  const profileResult = await getProfile(lookupUsername);

  if (profileResult.kind === 'not-found') notFound();
  if (profileResult.kind === 'error') throw profileResult.error;

  const profile = profileResult.profile;
  const canonicalUsername = profile.username.toLowerCase();
  if (routeUsername !== canonicalUsername) redirect(`/${canonicalUsername}`);

  const username = canonicalUsername;
  const store = await getStore(username);

  const pageQuery = await searchParams;
  const previewMode = pageQuery?.preview === '1';
  if (!previewMode) {
    try {
      const attribution = new URLSearchParams();
      for (const key of ['utm_source', 'utm_medium', 'utm_campaign'] as const) {
        if (pageQuery?.[key]) attribution.set(key, pageQuery[key]!);
      }
      await analyticsApi.trackProfileView(username, attribution.toString());
    } catch {
      // Analytics must never prevent a public page from loading.
    }
  }

  const displayName = getCreatorDisplayName(profile);
  const profileConfig = profile.profile_config;
  const hasBackgroundImage = profileConfig?.background_type === 'image' && Boolean(profileConfig.background_value);
  const backgroundColor = profileConfig?.background_type === 'color' || !hasBackgroundImage
    ? profileConfig?.background_value || '#f4f3ee'
    : '#111111';
  const hasExistingCustomBackground = Boolean(profileConfig?.background_value);
  // Existing pages historically defaulted to white text over any saved colour/image.
  // Keep that behaviour; only the new untouched default uses ink on warm white.
  const textColor = profileConfig?.text_color || (hasExistingCustomBackground ? '#ffffff' : '#111111');
  const accentColor = profileConfig?.accent_color || '#2457ff';
  const alignment = profileConfig?.profile_alignment || 'center';

  const pageStyle = {
    minHeight: '100vh',
    backgroundColor,
    color: textColor,
    '--creator-text': textColor,
    '--creator-background': backgroundColor,
    '--creator-accent': accentColor,
  } as CSSProperties;

  const user = {
    id: profile.id,
    name: displayName,
    username: profile.username,
    email: '',
    bio: profile.bio || '',
    avatar: profile.avatar_url || '',
    verified: true,
    createdAt: new Date().toISOString(),
  };

  const links = profile.links.map((profileLink, index) => ({
    id: profileLink.id,
    title: profileLink.title,
    url: profileLink.url,
    icon: profileLink.icon || 'Link',
    thumbnail_url: profileLink.thumbnail_url ?? null,
    display_type: profileLink.display_type || 'standard',
    description: profileLink.description ?? null,
    clicks: 0,
    enabled: true,
    order: index,
  }));

  const visibleProducts = ((store?.products || []) as PublicStoreProduct[]).filter((product) => {
    if (product.deleted_at || product.is_active === false) return false;
    if (product.type !== 'physical' || product.track_inventory === false) return true;
    return Number(product.stock_quantity ?? 0) > 0;
  });

  return (
    <main className={`relative isolate min-h-screen overflow-x-hidden text-[var(--creator-text)]${previewMode ? ' creator-preview-mode' : ''}`} style={pageStyle}>
      {hasBackgroundImage && (
        <>
          <div
            className="creator-background-layer pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${profileConfig?.background_value})` }}
            aria-hidden="true"
          />
          <div className="creator-background-overlay pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/20 via-black/5 to-black/30" aria-hidden="true" />
        </>
      )}
      <div className="creator-dots-overlay pointer-events-none absolute inset-0 z-[2] opacity-[0.07] [background-image:radial-gradient(circle_at_center,var(--creator-text)_0.7px,transparent_0.8px)] [background-size:18px_18px]" aria-hidden="true" />

      <div className={`creator-profile-shell creator-align-${alignment} relative z-10 mx-auto w-full max-w-[680px] px-4 pb-8 pt-4 sm:px-6 sm:pb-12 sm:pt-6`}>
        <div className="creator-share-row mb-5 flex min-h-11 justify-end">
          <ShareProfileButton displayName={displayName} />
        </div>

        <ProfileHeader user={user} textColor={textColor} />
        <SocialLinksRow socialLinks={profile.social_links || []} />

        <div className="creator-links mt-9 space-y-3">
          {links.map((link) => (
            <LinkButton key={link.id} link={link} textColor={textColor} cardStyle={profileConfig?.card_style} />
          ))}
        </div>

        {links.length === 0 && (
          <div className="creator-empty-state mt-9 rounded-[26px] border border-[color:color-mix(in_srgb,var(--creator-text)_18%,transparent)] bg-[color:color-mix(in_srgb,var(--creator-text)_7%,transparent)] px-6 py-10 text-center backdrop-blur-xl">
            <p className="font-display text-xl font-black tracking-[-0.035em]">More is coming.</p>
            <p className="mt-2 text-sm font-medium opacity-65">This creator is still putting their page together.</p>
          </div>
        )}

        <StoreSpotlight username={username} products={visibleProducts} />

        {profileConfig?.support_enabled !== false && <section className="creator-support mt-10 overflow-hidden rounded-[30px] border border-[color:color-mix(in_srgb,var(--creator-text)_18%,transparent)] bg-[color:color-mix(in_srgb,var(--creator-text)_8%,transparent)] p-5 backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--creator-text)] text-[var(--creator-background)]">
                <Heart className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-xl font-black tracking-[-0.04em]">Enjoying what I make?</h2>
                <p className="mt-1 text-sm font-medium leading-5 opacity-65">Send a little support and help me keep creating.</p>
              </div>
            </div>
            <SupportButton
              username={username}
              buttonText={profileConfig?.support_button_text || 'Support me'}
              buttonStyle={profileConfig?.support_button_style}
              className="w-full shrink-0 sm:w-auto"
            />
          </div>
        </section>}

        <footer className="creator-footer pb-[max(0px,env(safe-area-inset-bottom))] pt-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold opacity-55 transition hover:opacity-100">
            <span className="h-2 w-2 rounded-full bg-secondary ring-1 ring-black/50" aria-hidden="true" />
            Made with {siteConfig.name}
          </Link>
        </footer>
      </div>
    </main>
  );
}
