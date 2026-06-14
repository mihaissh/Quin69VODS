'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeContextValue } from '@/types/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'quin69-clown-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [clownMode, setClownMode] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClownMode(true);
    }
  }, []);

  const toggleClownMode = () => {
    setClownMode((prev) => {
      const newValue = !prev;
      localStorage.setItem(STORAGE_KEY, newValue.toString());
      return newValue;
    });
  };

  return (
    <ThemeContext.Provider value={{ clownMode, toggleClownMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
