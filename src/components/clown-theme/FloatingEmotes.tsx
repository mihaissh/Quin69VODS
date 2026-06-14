'use client';

import Image from 'next/image';
import { useMemo, useState, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { EMOTES, getEmotePath } from '@/constants/emotes';

/**
 * Configuration constants for waterfall emotes
 */
const WATERFALL_CONFIG = {
  COLUMNS: 8,
  ROWS_PER_COLUMN: 3,
  MIN_SIZE: 60,
  MAX_SIZE: 150,
  MIN_DURATION: 10,
  MAX_DURATION: 16,
  SIZE_DISTRIBUTION: {
    SMALL_THRESHOLD: 0.3,
    MEDIUM_THRESHOLD: 0.7,
    SMALL_RANGE: { min: 60, max: 90 },
    MEDIUM_RANGE: { min: 90, max: 130 },
    LARGE_RANGE: { min: 130, max: 150 },
  },
  // Enhanced visual variety
  OPACITY: {
    MIN: 0.4,
    MAX: 0.8,
  },
  ROTATION: {
    MIN: -15,
    MAX: 15,
  },
  SCALE_VARIATION: {
    MIN: 0.9,
    MAX: 1.1,
  },
} as const;

/**
 * Size category for emote distribution
 */
type SizeCategory = 'small' | 'medium' | 'large';

/**
 * Waterfall emote configuration
 */
interface WaterfallEmote {
  readonly id: string;
  readonly emote: string;
  readonly size: number;
  readonly duration: number;
  readonly delay: number;
  readonly xPosition: number;
  readonly columnIndex: number;
  readonly rowIndex: number;
  readonly sizeCategory: SizeCategory;
  readonly opacity: number;
  readonly rotation: number;
  readonly scale: number;
  readonly glowIntensity: number;
}

/**
 * Generate a random size based on distribution thresholds
 */
const generateSize = (random: number): { size: number; category: SizeCategory } => {
  const { SMALL_THRESHOLD, MEDIUM_THRESHOLD, SMALL_RANGE, MEDIUM_RANGE, LARGE_RANGE } = 
    WATERFALL_CONFIG.SIZE_DISTRIBUTION;

  if (random < SMALL_THRESHOLD) {
    const size = SMALL_RANGE.min + Math.random() * (SMALL_RANGE.max - SMALL_RANGE.min);
    return { size: Math.round(size), category: 'small' };
  }
  
  if (random < MEDIUM_THRESHOLD) {
    const size = MEDIUM_RANGE.min + Math.random() * (MEDIUM_RANGE.max - MEDIUM_RANGE.min);
    return { size: Math.round(size), category: 'medium' };
  }
  
  const size = LARGE_RANGE.min + Math.random() * (LARGE_RANGE.max - LARGE_RANGE.min);
  return { size: Math.round(size), category: 'large' };
};

/**
 * Generate a random duration within configured range
 */
const generateDuration = (): number => {
  const { MIN_DURATION, MAX_DURATION } = WATERFALL_CONFIG;
  return MIN_DURATION + Math.random() * (MAX_DURATION - MIN_DURATION);
};

/**
 * Calculate X position for a column with slight randomization
 */
const calculateXPosition = (columnIndex: number, totalColumns: number): number => {
  const basePosition = (columnIndex / totalColumns) * 100;
  const randomOffset = (Math.random() - 0.5) * 8; // ±4% variation
  return basePosition + randomOffset;
};

/**
 * Generate random visual properties for variety
 */
const generateVisualProperties = () => {
  const { OPACITY, ROTATION, SCALE_VARIATION } = WATERFALL_CONFIG;
  
  return {
    opacity: OPACITY.MIN + Math.random() * (OPACITY.MAX - OPACITY.MIN),
    rotation: ROTATION.MIN + Math.random() * (ROTATION.MAX - ROTATION.MIN),
    scale: SCALE_VARIATION.MIN + Math.random() * (SCALE_VARIATION.MAX - SCALE_VARIATION.MIN),
    glowIntensity: 0.3 + Math.random() * 0.4, // 0.3-0.7
  };
};

/**
 * Generate waterfall emote configurations
 */
const generateWaterfallEmotes = (): WaterfallEmote[] => {
  const emotes: WaterfallEmote[] = [];
  const allEmotesArray = Array.from(EMOTES.FLOATING);
  const { COLUMNS, ROWS_PER_COLUMN } = WATERFALL_CONFIG;
  let emoteCounter = 0;

  for (let col = 0; col < COLUMNS; col++) {
    for (let row = 0; row < ROWS_PER_COLUMN; row++) {
      // Random emote selection
      const emoteIndex = Math.floor(Math.random() * allEmotesArray.length);
      const selectedEmote = allEmotesArray[emoteIndex];

      // Generate size and category
      const sizeRandom = Math.random();
      const { size, category } = generateSize(sizeRandom);

      // Generate duration
      const duration = generateDuration();

      // Calculate delay for staggered animation
      const delay = row * (duration / ROWS_PER_COLUMN);

      // Calculate X position
      const xPosition = calculateXPosition(col, COLUMNS);

      // Generate visual variety
      const visualProps = generateVisualProperties();

      emotes.push({
        id: `waterfall-${emoteCounter++}`,
        emote: selectedEmote,
        size,
        duration,
        delay,
        xPosition,
        columnIndex: col,
        sizeCategory: category,
        rowIndex: row, // Add row index for priority calculation
        ...visualProps,
      });
    }
  }

  return emotes;
};

/**
 * Individual waterfall emote component
 * Optimized for performance with CSS transforms and interactive effects
 */
interface WaterfallEmoteItemProps {
  emote: WaterfallEmote;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isPriority: boolean;
}

function WaterfallEmoteItem({ 
  emote, 
  isHovered, 
  onMouseEnter, 
  onMouseLeave,
  isPriority
}: WaterfallEmoteItemProps) {
  const animationStyle = useMemo(
    () => ({
      left: `${emote.xPosition}%`,
      top: '-150px',
      width: emote.size,
      height: emote.size,
      animation: `waterfallEnhanced ${emote.duration}s linear infinite`,
      animationDelay: `${emote.delay}s`,
      opacity: isHovered ? 1 : emote.opacity,
      transform: `rotate(${emote.rotation}deg) scale(${isHovered ? emote.scale * 1.3 : emote.scale})`,
      filter: isHovered 
        ? `drop-shadow(0 0 ${emote.glowIntensity * 30}px rgba(16, 185, 129, 0.8)) drop-shadow(0 0 ${emote.glowIntensity * 15}px rgba(16, 185, 129, 0.6))`
        : `drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 ${emote.glowIntensity * 10}px rgba(16, 185, 129, ${emote.glowIntensity * 0.3}))`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: isHovered ? 10 : 5,
    }),
    [emote, isHovered]
  );

  return (
    <div
      className="fixed pointer-events-auto will-change-transform cursor-pointer"
      style={animationStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-hidden="true"
    >
      <Image
        src={getEmotePath(emote.emote)}
        alt=""
        width={emote.size}
        height={emote.size}
        className="w-full h-full object-contain select-none"
        loading="eager"
        priority={isPriority}
        unoptimized
        draggable={false}
      />
    </div>
  );
}

/**
 * FloatingEmotes Component
 * 
 * Displays an interactive waterfall effect of clown emotes falling from top to bottom.
 * Features:
 * - Hover interactions with glow effects
 * - Varied opacity, rotation, and scale
 * - Enhanced animations with rotation
 * - GPU-accelerated transforms
 * - Responsive to user interaction
 */
export function FloatingEmotes() {
  const { clownMode } = useTheme();
  const [hoveredEmoteId, setHoveredEmoteId] = useState<string | null>(null);

  // Memoize emote generation to prevent regeneration on every render
  const emotes = useMemo(() => generateWaterfallEmotes(), []);

  // Determine which emotes should have priority (first row + largest emotes, above the fold)
  // Must be called before early return to follow React hooks rules
  const priorityEmoteIds = useMemo(() => {
    const priorityIds = new Set<string>();
    
    // Prioritize all first-row emotes (rowIndex === 0) - these appear first and are above the fold
    const firstRowEmotes = emotes.filter(e => e.rowIndex === 0);
    firstRowEmotes.forEach(emote => priorityIds.add(emote.id));
    
    // Also prioritize the largest emotes overall (they're more likely to be detected as LCP)
    // Sort all emotes by size and add top 6 largest to priority
    const largestEmotes = [...emotes]
      .sort((a, b) => b.size - a.size)
      .slice(0, 6);
    largestEmotes.forEach(emote => priorityIds.add(emote.id));
    
    return priorityIds;
  }, [emotes]);

  const handleMouseEnter = useCallback((emoteId: string) => {
    setHoveredEmoteId(emoteId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredEmoteId(null);
  }, []);

  // Early return if clown mode is disabled
  if (!clownMode) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{ zIndex: 1 }}
    >
      {emotes.map((emote) => (
        <WaterfallEmoteItem
          key={emote.id}
          emote={emote}
          isHovered={hoveredEmoteId === emote.id}
          onMouseEnter={() => handleMouseEnter(emote.id)}
          onMouseLeave={handleMouseLeave}
          isPriority={priorityEmoteIds.has(emote.id)}
        />
      ))}
    </div>
  );
}
