'use client';

import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { clownMode, toggleClownMode } = useTheme();

  return (
    <button
      onClick={toggleClownMode}
      aria-label="Toggle clown theme"
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-full
        transition-all duration-300 ease-out
        ${
          clownMode
            ? 'bg-gradient-to-r from-clown-red via-clown-blue to-clown-purple'
            : 'bg-zinc-700/50 hover:bg-zinc-600/50'
        }
        border border-zinc-600 hover:border-zinc-500
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900
        ${clownMode ? 'focus:ring-clown-red' : 'focus:ring-emerald-500'}
      `}
      title={clownMode ? 'Clown Mode: ON' : 'Clown Mode: OFF'}
    >
      <span className="text-lg">
        {clownMode ? '🤡' : '🎪'}
      </span>
    </button>
  );
}
