
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
}

interface PageStore {
  pages: Page[];
  isLoaded: boolean;
  addPage: (page: Omit<Page, 'id' | 'createdAt'>) => void;
  updatePage: (id: string, page: Partial<Page>) => void;
  deletePage: (id: string) => void;
}

export const usePages = create<PageStore>()(
  persist(
    (set) => ({
      pages: [],
      isLoaded: false,
      addPage: (data) => set((s) => ({ 
        pages: [...s.pages, { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() }] 
      })),
      updatePage: (id, data) => set((s) => ({ 
        pages: s.pages.map(p => p.id === id ? { ...p, ...data } : p) 
      })),
      deletePage: (id) => set((s) => ({ 
        pages: s.pages.filter(p => p.id !== id) 
      })),
    }),
    { 
      name: 'fireproof-pages-v15',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoaded = true;
        }
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
  type: 'Bundle' | 'Template' | 'eBook';
  placement: 'Hub' | 'Marketplace';
  requiredLevel?: number;
  price: number;
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
  iconType?: 'quiz' | 'veteran' | 'consistency' | 'explorer' | 'prompt' | 'trick' | 'custom';
}

export interface Reward {
  id: string;
  week: number;
  title: string;
  description: string;
  pointsReward: number;
  xpReward: number;
  timestamp: string;
}

interface AdminStore {
  quizzes: Quiz[];
  dailyTasks: ManagedTask[];
  badges: Badge[];

  addQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
  updateQuiz: (id: string, quiz: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  moveQuiz: (id: string, direction: 'up' | 'down') => void;
  addTasks: (day: number, tasks: Omit<ManagedTask, 'id' | 'day'>[]) => void;
  addBadge: (badge: Omit<Badge, 'id'>) => void;
  deleteBadge: (id: string) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      quizzes: [],
      dailyTasks: [],
      badges: [],

      addQuiz: (data) => set((s) => ({ quizzes: [...s.quizzes, { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() }] })),
      updateQuiz: (id, data) => set((s) => ({ quizzes: s.quizzes.map(q => q.id === id ? { ...q, ...data } : q) })),
      deleteQuiz: (id) => set((s) => ({ quizzes: s.quizzes.filter(q => q.id !== id) })),
      moveQuiz: (id, direction) => set((s) => {
        const index = s.quizzes.findIndex(q => q.id === id);
        if (index === -1) return s;
        const newQuizzes = [...s.quizzes];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newQuizzes.length) return s;
        [newQuizzes[index], newQuizzes[newIndex]] = [newQuizzes[newIndex], newQuizzes[index]];
        return { quizzes: newQuizzes };
      }),
      addTasks: (day, tasks) => set((s) => ({ dailyTasks: [...s.dailyTasks.filter(t => t.day !== day), ...tasks.map(t => ({ ...t, day, id: Math.random().toString(36).substr(2, 9) }))] })),
      addBadge: (data) => set((s) => ({ badges: [...s.badges, { ...data, id: Math.random().toString(36).substr(2, 9) }] })),
      deleteBadge: (id) => set((s) => ({ badges: s.badges.filter(b => b.id !== id) })),
    }),
    { name: 'fireproof-admin-v16' }
  )
);

export interface UserStats {
  quizzesPassed: number;
  promptsShared: number;
  triksShared: number;
  visitedFeatures: string[];
  totalDaysInApp: number;
}

export interface UserProfile {
  nickname: string;
  bio: string;
  avatarUrl: string;
  coverPhotoUrl: string;
  points: number;
  xp: number;
  level: number;
  streak: number;
  lastLogin: string | null;
  createdAt: string;
  currentTaskDay: number;
  completedTaskIds: string[];
  capsules: any[];
  unlockedBadgeIds: string[];
  purchasedProductIds: string[];
  claimedRewardWeeks: number[];
  stats: UserStats;
}

const DEFAULT_PROFILE: UserProfile = {
  nickname: 'Strategist',
  bio: '',
  avatarUrl: '',
  coverPhotoUrl: '',
  points: 0,
  xp: 0,
  level: 1,
  streak: 0,
  currentTaskDay: 1,
  lastLogin: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  completedTaskIds: [],
  capsules: [],
  unlockedBadgeIds: [],
  purchasedProductIds: [],
  claimedRewardWeeks: [],
  stats: {
    quizzesPassed: 0,
    promptsShared: 0,
    triksShared: 0,
    visitedFeatures: [],
    totalDaysInApp: 0
  }
};

interface UserProgressStore {
  profiles: Record<string, UserProfile>;
  
