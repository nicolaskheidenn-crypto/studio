
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'fire' | 'water' | 'nature' | 'raining' | 'default';

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'default',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'fireproof-app-v15',
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
  type: 'Bundle' | 'Template' | 'eBook';
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
}

export interface ActivityPost {
  id: string;
  userId: string;
  nickname: string;
  description: string;
  images: string[];
  isPrivate: boolean;
  timestamp: string;
}

export interface Resource {
  id: string;
  type: 'AI_Prompt' | 'T&Triks' | 'WeBin';
  title: string;
  description: string;
  content: string; // URL or Text
  nickname: string;
  userId: string;
}

export interface BroadCastMessage {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
}

export interface GoalCapsule {
  id: string;
  message: string;
  unlockDate: string;
  createdAt: string;
}

interface AdminStore {
  quizzes: Quiz[];
  dailyTasks: ManagedTask[];
  shooppyProducts: ShooppyProduct[];
  newsPosts: BroadCastMessage[];
  faqs: FAQEntry[];
  badges: Badge[];
  activityWall: ActivityPost[];
  resources: Resource[];

  addQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
  deleteQuiz: (id: string) => void;
  addTasks: (day: number, tasks: Omit<ManagedTask, 'id' | 'day'>[]) => void;
  addProduct: (product: Omit<ShooppyProduct, 'id'>) => void;
  deleteProduct: (id: string) => void;
  addFAQ: (faq: Omit<FAQEntry, 'id'>) => void;
  deleteFAQ: (id: string) => void;
  addBadge: (badge: Omit<Badge, 'id'>) => void;
  deleteBadge: (id: string) => void;
  deletePost: (id: string) => void;
  addNewsPost: (post: Omit<BroadCastMessage, 'id' | 'timestamp'>) => void;
  deleteNewsPost: (id: string) => void;
  addActivityWall: (post: Omit<ActivityPost, 'id' | 'timestamp'>) => void;
  addResource: (res: Omit<Resource, 'id'>) => void;
  deleteResource: (id: string) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      quizzes: [],
      dailyTasks: [],
      shooppyProducts: [],
      newsPosts: [],
      faqs: [],
      badges: [],
      activityWall: [],
      resources: [],

      addQuiz: (data) => set((s) => ({ quizzes: [...s.quizzes, { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() }] })),
      deleteQuiz: (id) => set((s) => ({ quizzes: s.quizzes.filter(q => q.id !== id) })),
      addTasks: (day, tasks) => set((s) => ({ dailyTasks: [...s.dailyTasks.filter(t => t.day !== day), ...tasks.map(t => ({ ...t, day, id: Math.random().toString(36).substr(2, 9) }))] })),
      addProduct: (data) => set((s) => ({ shooppyProducts: [...s.shooppyProducts, { ...data, id: Math.random().toString(36).substr(2, 9) }] })),
      deleteProduct: (id) => set((s) => ({ shooppyProducts: s.shooppyProducts.filter(p => p.id !== id) })),
      addFAQ: (data) => set((s) => ({ faqs: [...s.faqs, { ...data, id: Math.random().toString(36).substr(2, 9) }] })),
      deleteFAQ: (id) => set((s) => ({ faqs: s.faqs.filter(f => f.id !== id) })),
      addBadge: (data) => set((s) => ({ badges: [...s.badges, { ...data, id: Math.random().toString(36).substr(2, 9) }] })),
      deleteBadge: (id) => set((s) => ({ badges: s.badges.filter(b => b.id !== id) })),
      deletePost: (id) => set((s) => ({ activityWall: s.activityWall.filter(p => p.id !== id) })),
      addNewsPost: (data) => set((s) => ({ newsPosts: [{ ...data, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() }, ...s.newsPosts] })),
      deleteNewsPost: (id) => set((s) => ({ newsPosts: s.newsPosts.filter(p => p.id !== id) })),
      addActivityWall: (data) => set((s) => ({ activityWall: [{ ...data, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() }, ...s.activityWall] })),
      addResource: (data) => set((s) => ({ resources: [...s.resources, { ...data, id: Math.random().toString(36).substr(2, 9) }] })),
      deleteResource: (id) => set((s) => ({ resources: s.resources.filter(r => r.id !== id) })),
    }),
    { name: 'fireproof-admin-v15' }
  )
);

interface UserProgressStore {
  nickname: string;
  bio: string;
  avatarUrl: string;
  coverPhotoUrl: string;
  points: number;
  xp: number;
  level: number;
  streak: number;
  lastLogin: string | null;
  completedTaskIds: string[];
  capsules: GoalCapsule[];
  updateProfile: (data: Partial<{ nickname: string; bio: string; avatarUrl: string; coverPhotoUrl: string }>) => void;
  addXP: (amount: number) => void;
  addPoints: (amount: number) => void;
  toggleTask: (id: string) => void;
  claimDaily: () => void;
  addCapsule: (cap: GoalCapsule) => void;
  resetUserStats: () => void;
  updateSpecificUser: (data: Partial<{ points: number; xp: number; level: number; streak: number }>) => void;
}

export const useUserStore = create<UserProgressStore>()(
  persist(
    (set, get) => ({
      nickname: 'Succemazing',
      bio: '',
      avatarUrl: '',
      coverPhotoUrl: '',
      points: 0,
      xp: 0,
      level: 1,
      streak: 0,
      lastLogin: null,
      completedTaskIds: [],
      capsules: [],
      updateProfile: (data) => set((s) => ({ ...s, ...data })),
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
        return { completedTaskIds: isCompleting ? [...s.completedTaskIds, id] : s.completedTaskIds.filter(tid => tid !== id) };
      }),
      claimDaily: () => set((s) => ({ lastLogin: new Date().toISOString(), streak: s.streak + 1, points: s.points + 100, xp: s.xp + 50 })),
      addCapsule: (cap) => {
        set((s) => ({ capsules: [...s.capsules, cap] }));
        get().addPoints(50);
        get().addXP(30);
      },
      resetUserStats: () => set({ points: 0, xp: 0, level: 1, streak: 0 }),
      updateSpecificUser: (data) => set((s) => ({ ...s, ...data })),
    }),
    { name: 'fireproof-user-v15' }
  )
);
