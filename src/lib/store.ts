
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
      name: 'fireproof-app-v13',
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
  fileUrl?: string;
  shopLink?: string;
  type: 'Bundle' | 'Template' | 'eBook';
  price?: string;
  requiredLevel?: number;
}

export interface FAQEntry {
  id: string;
  question: string;
  answer: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Bronze' | 'Silver' | 'Gold' | 'Sovereign';
  icon?: string;
}

export interface ActivityPost {
  id: string;
  userId: string;
  nickname: string;
  description: string;
  images: string[];
  isPrivate: boolean;
  timestamp: string;
  reactions: number;
  comments: { user: string; text: string }[];
}

export interface Resource {
  id: string;
  type: 'AI_Prompt' | 'Tips_Tricks' | 'WeBin';
  title: string;
  description: string;
  content: string; // URL or Text
  userId?: string;
}

interface AdminStore {
  quizzes: Quiz[];
  dailyTasks: ManagedTask[];
  shooppyProducts: ShooppyProduct[];
  notifications: any[];
  newsPosts: any[];
  sovereigntyTitle: string;
  sovereigntySections: any[];
  faqs: FAQEntry[];
  badges: Badge[];
  activityWall: ActivityPost[];
  resources: Resource[];

  addQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
  addTasks: (day: number, tasks: any[]) => void;
  addProduct: (product: any) => void;
  deleteProduct: (id: string) => void;
  updateSovereignty: (title: string, sections: any[]) => void;
  
  // FAQ
  addFAQ: (faq: Omit<FAQEntry, 'id'>) => void;
  deleteFAQ: (id: string) => void;
  
  // Badges
  addBadge: (badge: Omit<Badge, 'id'>) => void;
  deleteBadge: (id: string) => void;

  // Moderation
  deletePost: (id: string) => void;
  deleteResource: (id: string) => void;
  addResource: (resource: Omit<Resource, 'id'>) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      quizzes: [],
      dailyTasks: [],
      shooppyProducts: [],
      notifications: [],
      newsPosts: [],
      sovereigntyTitle: "Legal Proof",
      sovereigntySections: [],
      faqs: [{ id: '1', question: 'How do I earn XP?', answer: 'Complete daily tasks, pass quizzes, and interact with the community wall!' }],
      badges: [],
      activityWall: [],
      resources: [],

      addQuiz: (data) => set((s) => ({ quizzes: [...s.quizzes, { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() }] })),
      addTasks: (day, tasks) => set((s) => ({ dailyTasks: [...s.dailyTasks.filter(t => t.day !== day), ...tasks.map(t => ({ ...t, day, id: Math.random().toString(36).substr(2, 9) }))] })),
      addProduct: (data) => set((s) => ({ shooppyProducts: [...s.shooppyProducts, { ...data, id: Math.random().toString(36).substr(2, 9) }] })),
      deleteProduct: (id) => set((s) => ({ shooppyProducts: s.shooppyProducts.filter(p => p.id !== id) })),
      updateSovereignty: (title, sections) => set({ sovereigntyTitle: title, sovereigntySections: sections }),
      
      addFAQ: (data) => set((s) => ({ faqs: [...s.faqs, { ...data, id: Math.random().toString(36).substr(2, 9) }] })),
      deleteFAQ: (id) => set((s) => ({ faqs: s.faqs.filter(f => f.id !== id) })),
      
      addBadge: (data) => set((s) => ({ badges: [...s.badges, { ...data, id: Math.random().toString(36).substr(2, 9) }] })),
      deleteBadge: (id) => set((s) => ({ badges: s.badges.filter(b => b.id !== id) })),

      deletePost: (id) => set((s) => ({ activityWall: s.activityWall.filter(p => p.id !== id) })),
      deleteResource: (id) => set((s) => ({ resources: s.resources.filter(r => r.id !== id) })),
      addResource: (data) => set((s) => ({ resources: [...s.resources, { ...data, id: Math.random().toString(36).substr(2, 9) }] })),
    }),
    { name: 'fireproof-admin-v13' }
  )
);

interface UserProgressStore {
  nickname: string;
  points: number;
  xp: number;
  level: number;
  streak: number;
  lastLogin: string | null;
  completedTaskIds: string[];
  friends: string[];
  updateStats: (data: { points?: number; xp?: number; level?: number; streak?: number }) => void;
  toggleTask: (id: string) => void;
  addXP: (amount: number) => void;
  addPoints: (amount: number) => void;
  checkDailyLogin: () => boolean;
  claimDaily: () => void;
  resetStats: () => void;
}

export const useUserStore = create<UserProgressStore>()(
  persist(
    (set, get) => ({
      nickname: 'Succemazing',
      points: 0,
      xp: 0,
      level: 1,
      streak: 0,
      lastLogin: null,
      completedTaskIds: [],
      friends: [],
      updateStats: (data) => set((s) => ({ ...s, ...data })),
      addXP: (amount) => {
        const { xp, level } = get();
        let newXP = xp + amount;
        let newLevel = level;
        while (newXP >= 100) {
          newXP -= 100;
          newLevel += 1;
        }
        set({ xp: newXP, level: newLevel });
      },
      addPoints: (amount) => set((s) => ({ points: s.points + amount })),
      toggleTask: (id) => set((s) => {
        const isCompleting = !s.completedTaskIds.includes(id);
        if (isCompleting) {
          get().addXP(20);
          get().addPoints(50);
        }
        return {
          completedTaskIds: isCompleting 
            ? [...s.completedTaskIds, id] 
            : s.completedTaskIds.filter(tid => tid !== id)
        };
      }),
      checkDailyLogin: () => {
        const { lastLogin } = get();
        if (!lastLogin) return true;
        const last = new Date(lastLogin).getTime();
        const now = new Date().getTime();
        return (now - last) > 86400000; // 24 hours
      },
      claimDaily: () => {
        set((s) => ({
          lastLogin: new Date().toISOString(),
          streak: s.streak + 1,
          points: s.points + 100,
          xp: s.xp + 50
        }));
      },
      resetStats: () => set({ points: 0, xp: 0, level: 1, streak: 0 }),
    }),
    { name: 'fireproof-user-v13' }
  )
);
