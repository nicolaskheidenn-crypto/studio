
'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function ThemeObserver() {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const body = document.body;
      const themeClasses = ['theme-fire', 'theme-water', 'theme-nature', 'theme-raining'];
      body.classList.remove(...themeClasses);
      if (theme !== 'default') {
        body.classList.add(`theme-${theme}`);
      }
    }
  }, [theme]);

  return null;
}
