'use client';

import { GripVertical, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Link } from '@/types';

interface LinkItemProps {
  link: Link;
  onEdit?: (link: Link) => void;
  onDelete?: (id: string) => void;
  onToggle?: (id: string, enabled: boolean) => void;
}

export function LinkItem({ link, onEdit, onDelete, onToggle }: LinkItemProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-4 transition-all shadow-soft hover:shadow-medium',
        !link.enabled && 'opacity-50'
      )}
    >
      <div className="flex items-center space-x-4">
        <button className="cursor-grab text-text-secondary hover:text-foreground transition-colors">
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-foreground truncate">
              {link.title}
            </h3>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-primary transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <p className="text-sm text-text-secondary truncate">{link.url}</p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={link.enabled}
              onChange={() => onToggle?.(link.id, !link.enabled)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-border rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:shadow-sm after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(link)}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(link.id)}
            className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
