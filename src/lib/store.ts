
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
  currentTaskDay: number;
  completedTaskIds: string[];
  capsules: GoalCapsule[];
  updateProfile: (data: Partial<{ nickname: string; bio: string; avatarUrl: string; coverPhotoUrl: string }>) => void;
  addXP: (amount: number) => void;
  addPoints: (amount: number) => void;
  toggleTask: (id: string) => void;
  claimDaily: () => void;
  addCapsule: (cap: GoalCapsule) => void;
  resetUserStats: () => void;
  unlockNextDay: () => void;
  updateSpecificUser: (data: Partial<{ points: number; xp: number; level: number; streak: number; currentTaskDay: number }>) => void;
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
      currentTaskDay: 1,
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
      claimDaily: () => set((s) => {
        const now = new Date();
        const last = s.lastLogin ? new Date(s.lastLogin) : null;
        
        let newStreak = s.streak;
        if (!last) {
          newStreak = 1;
        } else {
          // Calculate difference in full calendar days
          const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate());
          const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1; // Consecutive day
          } else if (diffDays > 1) {
            newStreak = 1; // Missed a day
          } else if (diffDays === 0) {
            return {}; // Already claimed today - prevent redundant state updates
          }
        }

        return { 
          lastLogin: now.toISOString(), 
          streak: newStreak, 
          points: s.points + 100, 
          xp: s.xp + 50 
        };
      }),
      unlockNextDay: () => set((s) => ({ currentTaskDay: Math.min(s.currentTaskDay + 1, 7) })),
      addCapsule: (cap) => {
        set((s) => ({ capsules: [...s.capsules, cap] }));
        get().addPoints(50);
        get().addXP(30);
      },
      resetUserStats: () => set({ points: 0, xp: 0, level: 1, streak: 0, currentTaskDay: 1, completedTaskIds: [] }),
      updateSpecificUser: (data) => set((s) => ({ ...s, ...data })),
    }),
    { name: 'fireproof-user-v15' }
  )
);
