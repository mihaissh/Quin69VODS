'use client';

import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { EMOTES, getEmotePath } from '@/constants/emotes';

interface ScatteredEmote {
  id: string;
  src: string;
  size: number;
  top: number;
  left: number;
  rotation: number;
  animationType: 'float' | 'sway' | 'bob' | 'fade';
  animationDelay: number;
}

const generateScatteredEmotes = (): ScatteredEmote[] => {
  const emotes: ScatteredEmote[] = [];
  const allEmotesArray = Array.from(EMOTES.SCATTERED);
  const gridSize = 12; // 12x12 grid for scattered emotes
  const cellHeight = 100 / gridSize;
  const cellWidth = 100 / gridSize;
  const usedCells = new Set<string>();
  const animationTypes: Array<'float' | 'sway' | 'bob' | 'fade'> = ['float', 'sway', 'bob', 'fade'];

  // Create 24 scattered emotes spread across the page with no overlaps
  for (let i = 0; i < 24; i++) {
    let gridRow, gridCol, cellKey;

    // Find an unused cell
    do {
      gridRow = Math.floor(Math.random() * gridSize);
      gridCol = Math.floor(Math.random() * gridSize);
      cellKey = `${gridRow}-${gridCol}`;
    } while (usedCells.has(cellKey) && usedCells.size < gridSize * gridSize);

    if (usedCells.has(cellKey)) break; // Exit if we've used all cells

    usedCells.add(cellKey);

    // Select a random emote from all available
    const emote = allEmotesArray[Math.floor(Math.random() * allEmotesArray.length)];

    // Add some randomness within the cell
    const top = (gridRow * cellHeight) + Math.random() * (cellHeight * 0.7);
    const left = (gridCol * cellWidth) + Math.random() * (cellWidth * 0.7);
    const size = Math.random() * 35 + 40; // 40-75px with more variety
    const animationType = animationTypes[Math.floor(Math.random() * animationTypes.length)];
    const animationDelay = Math.random() * 2; // 0-2s stagger

    emotes.push({
      id: `scattered-${i}`,
      src: emote,
      size,
      top,
      left,
      rotation: Math.random() * 360,
      animationType,
      animationDelay,
    });
  }

  return emotes;
};

export function ScatteredEmotes() {
  const { clownMode } = useTheme();

  if (!clownMode) return null;

  const emotes = generateScatteredEmotes();

  const getAnimationClass = (animationType: string) => {
    switch (animationType) {
      case 'float':
        return 'animate-scattered-float';
      case 'sway':
        return 'animate-scattered-sway';
      case 'bob':
        return 'animate-scattered-bob';
      case 'fade':
        return 'animate-scattered-fade';
      default:
        return 'animate-scattered-float';
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0" style={{ top: 0, left: 0, right: 0, bottom: 0, overflow: 'visible' }}>
      {emotes.map((emote) => (
        <div
          key={emote.id}
          className={`fixed pointer-events-none ${getAnimationClass(emote.animationType)}`}
          style={{
            top: `${emote.top}vh`,
            left: `${emote.left}vw`,
            width: emote.size,
            height: emote.size,
            opacity: emote.animationType === 'fade' ? 0.08 : 0.1,
            pointerEvents: 'none',
            animationDelay: `${emote.animationDelay}s`,
            '--rotation': `${emote.rotation}deg`,
          } as React.CSSProperties & { '--rotation': string }}
        >
          <Image
            src={getEmotePath(emote.src)}
            alt="scattered clown emote"
            width={emote.size}
            height={emote.size}
            className="w-full h-full object-contain"
            priority={false}
          />
        </div>
      ))}
    </div>
  );
}
