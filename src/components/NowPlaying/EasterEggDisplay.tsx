'use client';

import Image from 'next/image';
import { ASSETS } from '@/constants';

/**
 * Easter egg display component
 */
export function EasterEggDisplay() {
  const getAssetPath = (filename: string): string => {
    return `${ASSETS.BASE_PATH}/${filename}`;
  };

  return (
    <div className="relative flex h-52 w-52 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-900/50">
      <Image
        src={getAssetPath(ASSETS.EASTER_EGG_GIF)}
        alt="Easter Egg"
        fill
        sizes="208px"
        className="object-contain animate-fade-in-out"
        loading="lazy"
        unoptimized
      />
    </div>
  );
}

