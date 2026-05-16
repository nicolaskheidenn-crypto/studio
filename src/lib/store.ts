"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'fire' | 'water' | 'nature' | 'raining' | 'default';

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'default',
      setTheme: (theme) => {
        if (typeof document !== 'undefined') {
          const body = document.body;
          // Clear all potential theme classes
          body.classList.remove('theme-fire', 'theme-water', 'theme-nature', 'theme-raining');
          // Add the new one if it's not default
          if (theme !== 'default') {
            body.classList.add(`theme-${theme}`);
          }
        }
        set({ theme });
      },
      isAdmin: false,
      setIsAdmin: (isAdmin) => set({ isAdmin }),
    }),
    {
      name: 'fireproof-storage',
      onRehydrateStorage: () => (state) => {
        return () => {
          if (state && typeof document !== 'undefined') {
            const body = document.body;
            body.classList.remove('theme-fire', 'theme-water', 'theme-nature', 'theme-raining');
            if (state.theme && state.theme !== 'default') {
              body.classList.add(`theme-${state.theme}`);
            }
          }
        };
      }
    }
  )
);

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
}

interface PageState {
  pages: Page[];
  isLoaded: boolean;
  addPage: (page: Omit<Page, 'id' | 'createdAt'>) => void;
  updatePage: (id: string, page: Partial<Page>) => void;
  deletePage: (id: string) => void;
}

export const usePages = create<PageState>()(
  persist(
    (set) => ({
      pages: [],
      isLoaded: true,
      addPage: (pageData) => set((state) => ({
        pages: [
          ...state.pages,
          {
            ...pageData,
            id: Math.random().toString(36).substring(2, 9),
            createdAt: new Date().toISOString(),
          }
        ]
      })),
      updatePage: (id, pageData) => set((state) => ({
        pages: state.pages.map((p) => p.id === id ? { ...p, ...pageData } : p)
      })),
      deletePage: (id) => set((state) => ({
        pages: state.pages.filter((p) => p.id !== id)
      })),
    }),
    {
      name: 'fireproof-pages-storage',
    }
  )
);
