import { BadgeCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import type { User } from '@/types';
import { optimizeCloudinaryImage } from '@/lib/media';

interface ProfileHeaderProps {
  user: User;
  textColor?: string;
}

export function ProfileHeader({ user, textColor }: ProfileHeaderProps) {
  const style = textColor ? { color: textColor } : undefined;
  return (
    <header className="creator-profile-header text-center" style={style}>
      <div className="mb-5 flex justify-center">
        <div className="relative">
          <div className="rounded-full border border-[color:color-mix(in_srgb,var(--creator-text)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--creator-text)_8%,transparent)] p-1.5 backdrop-blur-xl">
            <Avatar
              src={optimizeCloudinaryImage(user.avatar, 256, 256)}
              name={user.name}
              size="xl"
              className="h-28 w-28 border border-[color:color-mix(in_srgb,var(--creator-text)_14%,transparent)] text-3xl shadow-none sm:h-32 sm:w-32"
            />
          </div>
          {user.verified && (
            <div className="absolute bottom-1 right-1 rounded-full bg-white p-0.5 shadow-sm">
              <BadgeCheck className="h-7 w-7 fill-primary text-white" aria-label="Verified creator" />
            </div>
          )}
        </div>
      </div>
      <h1 className="font-display text-[clamp(2.35rem,11vw,4.25rem)] font-black leading-[0.92] tracking-[-0.065em]">
        {user.name}
      </h1>
      <p className="mt-3 text-sm font-extrabold tracking-[-0.01em] opacity-65">@{user.username}</p>
      {user.bio && (
        <p className="mx-auto mt-5 max-w-lg text-[0.98rem] font-medium leading-7 opacity-80">
          {user.bio}
        </p>
      )}
    </header>
  );
}
