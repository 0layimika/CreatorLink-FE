import Link from 'next/link';
// import { FileText } from 'lucide-react'; // Commented out - media kit coming soon
import { ProfileHeader } from '@/components/public-profile/ProfileHeader';
import { LinkButton } from '@/components/public-profile/LinkButton';
import { SupportButton } from '@/components/public-profile/SupportButton';
import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/lib/constants';
import { profileApi, analyticsApi } from '@/lib/api';

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

  const links = profile.links.map((link) => ({
    id: link.id,
    title: link.title,
    url: link.url,
    icon: link.icon || 'Link',
    clicks: 0,
    enabled: true,
    order: 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="max-w-lg mx-auto px-4 py-12">
        <ProfileHeader user={user} />

        <div className="mt-8 space-y-4">
          {links.map((link) => (
            <LinkButton key={link.id} link={link} />
          ))}
        </div>

        {links.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-text-secondary">
              No links added yet.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center space-y-4">
          <SupportButton username={username} />

          {/* Media Kit link commented out - coming soon */}
          {/* <Link href={`/${username}/media-kit`}>
            <Button variant="ghost" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              View Media Kit
            </Button>
          </Link> */}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-text-secondary">
            Powered by{' '}
            <Link href="/" className="text-primary hover:underline">
              {siteConfig.name}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
