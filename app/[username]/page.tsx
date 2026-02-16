import Link from 'next/link';
// import { FileText } from 'lucide-react'; // Commented out - media kit coming soon
import { ProfileHeader } from '@/components/public-profile/ProfileHeader';
import { LinkButton } from '@/components/public-profile/LinkButton';
import { SupportButton } from '@/components/public-profile/SupportButton';
import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/lib/constants';
import { profileApi, analyticsApi, storeApi } from '@/lib/api';

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

async function getProfile(username: string) {
  try {
    const response = await profileApi.getPublicProfile(username);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch {
    return null;
  }
}

async function getStore(username: string) {
  try {
    const response = await storeApi.getStorefront(username);
    if (response.success && response.data) {
      return response.data as any;
    }
    return null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const profile = await getProfile(username);
  console.log(profile);
  const name = profile
    ? `${profile.first_name} ${profile.last_name}`.trim() || profile.username
    : username;

  return {
    title: `@${username} | ${siteConfig.name}`,
    description: `Check out ${name}'s links and content on ${siteConfig.name}`,
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params;
  const profile = await getProfile(username);
  const store = await getStore(username);

  // Track profile view (fire and forget)
  try {
    await analyticsApi.trackProfileView(username);
  } catch {
    // Silently fail tracking
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Profile Not Found</h1>
          <p className="text-text-secondary mb-6">
            The profile @{username} doesn&apos;t exist or has been removed.
          </p>
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  const user = {
    id: profile.id,
    name: `${profile.first_name} ${profile.last_name}`.trim() || profile.username,
    username: profile.username,
    email: '',
    bio: profile.bio || '',
    avatar: profile.avatar_url || '',
    verified: true,
    createdAt: new Date().toISOString(),
  };

  const links = profile.links.map((link: any) => ({
    id: link.id,
    title: link.title,
    url: link.url,
    icon: link.icon || 'Link',
    thumbnail_url: link.thumbnail_url ?? null,
    clicks: 0,
    enabled: true,
    order: 0,
  }));

  const profileConfig = profile.profile_config;
  const bgStyle: React.CSSProperties = {
    minHeight: '100vh',
    ...(profileConfig?.background_type === 'image' && profileConfig?.background_value
      ? {
          backgroundImage: `url(${profileConfig.background_value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {
          backgroundColor: profileConfig?.background_value || '#faf9f7',
        }),
    color: profileConfig?.text_color || '#1a1a1a',
  };

  const storeUrl = store?.products?.length ? `/${username}/store` : null;

  return (
    <div style={bgStyle}>
      <div className="max-w-lg mx-auto px-4 py-12">
        <ProfileHeader
          user={user}
          textColor={profileConfig?.text_color || undefined}
          storeUrl={storeUrl}
        />

        <div className="mt-8 space-y-4">
          {links.map((link) => (
            <LinkButton key={link.id} link={link} textColor={profileConfig?.text_color || undefined} />
          ))}
        </div>

        {links.length === 0 && (
          <div className="mt-8 text-center opacity-70">
            <p>No links added yet.</p>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center space-y-4">
          <SupportButton
            username={username}
            buttonText={profileConfig?.support_button_text || 'Support me'}
          />

          {/* Media Kit link commented out - coming soon */}
          {/* <Link href={`/${username}/media-kit`}>
            <Button variant="ghost" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              View Media Kit
            </Button>
          </Link> */}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs opacity-70">
            Powered by{' '}
            <Link href="/" className="underline hover:opacity-90" style={{ color: 'inherit' }}>
              {siteConfig.name}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
