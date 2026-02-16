import { BadgeCheck, ShoppingBag } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import type { User } from '@/types';

interface ProfileHeaderProps {
  user: User;
  textColor?: string;
  storeUrl?: string | null;
}

export function ProfileHeader({ user, textColor, storeUrl }: ProfileHeaderProps) {
  const style = textColor ? { color: textColor } : undefined;
  const mutedStyle = textColor ? { color: `${textColor}CC` } : undefined;
  return (
    <div className="text-center" style={style}>
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
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <div className="flex items-center justify-center gap-2">
        <p style={textColor ? mutedStyle : undefined} className={!textColor ? 'text-text-secondary' : ''}>
          @{user.username}
        </p>
        {storeUrl && (
          <a
            href={storeUrl}
            className="inline-flex items-center text-xs px-2 py-1 rounded-full border border-border bg-card/70 shadow-soft"
            style={textColor ? mutedStyle : undefined}
          >
            <ShoppingBag className="h-3 w-3 mr-1" />
            Store
          </a>
        )}
      </div>
      {user.bio && (
        <p className={`text-sm mt-3 max-w-md mx-auto ${!textColor ? 'text-text-secondary' : ''}`} style={textColor ? mutedStyle : undefined}>
          {user.bio}
        </p>
      )}
    </div>
  );
}
