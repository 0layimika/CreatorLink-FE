import Link from 'next/link';
import { ArrowLeft, Download, Mail } from 'lucide-react';
import { ProfileHeader } from '@/components/public-profile/ProfileHeader';
import { MediaKitStats } from '@/components/public-profile/MediaKitStats';
import { Button } from '@/components/ui/Button';
import { mockMediaKit } from '@/data/mock';
import { siteConfig } from '@/lib/constants';
import { profileApi } from '@/lib/api';

interface MediaKitPageProps {
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

export async function generateMetadata({ params }: MediaKitPageProps) {
  const { username } = await params;
  const profile = await getProfile(username);
  
  const name = profile
    ? `${profile.first_name} ${profile.last_name}`.trim() || profile.username
    : username;
  
  return {
    title: `${name}'s Media Kit | ${siteConfig.name}`,
    description: `View ${name}'s media kit, stats, and collaboration rates on ${siteConfig.name}`,
  };
}

export default async function PublicMediaKitPage({ params }: MediaKitPageProps) {
  const { username } = await params;
  const profile = await getProfile(username);

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

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link href={`/${username}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to profile
            </Button>
          </Link>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button size="sm" className="shadow-soft">
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="mb-12">
          <ProfileHeader user={user} />
          <div className="mt-4 text-center">
            <p className="text-xl font-semibold text-primary">
              {mockMediaKit.headline}
            </p>
            <p className="text-text-secondary mt-2 max-w-2xl mx-auto">
              {mockMediaKit.bio}
            </p>
          </div>
        </div>

        {/* Stats */}
        <MediaKitStats mediaKit={mockMediaKit} />

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-text-secondary">
            Interested in collaborating?{' '}
            <a
              href={`mailto:contact@${username}.com`}
              className="text-primary hover:underline"
            >
              Get in touch
            </a>
          </p>
          <p className="text-xs text-text-secondary mt-4">
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
