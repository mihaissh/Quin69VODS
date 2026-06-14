'use client';

import type { HeaderProps } from '@/types/header';
import { Reveal } from './Reveal';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Header(_props: HeaderProps) {
  return (
    <header className="mb-6 relative">

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
              playlist tracker
            </h1>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}
            >
              Real-time stream playlist · media player integration · song history
            </p>
          </div>


        </div>
      </Reveal>
    </header>
  );
}


