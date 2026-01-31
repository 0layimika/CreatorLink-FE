import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { BadgeCheck } from 'lucide-react';
import type { User, Link, ProfileConfig } from '@/types';

interface PhoneMockupProps {
  user: User;
  links: Link[];
  profileConfig?: ProfileConfig | null;
}

export function PhoneMockup({ user, links, profileConfig }: PhoneMockupProps) {
  const enabledLinks = links.filter((link) => link.enabled);
  const bgStyle: React.CSSProperties = profileConfig?.background_type === 'image' && profileConfig?.background_value
    ? { backgroundImage: `url(${profileConfig.background_value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: profileConfig?.background_value || '#faf9f7' };
  const textColor = profileConfig?.text_color || '#1a1a1a';
  const supportButtonText = profileConfig?.support_button_text || 'Support me';

  return (
    <div className="rounded-[3rem] border-4 border-border p-4 w-full max-w-[320px] mx-auto shadow-medium" style={bgStyle}>
      <div className="rounded-[2.5rem] overflow-hidden shadow-soft bg-card/80 backdrop-blur" style={{ color: textColor }}>
        {/* Notch */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-24 h-6 bg-foreground/10 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-8 pt-4 min-h-[500px]">
          {/* Profile */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <Avatar src={user.avatar} size="xl" />
            </div>
            <div className="flex items-center justify-center space-x-1">
              <h2 className="font-semibold">{user.name}</h2>
              {user.verified && (
                <BadgeCheck className="h-4 w-4 text-primary" />
              )}
            </div>
            <p className="text-sm opacity-80">@{user.username}</p>
            <p className="text-xs opacity-80 mt-2 line-clamp-2">
              {user.bio}
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            {enabledLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-3 rounded-lg p-3 text-center text-sm font-medium border border-border hover:border-primary/50 shadow-soft transition-all bg-background/50"
              >
                {link.thumbnail_url ? (
                  <div className="shrink-0 w-8 h-8 rounded overflow-hidden bg-muted">
                    <img src={link.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : null}
                <span className="truncate flex-1">{link.title}</span>
              </div>
            ))}
          </div>

          {enabledLinks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs opacity-80">No links added yet</p>
            </div>
          )}

          {/* Support Button */}
          <div className="mt-6 text-center">
            <Button size="sm" className="bg-gradient-primary text-white shadow-soft">
              {supportButtonText}
            </Button>
          </div>

          {/* Branding */}
          <div className="mt-8 text-center">
            <p className="text-xs opacity-80">
              Powered by <span className="text-primary">LinkVerse</span>
            </p>
          </div>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center pb-3">
          <div className="w-32 h-1 bg-border rounded-full" />
        </div>
      </div>
    </div>
  );
}
