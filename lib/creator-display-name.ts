import type { CreatorIdentity } from '@/types';

export function getCreatorDisplayName(creator: CreatorIdentity): string {
  const customName = creator.display_name?.trim();
  if (customName) return customName;

  const fullName = [creator.first_name, creator.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');

  return fullName || creator.username;
}
