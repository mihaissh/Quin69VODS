'use client';

import Image from 'next/image';
import { MusicIcon } from '@/components/shared';
import type { AlbumArtworkProps } from '@/types/music';

/**
 * Album artwork display component
 */
export function AlbumArtwork({ src, alt = "Album Art" }: AlbumArtworkProps) {
  if (src) {
    return (
      <div className="relative h-52 w-52 flex-shrink-0 overflow-hidden rounded-lg shadow-2xl shadow-black/60">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="208px"
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <div className="w-52 h-52 rounded-lg bg-zinc-800/50 flex items-center justify-center flex-shrink-0 shadow-2xl shadow-black/60">
      <MusicIcon className="w-24 h-24 text-zinc-600" />
    </div>
  );
}

