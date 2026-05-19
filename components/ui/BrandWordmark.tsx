'use client';

import Image from 'next/image';
import { siteConfig } from '@/lib/constants';

interface BrandWordmarkProps {
  textClassName?: string;
  imageClassName?: string;
}

export function BrandWordmark({
  textClassName = 'font-display text-xl font-bold text-foreground',
  imageClassName = 'rounded-lg',
}: BrandWordmarkProps) {
  return (
    <span className="inline-flex items-center space-x-2">
      <Image
        src={siteConfig.logo}
        alt={siteConfig.name}
        width={32}
        height={32}
        className={imageClassName}
      />
      <span className={textClassName}>{siteConfig.name}</span>
    </span>
  );
}
