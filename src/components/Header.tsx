'use client';

import type { HeaderProps } from '@/types/header';
import { Reveal } from './Reveal';
import { ThemeToggle, ComponentEmote } from './clown-theme';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Header(_props: HeaderProps) {
  return (
    <header className="mb-6 relative">
      <ComponentEmote position="top-right" size={56} />
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-black tracking-tight mb-1"
              style={{ color: "var(--color-text-primary)", letterSpacing: "-0.03em" }}
            >
              Quin69
              <span style={{ color: "var(--color-amber)" }}> /</span>
              {" "}
              playlist
            </h1>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
            >
              Real-time stream playlist · media player integration · song history
            </p>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </Reveal>
    </header>
  );
}


