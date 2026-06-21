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
        // Include metadata changes to detect pending writes (prevents ping-pong/bounce back)
        const unsubscribeSnapshot = onSnapshot(userRef, { includeMetadataChanges: true }, (docSnap) => {
          if (docSnap.exists() && !docSnap.metadata.hasPendingWrites) {
            const remoteData = docSnap.data();
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

    // Accelerated sync for higher fidelity (500ms debounce)
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    
    syncTimeoutRef.current = setTimeout(() => {
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, {
        ...localProfile,
        lastSync: serverTimestamp()
      }, { merge: true }).catch((err) => {
        console.warn("[SOVEREIGN SYNC] Cloud mirroring delayed due to connection state.");
      });
    }, 500); 

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [profiles, auth.currentUser, db]);

  return null;
}
