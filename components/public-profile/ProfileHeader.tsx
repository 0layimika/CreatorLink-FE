import { BadgeCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import type { User } from '@/types';

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <div className="relative">
          <Avatar src={user.avatar} size="xl" className="h-24 w-24 text-2xl shadow-medium" />
          {user.verified && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-soft">
              <BadgeCheck className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </div>
      <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
      <p className="text-text-secondary">@{user.username}</p>
      {user.bio && (
        <p className="text-sm text-text-secondary mt-3 max-w-md mx-auto">
          {user.bio}
        </p>
      )}
    </div>
  );
}
