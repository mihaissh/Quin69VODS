'use client';

import type { InfoFieldProps } from '@/types/music';

/**
 * Info field component for displaying labeled information
 */
export function InfoField({ 
  label, 
  value, 
  labelColor = "text-[var(--color-amber)]",
  textSize = "text-base"
}: InfoFieldProps) {
  return (
    <div className="relative">
      <span className={`${labelColor} text-[10px] font-semibold uppercase tracking-wider block mb-1.5 relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
        {label}
      </span>
      <p className={`${textSize} font-bold text-[var(--color-text-primary)] leading-tight relative z-10`} style={{
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5)'
      }}>
        {value}
      </p>
    </div>
  );
}

