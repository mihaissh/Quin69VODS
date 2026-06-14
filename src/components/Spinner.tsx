/**
 * Optimized CSS-based Spinner Component
 * Uses CSS animations for better performance and reliability on slow networks
 */

import type { SpinnerProps, LoadingSpinnerProps } from '@/types/spinner';

export function Spinner({ 
  className = "w-10 h-10", 
  size = 32,
  color = "currentColor" 
}: SpinnerProps) {
  return (
    <div 
      className={`${className} relative inline-block`}
      style={{ width: size, height: size }}
      aria-label="Loading"
      role="status"
    >
      {/* Rotating circle spinner - reliable on all connections */}
      <svg 
        className="animate-spin"
        width={size} 
        height={size} 
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke={color}
          strokeWidth="3"
        />
        <path 
          className="opacity-75" 
          fill={color}
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

/**
 * Centered loading state with spinner and text
 */
export function LoadingSpinner({ 
  text = "Loading",
  className = ""
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center gap-3 py-8 ${className}`}>
      <Spinner className="w-10 h-10 text-[var(--color-amber)]" />
      <span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider">
        {text}
      </span>
    </div>
  );
}

