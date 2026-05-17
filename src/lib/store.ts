
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
          const themeClasses = ['theme-fire', 'theme-water', 'theme-nature', 'theme-raining'];
          body.classList.remove(...themeClasses);
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
            const themeClasses = ['theme-fire', 'theme-water', 'theme-nature', 'theme-raining'];
            body.classList.remove(...themeClasses);
            if (state.theme && state.theme !== 'default') {
              body.classList.add(`theme-${state.theme}`);
            }
          }
        };
      }
    }
  )
);

export interface QuizQuestion {
  id: string;
  type: 'multiple' | 'boolean' | 'id';
  question: string;
  options?: string[];
  answer: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface ManagedTask {
  id: string;
  day: number;
  title: string;
  description: string;
}

interface AdminStore {
  quizzes: Quiz[];
  dailyTasks: ManagedTask[];
  addQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
  addTask: (task: Omit<ManagedTask, 'id'>) => void;
  deleteQuiz: (id: string) => void;
  deleteTask: (id: string) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      quizzes: [],
      dailyTasks: [
        { id: '1', day: 1, title: 'Strategic Morning Brew', description: 'Align your vision with your primary goal for the day.' },
        { id: '2', day: 2, title: 'Market Pulse Check', description: 'Analyze top 3 competitors in your niche.' }
      ],
      addQuiz: (data) => set((state) => ({
        quizzes: [...state.quizzes, { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() }]
      })),
      addTask: (data) => set((state) => ({
        dailyTasks: [...state.dailyTasks, { ...data, id: Math.random().toString(36).substr(2, 9) }].sort((a, b) => a.day - b.day)
      })),
      deleteQuiz: (id) => set((state) => ({ quizzes: state.quizzes.filter(q => q.id !== id) })),
      deleteTask: (id) => set((state) => ({ dailyTasks: state.dailyTasks.filter(t => t.id !== id) })),
    }),
    { name: 'fireproof-admin-data' }
  )
);
