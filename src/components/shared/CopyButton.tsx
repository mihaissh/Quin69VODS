'use client';

import { useState } from 'react';
import { logger } from '@/utils/logger';
import type { IconProps } from '@/types/common';

const CopyIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

export interface CopyButtonProps {
  songText: string;
  variant?: 'button' | 'div';
  className?: string;
}

/**
 * Reusable copy button component
 * Can be used as a button or div (for keyboard accessibility)
 */
export function CopyButton({ songText, variant = 'button', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(songText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error('Failed to copy:', err);
    }
  };

  const baseClasses = `p-2 rounded-lg backdrop-blur-sm transition-all duration-300 border shadow-lg relative overflow-hidden ${
    copied
      ? 'bg-[var(--color-amber-dim)] text-[var(--color-amber)] border-[var(--color-amber-line)]'
      : 'bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-amber)] border-[var(--color-border)]'
  } ${className}`;

  const content = (
    <>
      <div className={`relative transition-all duration-300 ${copied ? 'scale-0 rotate-180' : 'scale-100 rotate-0'}`}>
        <CopyIcon className="w-4 h-4" />
      </div>
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${copied ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'}`}>
        <CheckIcon className="w-4 h-4" />
      </div>
      
      {/* Ripple effect */}
      {copied && (
        <div className="absolute inset-0 rounded-lg bg-[var(--color-amber-line)] animate-ping" style={{ animationDuration: '0.6s' }} />
      )}
    </>
  );

  if (variant === 'div') {
    return (
      <div
        onClick={handleCopy}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCopy();
          }
        }}
        className={`${baseClasses} cursor-pointer`}
        aria-label="Copy song and artist"
      >
        {content}
      </div>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={baseClasses}
      aria-label="Copy song and artist"
    >
      {content}
    </button>
  );
}
