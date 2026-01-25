import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { BadgeCheck } from 'lucide-react';
import type { User, Link } from '@/types';

interface PhoneMockupProps {
  user: User;
  links: Link[];
}

export function PhoneMockup({ user, links }: PhoneMockupProps) {
  console.log(user, links);
  const enabledLinks = links.filter((link) => link.enabled);

  return (
    <div className="bg-muted rounded-[3rem] border-4 border-border p-4 w-full max-w-[320px] mx-auto shadow-medium">
      <div className="bg-background rounded-[2.5rem] overflow-hidden shadow-soft">
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
              <h2 className="font-semibold text-foreground">{user.name}</h2>
              {user.verified && (
                <BadgeCheck className="h-4 w-4 text-primary" />
              )}
            </div>
            <p className="text-sm text-text-secondary">@{user.username}</p>
            <p className="text-xs text-text-secondary mt-2 line-clamp-2">
              {user.bio}
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            {enabledLinks.map((link) => (
              <div
                key={link.id}
                className="bg-card rounded-lg p-3 text-center text-sm font-medium text-foreground border border-border hover:border-primary/50 shadow-soft transition-all"
              >
                {link.title}
              </div>
            ))}
          </div>

          {enabledLinks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs text-text-secondary">
                No links added yet
              </p>
            </div>
          )}

          {/* Support Button */}
          <div className="mt-6 text-center">
            <Button size="sm" className="bg-gradient-primary text-white shadow-soft">
              Support me
            </Button>
          </div>

          {/* Branding */}
          <div className="mt-8 text-center">
            <p className="text-xs text-text-secondary">
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