  updateProfile: (uid: string, data: Partial<UserProfile>) => void;
  addXP: (uid: string, amount: number) => void;
  addPoints: (uid: string, amount: number) => void;
  toggleTask: (uid: string, id: string) => void;
  claimDaily: (uid: string) => void;
  addCapsule: (uid: string, cap: any) => void;
  resetUserStats: (uid: string) => void;
  unlockNextDay: (uid: string) => void;
  claimWeeklyReward: (uid: string, week: number, pointsBonus: number, xpBonus: number) => void;
  updateSpecificUser: (uid: string, data: Partial<{ points: number; xp: number; level: number; streak: number; currentTaskDay: number }>) => void;
  trackVisit: (uid: string, feature: string) => void;
  incrementPrompt: (uid: string) => void;
  incrementTrick: (uid: string) => void;
  incrementQuiz: (uid: string) => void;
  unlockBadge: (uid: string, badgeId: string) => void;
  buyProduct: (uid: string, productId: string, price: number) => void;
}

export const useUserStore = create<UserProgressStore>()(
  persist(
    (set, get) => ({
      profiles: {},

      updateProfile: (uid, data) => set((s) => {
        const existing = s.profiles[uid] || DEFAULT_PROFILE;
        return {
          profiles: {
            ...s.profiles,
            [uid]: { ...DEFAULT_PROFILE, ...existing, ...data }
          }
        };
      }),

      addXP: (uid, amount) => {
        const profiles = get().profiles;
        const current = { ...DEFAULT_PROFILE, ...(profiles[uid] || {}) };
        if (current.level >= 30) return;
        const multiplier = 1 + (current.level / 10);
        const actualAmount = amount * multiplier;
        let newXP = current.xp + actualAmount;
        let newLevel = current.level;
        while (newXP >= 100 && newLevel < 30) {
          newXP -= 100;
          newLevel += 1;
        }
        if (newLevel >= 30) newXP = 0; 
        get().updateProfile(uid, { xp: newXP, level: newLevel });
      },

      addPoints: (uid, amount) => {
        const profiles = get().profiles;
        const current = { ...DEFAULT_PROFILE, ...(profiles[uid] || {}) };
        const multiplier = 1 + (current.level / 10);
        const actualAmount = amount * multiplier;
        get().updateProfile(uid, { points: Math.floor(current.points + actualAmount) });
      },

      toggleTask: (uid, id) => {
        const profiles = get().profiles;
        const current = { ...DEFAULT_PROFILE, ...(profiles[uid] || {}) };
        const isCompleting = !current.completedTaskIds.includes(id);
        
        let { points, xp, level, completedTaskIds } = current;
        const newIds = isCompleting 
          ? [...completedTaskIds, id] 
          : completedTaskIds.filter(tid => tid !== id);

        if (isCompleting) {
          const multiplier = 1 + (level / 10);
          points += Math.floor(50 * multiplier);
          xp += 20 * multiplier;
          while (xp >= 100 && level < 30) {
            xp -= 100;
            level += 1;
          }
          if (level >= 30) xp = 0;
        }
        
        get().updateProfile(uid, { 
          points: Math.floor(points), 
          xp, 
          level, 
          completedTaskIds: newIds 
        });
      },

      claimDaily: (uid) => {
        const profiles = get().profiles;
        const current = { ...DEFAULT_PROFILE, ...(profiles[uid] || {}) };
        const now = new Date();
        const last = current.lastLogin ? new Date(current.lastLogin) : null;
        let newStreak = current.streak;
        if (!last) newStreak = 1;
        else {
          const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate());
          const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) newStreak += 1;
          else if (diffDays > 1) newStreak = 1;
          else if (diffDays === 0) return;
        }
        
        const createdDate = new Date(current.createdAt);
        const diffInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        
        const multiplier = 1 + (current.level / 10);
        let { points, xp, level } = current;
        
        points += Math.floor(100 * multiplier);
        xp += 50 * multiplier;
        while (xp >= 100 && level < 30) {
          xp -= 100;
          level += 1;
        }
        if (level >= 30) xp = 0;

        get().updateProfile(uid, { 
          lastLogin: now.toISOString(), 
          streak: newStreak,
          points: Math.floor(points),
          xp,
          level,
          stats: { ...(current.stats || DEFAULT_PROFILE.stats), totalDaysInApp: diffInDays }
        });
      },

      unlockNextDay: (uid) => {
        const profiles = get().profiles;
        const current = { ...DEFAULT_PROFILE, ...(profiles[uid] || {}) };
        get().updateProfile(uid, { currentTaskDay: Math.min(current.currentTaskDay + 1, 30) });
      },

      claimWeeklyReward: (uid, week, pointsBonus, xpBonus) => {
        const profiles = get().profiles;
        const current = { ...DEFAULT_PROFILE, ...(profiles[uid] || {}) };
        const claimed = current.claimedRewardWeeks || [];
        
        if (!claimed.includes(week)) {
          const multiplier = 1 + (current.level / 10);
          let { points, xp, level } = current;
          
          points += Math.floor(pointsBonus * multiplier);
          xp += xpBonus * multiplier;
          while (xp >= 100 && level < 30) {
            xp -= 100;
            level += 1;
          }
          if (level >= 30) xp = 0;

          get().updateProfile(uid, { 
            claimedRewardWeeks: [...claimed, week],
            points: Math.floor(points),
            xp,
            level
          });
        }
      },

      addCapsule: (uid, cap) => {
        const profiles = get().profiles;
        const current = { ...DEFAULT_PROFILE, ...(profiles[uid] || {}) };
        
        const multiplier = 1 + (current.level / 10);
        let { points, xp, level } = current;
        
        points += Math.floor(50 * multiplier);
        xp += 30 * multiplier;
        while (xp >= 100 && level < 30) {
          xp -= 100;
          level += 1;
        }
        if (level >= 30) xp = 0;

        get().updateProfile(uid, { 
          capsules: [...(current.capsules || []), cap],
          points: Math.floor(points),
          xp,
          level
        });
      },

      resetUserStats: (uid) => set((s) => ({
        profiles: { ...s.profiles, [uid]: { ...DEFAULT_PROFILE, createdAt: s.profiles[uid]?.createdAt || new Date().toISOString() } }
      })),

      updateSpecificUser: (uid, data) => get().updateProfile(uid, data),

      trackVisit: (uid, feature) => {
        const profiles = get().profiles;
        const current = { ...DEFAULT_PROFILE, ...(profiles[uid] || {}) };
        const stats = { ...DEFAULT_PROFILE.stats, ...(current.stats || {}) };
        const visitedFeatures = stats.visitedFeatures || [];
        if (!visitedFeatures.includes(feature)) {
          get().updateProfile(uid, { stats: { ...stats, visitedFeatures: [...visitedFeatures, feature] } });
        }
      },

      incrementPrompt: (uid) => {
        const profiles = get().profiles;
        const current = { ...DEFAULT_PROFILE, ...(profiles[uid] || {}) };
        const stats = { ...DEFAULT_PROFILE.stats, ...(current.stats || {}) };
        const multiplier = 1 + (current.level / 10);
        
        get().updateProfile(uid, { 
          points: Math.floor(current.points + (10 * multiplier)),
          stats: { ...stats, promptsShared: (stats.promptsShared || 0) + 1 } 
        });
      },

      incrementTrick: (uid) => {
        const profiles = get().profiles;
        const current = { ...DEFAULT_PROFILE, ...(profiles[uid] || {}) };
        const stats = { ...DEFAULT_PROFILE.stats, ...(current.stats || {}) };
        const multiplier = 1 + (current.level / 10);
        
        get().updateProfile(uid, { 
          points: Math.floor(current.points + (10 * multiplier)),
          stats: { ...stats, triksShared: (stats.triksShared || 0) + 1 } 
        });
      },

      incrementQuiz: (uid) => {
        const profiles = get().profiles;
        const current = { ...DEFAULT_PROFILE, ...(profiles[uid] || {}) };
        const stats = { ...DEFAULT_PROFILE.stats, ...(current.stats || {}) };
        const multiplier = 1 + (current.level / 10);
        
        get().updateProfile(uid, { 
          points: Math.floor(current.points + (10 * multiplier)),
          stats: { ...stats, quizzesPassed: (stats.quizzesPassed || 0) + 1 } 
        });
      },

      unlockBadge: (uid, badgeId) => {
        const profiles = get().profiles;
        const current = { ...DEFAULT_PROFILE, ...(profiles[uid] || {}) };
        const unlockedBadgeIds = current.unlockedBadgeIds || [];
        if (!unlockedBadgeIds.includes(badgeId)) {
          get().updateProfile(uid, { unlockedBadgeIds: [...unlockedBadgeIds, badgeId] });
        }
      },

      buyProduct: (uid, productId, price) => {
        const profiles = get().profiles;
        const current = { ...DEFAULT_PROFILE, ...(profiles[uid] || {}) };
        const purchasedProductIds = current.purchasedProductIds || [];
        if (current.points >= price && !purchasedProductIds.includes(productId)) {
          get().updateProfile(uid, { points: current.points - price, purchasedProductIds: [...purchasedProductIds, productId] });
        }
      }
    }),
    { name: 'fireproof-user-v18' }
  )
);
