'use client';

import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { useUserStore } from '@/lib/store';

/**
 * @fileOverview AuthSync Bridge
 * 
 * This component handles the real-time bridge between Firebase Auth, 
 * Firestore, and the local Zustand state. It ensures data survives 
 * refreshes and auto-saves all progress.
 */
export function AuthSync() {
  const auth = useAuth();
  const db = useFirestore();
  const { updateProfile, profiles } = useUserStore();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 1. Establish Real-Time Hydration from Firestore
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const remoteData = docSnap.data();
            // Update local store with remote data (Sovereign Hydration)
            updateProfile(user.uid, remoteData as any);
          }
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribeAuth();
  }, [auth, db, updateProfile]);

  // 2. Silent Auto-Save Logic (Local Store -> Cloud Registry)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const localProfile = profiles[user.uid];
    if (!localProfile) return;

    // Debounce to prevent rapid-fire writes to Firestore
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    
    syncTimeoutRef.current = setTimeout(() => {
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, {
        ...localProfile,
        lastSync: serverTimestamp()
      }, { merge: true }).catch((err) => {
        console.warn("[SOVEREIGN SYNC] Cloud mirroring delayed due to connection state.");
      });
    }, 2000); // 2-second debounce for stability

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [profiles, auth.currentUser, db]);

  return null;
}
