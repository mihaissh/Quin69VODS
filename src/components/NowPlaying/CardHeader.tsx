'use client';

import { MusicIcon } from '@/components/shared';

/**
 * Card header component for Now Playing card
 */
export function CardHeader({ className = '' }: { className?: string }) {
  return (
    <div
      className={`px-3 py-2 border-b relative z-20 ${className}`}
      style={{
        height: '40px',
        borderColor: 'var(--color-amber-line)',
        backgroundColor: 'var(--color-bg-elevated)',
      }}
    >
      <h3 className="text-xs font-medium text-[var(--color-amber)] flex items-center gap-1.5">
        <MusicIcon />
        Now Playing
      </h3>
    </div>
  );
}

