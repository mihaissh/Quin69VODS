'use client';

import { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ClownEmoji {
  id: string;
  top: number;
  left: number;
  size: number;
  rotation: number;
}

const generateClownEmojis = (): ClownEmoji[] => {
  const emojis: ClownEmoji[] = [];
  const gridSize = 20; // 20x20 grid to avoid overlaps
  const cellHeight = 100 / gridSize;
  const cellWidth = 100 / gridSize;
  const usedCells = new Set<string>();

  // Create 12 emojis in a grid pattern with some randomness
  for (let i = 0; i < 12; i++) {
    let gridRow, gridCol, cellKey;

    // Find an unused cell
    do {
      gridRow = Math.floor(Math.random() * gridSize);
      gridCol = Math.floor(Math.random() * gridSize);
      cellKey = `${gridRow}-${gridCol}`;
    } while (usedCells.has(cellKey));

    usedCells.add(cellKey);

    // Add some randomness within the cell
    const top = (gridRow * cellHeight) + Math.random() * (cellHeight * 0.8);
    const left = (gridCol * cellWidth) + Math.random() * (cellWidth * 0.8);
    const size = 24 + Math.random() * 12; // 24-36px (smaller!)

    emojis.push({
      id: `clown-${i}`,
      top,
      left,
      size,
      rotation: Math.random() * 360,
    });
  }

  return emojis;
};

export function ClownEmojis() {
  const { clownMode } = useTheme();
  const emojis = useMemo(() => generateClownEmojis(), []);

  if (!clownMode) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0" style={{ top: 0, left: 0, right: 0, bottom: 0, overflow: 'visible' }}>
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className="fixed animate-clown-pulse"
          style={{
            top: `${emoji.top}vh`,
            left: `${emoji.left}vw`,
            fontSize: `${emoji.size}px`,
            transform: `rotate(${emoji.rotation}deg)`,
            pointerEvents: 'none',
            userSelect: 'none',
            lineHeight: '1',
          }}
        >
          🤡
        </div>
      ))}
    </div>
  );
}
