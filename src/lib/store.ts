
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'fire' | 'water' | 'nature' | 'raining' | 'default';

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  applyTheme: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'default',
      setTheme: (theme) => set({ theme }),
      applyTheme: () => {
        if (typeof document !== 'undefined') {
          const body = document.body;
          const themeClasses = ['theme-fire', 'theme-water', 'theme-nature', 'theme-raining'];
          body.classList.remove(...themeClasses);
          const currentTheme = get().theme;
          if (currentTheme !== 'default') {
            body.classList.add(`theme-${currentTheme}`);
          }
        }
      }
    }),
    {
      name: 'fireproof-app-v6',
      onRehydrateStorage: () => (state) => {
        if (state) state.applyTheme();
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
  questionCount: number;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface ManagedTask {
  id: string;
  day: number;
  title: string;
  description: string;
}

export interface ShooppyProduct {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  shopLink: string;
  type: 'Bundle' | 'Template' | 'eBook';
  price?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface AdminStore {
  quizzes: Quiz[];
  dailyTasks: ManagedTask[];
  shooppyProducts: ShooppyProduct[];
  notifications: SystemNotification[];
  addQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
  updateQuiz: (id: string, quiz: Partial<Quiz>) => void;
  addTask: (task: Omit<ManagedTask, 'id'>) => void;
  addTasks: (day: number, tasks: { title: string; description: string }[]) => void;
  deleteQuiz: (id: string) => void;
  deleteTask: (id: string) => void;
  addProduct: (product: Omit<ShooppyProduct, 'id'>) => void;
  deleteProduct: (id: string) => void;
  updateProduct: (id: string, product: Partial<ShooppyProduct>) => void;
  broadcastNotification: (notif: Omit<SystemNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotifRead: (id: string) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      quizzes: [],
      dailyTasks: [
        { id: 't1', day: 1, title: 'Morning Alignment', description: 'Review your core vision for 10 minutes.' },
        { id: 't2', day: 1, title: 'Strategic Planning', description: 'Outline your top 3 objectives for the day.' },
        { id: 't3', day: 1, title: 'Consistency Audit', description: 'Log your progress from the previous session.' }
      ],
      shooppyProducts: [],
      notifications: [
        { id: 'n1', title: 'System Online', message: 'Nico Digital Root Infrastructure initialized.', createdAt: new Date().toISOString(), isRead: false },
        { id: 'n2', title: 'Welcome Succemazing', message: 'Your strategist hub is ready for drops.', createdAt: new Date().toISOString(), isRead: false }
      ],
      addQuiz: (data) => set((state) => ({
        quizzes: [...state.quizzes, { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() }]
      })),
      updateQuiz: (id, data) => set((state) => ({
        quizzes: state.quizzes.map(q => q.id === id ? { ...q, ...data } : q)
      })),
      addTask: (data) => set((state) => ({
        dailyTasks: [...state.dailyTasks, { ...data, id: Math.random().toString(36).substr(2, 9) }].sort((a, b) => a.day - b.day)
      })),
      addTasks: (day, tasks) => set((state) => {
        const newTasks = tasks.map(t => ({ ...t, day, id: Math.random().toString(36).substr(2, 9) }));
        return {
          dailyTasks: [...state.dailyTasks.filter(t => t.day !== day), ...newTasks].sort((a, b) => a.day - b.day)
        };
      }),
      deleteQuiz: (id) => set((state) => ({ quizzes: state.quizzes.filter(q => q.id !== id) })),
      deleteTask: (id) => set((state) => ({ dailyTasks: state.dailyTasks.filter(t => t.id !== id) })),
      addProduct: (data) => set((state) => ({
        shooppyProducts: [...state.shooppyProducts, { ...data, id: Math.random().toString(36).substr(2, 9) }]
      })),
      deleteProduct: (id) => set((state) => ({ shooppyProducts: state.shooppyProducts.filter(p => p.id !== id) })),
      updateProduct: (id, data) => set((state) => ({
        shooppyProducts: state.shooppyProducts.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      broadcastNotification: (data) => set((state) => ({
        notifications: [{ ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), isRead: false }, ...state.notifications]
      })),
      markNotifRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
      })),
    }),
    { name: 'fireproof-admin-v6' }
  )
);

interface UserProgressStore {
  completedTaskIds: string[];
  capsules: any[];
  toggleTask: (id: string) => void;
  addCapsule: (capsule: any) => void;
}

export const useUserStore = create<UserProgressStore>()(
  persist(
    (set) => ({
      completedTaskIds: [],
      capsules: [],
      toggleTask: (id) => set((state) => ({
        completedTaskIds: state.completedTaskIds.includes(id) 
          ? state.completedTaskIds.filter(tid => tid !== id) 
          : [...state.completedTaskIds, id]
      })),
      addCapsule: (cap) => set((state) => ({
        capsules: [cap, ...state.capsules]
      })),
    }),
    { name: 'fireproof-user-v6' }
  )
);
