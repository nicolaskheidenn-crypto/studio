
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // App-wide state can be added here in the future
}

export const useAppStore = create<AppState>()(
  persist(
    () => ({}),
    {
      name: 'fireproof-app-v15',
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

export interface PostComment {
  id: string;
  userId: string;
  nickname: string;
  text: string;
  timestamp: string;
}

export interface ActivityPost {
  id: string;
  userId: string;
  nickname: string;
  description: string;
  images: string[];
  isPrivate: boolean;
  timestamp: string;
  hearts: number;
  comments: PostComment[];
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
  updateQuiz: (id: string, quiz: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  moveQuiz: (id: string, direction: 'up' | 'down') => void;
  addTasks: (day: number, tasks: Omit<ManagedTask, 'id' | 'day'>[]) => void;
  addProduct: (product: Omit<ShooppyProduct, 'id'>) => void;
  updateProduct: (id: string, product: Partial<ShooppyProduct>) => void;
  deleteProduct: (id: string) => void;
  moveProduct: (id: string, direction: 'up' | 'down') => void;
  addFAQ: (faq: Omit<FAQEntry, 'id'>) => void;
  deleteFAQ: (id: string) => void;
  addBadge: (badge: Omit<Badge, 'id'>) => void;
  deleteBadge: (id: string) => void;
  deletePost: (id: string) => void;
  addNewsPost: (post: Omit<BroadCastMessage, 'id' | 'timestamp'>) => void;
  deleteNewsPost: (id: string) => void;
  addActivityWall: (post: Omit<ActivityPost, 'id' | 'timestamp' | 'hearts' | 'comments'>) => void;
  heartPost: (postId: string) => void;
  addComment: (postId: string, comment: Omit<PostComment, 'id' | 'timestamp'>) => void;
  deleteComment: (postId: string, commentId: string) => void;
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
      addProduct: (data) => set((s) => ({ shooppyProducts: [...s.shooppyProducts, { ...data, id: Math.random().toString(36).substr(2, 9) }] })),
      updateProduct: (id, data) => set((s) => ({ shooppyProducts: s.shooppyProducts.map(p => p.id === id ? { ...p, ...data } : p) })),
      deleteProduct: (id) => set((s) => ({ shooppyProducts: s.shooppyProducts.filter(p => p.id !== id) })),
      moveProduct: (id, direction) => set((s) => {
        const index = s.shooppyProducts.findIndex(p => p.id === id);
        if (index === -1) return s;
        const newProducts = [...s.shooppyProducts];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newProducts.length) return s;
        [newProducts[index], newProducts[newIndex]] = [newProducts[newIndex], newProducts[index]];
        return { shooppyProducts: newProducts };
      }),
      addFAQ: (data) => set((s) => ({ faqs: [...s.faqs, { ...data, id: Math.random().toString(36).substr(2, 9) }] })),
      deleteFAQ: (id) => set((s) => ({ faqs: s.faqs.filter(f => f.id !== id) })),
      addBadge: (data) => set((s) => ({ badges: [...s.badges, { ...data, id: Math.random().toString(36).substr(2, 9) }] })),
      deleteBadge: (id) => set((s) => ({ badges: s.badges.filter(b => b.id !== id) })),
      deletePost: (id) => set((s) => ({ activityWall: s.activityWall.filter(p => p.id !== id) })),
      addNewsPost: (data) => set((s) => ({ newsPosts: [{ ...data, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() }, ...s.newsPosts] })),
      deleteNewsPost: (id) => set((s) => ({ newsPosts: s.newsPosts.filter(p => p.id !== id) })),
      addActivityWall: (data) => set((s) => ({ 
        activityWall: [{ 
          ...data, 
          id: Math.random().toString(36).substr(2, 9), 
          timestamp: new Date().toISOString(),
          hearts: 0,
          comments: []
        }, ...s.activityWall] 
      })),
      heartPost: (postId) => set((s) => ({
        activityWall: s.activityWall.map(p => p.id === postId ? { ...p, hearts: p.hearts + 1 } : p)
      })),
      addComment: (postId, comment) => set((s) => ({
        activityWall: s.activityWall.map(p => p.id === postId ? { 
          ...p, 
          comments: [...p.comments, { ...comment, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() }] 
        } : p)
      })),
      deleteComment: (postId, commentId) => set((s) => ({
        activityWall: s.activityWall.map(p => p.id === postId ? {
          ...p,
          comments: p.comments.filter(c => c.id !== commentId)
        } : p)
      })),
      addResource: (data) => set((s) => ({ resources: [...s.resources, { ...data, id: Math.random().toString(36).substr(2, 9) }] })),
      deleteResource: (id) => set((s) => ({ resources: s.resources.filter(r => r.id !== id) })),
    }),
    { name: 'fireproof-admin-v15' }
  )
);

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
  currentTaskDay: number;
  completedTaskIds: string[];
  capsules: GoalCapsule[];
}

