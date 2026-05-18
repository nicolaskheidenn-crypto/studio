
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
      name: 'fireproof-app-v12',
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
  fileUrl?: string; // For uploaded ebooks/templates
  shopLink?: string;
  type: 'Bundle' | 'Template' | 'eBook';
  price?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: 'system' | 'friend_request' | 'broadcast';
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export interface SovereigntySection {
  id: string;
  title: string;
  content: string;
}

interface AdminStore {
  quizzes: Quiz[];
  dailyTasks: ManagedTask[];
  shooppyProducts: ShooppyProduct[];
  notifications: SystemNotification[];
  newsPosts: NewsPost[];
  sovereigntyTitle: string;
  sovereigntySections: SovereigntySection[];
  
  addQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
  updateQuiz: (id: string, quiz: Partial<Quiz>) => void;
  addTasks: (day: number, tasks: { title: string; description: string }[]) => void;
  deleteQuiz: (id: string) => void;
  deleteTask: (id: string) => void;
  addProduct: (product: Omit<ShooppyProduct, 'id'>) => void;
  deleteProduct: (id: string) => void;
  updateProduct: (id: string, product: Partial<ShooppyProduct>) => void;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotifRead: (id: string) => void;
  addNewsPost: (post: Omit<NewsPost, 'id' | 'createdAt'>) => void;
  deleteNewsPost: (id: string) => void;
  updateSovereignty: (title: string, sections: SovereigntySection[]) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      quizzes: [],
      dailyTasks: [
        { id: 't1', day: 1, title: 'Strategic Rooting', description: 'Review your Nico Digital core mission for 10 minutes.' },
        { id: 't2', day: 1, title: 'Execution Planning', description: 'Outline your top 3 objectives for high-focus success.' },
        { id: 't3', day: 1, title: 'Consistency Audit', description: 'Log your progress from the previous strategy session.' }
      ],
      shooppyProducts: [
        { id: 'sp1', title: 'Nico Digital Master Key', description: 'The fundamental guide to sovereign digital execution.', imageUrl: 'https://picsum.photos/seed/key/800/600', type: 'eBook', price: 'FREE' }
      ],
      newsPosts: [
        { id: 'p1', title: 'Nico Digital Hub Online', content: 'Welcome to the elite sovereign execution infrastructure. Start your journey with TaskDo.', imageUrl: 'https://picsum.photos/seed/nd/800/400', createdAt: new Date().toISOString() }
      ],
      notifications: [
        { id: 'n1', title: 'System Online', message: 'Nico Digital Root Infrastructure initialized.', createdAt: new Date().toISOString(), isRead: false, type: 'system' },
      ],
      sovereigntyTitle: "Legal Proof & Sovereignty",
      sovereigntySections: [
        { id: '1', title: 'Nico Digital Infrastructure', content: 'FireProof is a specialized high-focus utility operating exclusively under the Nico Digital parent brand.' },
        { id: '2', title: 'Data Isolation Protocols', content: 'Your strategic vision (GoalCaps) and internal communication (MeText) are strictly isolated within your UID.' }
      ],
      addQuiz: (data) => set((state) => ({
        quizzes: [...state.quizzes, { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() }]
      })),
      updateQuiz: (id, data) => set((state) => ({
        quizzes: state.quizzes.map(q => q.id === id ? { ...q, ...data } : q)
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
      addNotification: (data) => set((state) => ({
        notifications: [{ ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), isRead: false }, ...state.notifications]
      })),
      markNotifRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
      })),
      addNewsPost: (data) => set((state) => ({
        newsPosts: [{ ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() }, ...state.newsPosts]
      })),
      deleteNewsPost: (id) => set((state) => ({ newsPosts: state.newsPosts.filter(p => p.id !== id) })),
      updateSovereignty: (title, sections) => set({ sovereigntyTitle: title, sovereigntySections: sections }),
    }),
    { name: 'fireproof-admin-v12' }
  )
);

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  mediaUrl?: string;
}

interface UserProgressStore {
  nickname: string;
  bio: string;
  avatarUrl: string;
  coverPhotoUrl: string;
  completedTaskIds: string[];
  capsules: any[];
  friends: string[];
  chatMessages: ChatMessage[];
  updateProfile: (data: { nickname?: string; bio?: string; avatarUrl?: string; coverPhotoUrl?: string }) => void;
  toggleTask: (id: string) => void;
  addCapsule: (capsule: any) => void;
  addFriend: (uid: string) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
}

export const useUserStore = create<UserProgressStore>()(
  persist(
    (set) => ({
      nickname: 'Succemazing Strategist',
      bio: 'Consistency is my only master key.',
      avatarUrl: '',
      coverPhotoUrl: '',
      completedTaskIds: [],
      capsules: [],
      friends: ['R9TfGgUleVN6kDnXySqVUhzoHmn2'],
      chatMessages: [],
      updateProfile: (data) => set((state) => ({ ...state, ...data })),
      toggleTask: (id) => set((state) => ({
        completedTaskIds: state.completedTaskIds.includes(id) 
          ? state.completedTaskIds.filter(tid => tid !== id) 
          : [...state.completedTaskIds, id]
      })),
      addCapsule: (cap) => set((state) => ({
        capsules: [cap, ...state.capsules]
      })),
      addFriend: (uid) => set((state) => ({
        friends: state.friends.includes(uid) ? state.friends : [...state.friends, uid]
      })),
      addChatMessage: (data) => set((state) => ({
        chatMessages: [...state.chatMessages, { ...data, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() }]
      })),
    }),
    { name: 'fireproof-user-v12' }
  )
);