const DEFAULT_PROFILE: UserProfile = {
  nickname: 'Succemazing',
  bio: '',
  avatarUrl: '',
  coverPhotoUrl: '',
  points: 0,
  xp: 0,
  level: 1,
  streak: 0,
  currentTaskDay: 1,
  lastLogin: null,
  completedTaskIds: [],
  capsules: [],
};

interface UserProgressStore {
  profiles: Record<string, UserProfile>;
  
  updateProfile: (uid: string, data: Partial<UserProfile>) => void;
  addXP: (uid: string, amount: number) => void;
  addPoints: (uid: string, amount: number) => void;
  toggleTask: (uid: string, id: string) => void;
  claimDaily: (uid: string) => void;
  addCapsule: (uid: string, cap: GoalCapsule) => void;
  resetUserStats: (uid: string) => void;
  unlockNextDay: (uid: string) => void;
  updateSpecificUser: (uid: string, data: Partial<{ points: number; xp: number; level: number; streak: number; currentTaskDay: number }>) => void;
}

export const useUserStore = create<UserProgressStore>()(
  persist(
    (set, get) => ({
      profiles: {},

      updateProfile: (uid, data) => set((s) => ({
        profiles: {
          ...s.profiles,
          [uid]: { ...(s.profiles[uid] || DEFAULT_PROFILE), ...data }
        }
      })),

      addXP: (uid, amount) => {
        const current = get().profiles[uid] || DEFAULT_PROFILE;
        let newXP = current.xp + amount;
        let newLevel = current.level;
        while (newXP >= 100) {
          newXP -= 100;
          newLevel += 1;
        }
        get().updateProfile(uid, { xp: newXP, level: newLevel });
      },

      addPoints: (uid, amount) => {
        const current = get().profiles[uid] || DEFAULT_PROFILE;
        get().updateProfile(uid, { points: current.points + amount });
      },

      toggleTask: (uid, id) => {
        const current = get().profiles[uid] || DEFAULT_PROFILE;
        const isCompleting = !current.completedTaskIds.includes(id);
        if (isCompleting) {
          get().addXP(uid, 20);
          get().addPoints(uid, 50);
        }
        const newIds = isCompleting 
          ? [...current.completedTaskIds, id] 
          : current.completedTaskIds.filter(tid => tid !== id);
        
        get().updateProfile(uid, { completedTaskIds: newIds });
      },

      claimDaily: (uid) => {
        const current = get().profiles[uid] || DEFAULT_PROFILE;
        const now = new Date();
        const last = current.lastLogin ? new Date(current.lastLogin) : null;
        
        let newStreak = current.streak;
        if (!last) {
          newStreak = 1;
        } else {
          const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate());
          const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          } else if (diffDays === 0) {
            return;
          }
        }

        get().updateProfile(uid, { 
          lastLogin: now.toISOString(), 
          streak: newStreak, 
          points: current.points + 100, 
          xp: current.xp + 50 
        });
      },

      unlockNextDay: (uid) => {
        const current = get().profiles[uid] || DEFAULT_PROFILE;
        get().updateProfile(uid, { currentTaskDay: Math.min(current.currentTaskDay + 1, 7) });
      },

      addCapsule: (uid, cap) => {
        const current = get().profiles[uid] || DEFAULT_PROFILE;
        get().updateProfile(uid, { capsules: [...current.capsules, cap] });
        get().addPoints(uid, 50);
        get().addXP(uid, 30);
      },

      resetUserStats: (uid) => set((s) => ({
        profiles: {
          ...s.profiles,
          [uid]: { ...DEFAULT_PROFILE }
        }
      })),

      updateSpecificUser: (uid, data) => {
        get().updateProfile(uid, data);
      },
    }),
    { name: 'fireproof-user-v15' }
  )
);
