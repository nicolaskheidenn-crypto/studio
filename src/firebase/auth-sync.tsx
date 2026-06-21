'use client';

import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { useUserStore } from '@/lib/store';

/**
 * @fileOverview AuthSync Bridge (Hardened)
 * 
 * Handles real-time synchronization between Firebase and local state.
 * Optimized to prevent infinite write loops and quota exhaustion.
 */
export function AuthSync() {
  const auth = useAuth();
  const db = useFirestore();
  const { updateProfile, profiles } = useUserStore();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedDataRef = useRef<string>("");

  // 1. Establish Real-Time Hydration from Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        
        const unsubscribeSnapshot = onSnapshot(userRef, { includeMetadataChanges: true }, (docSnap) => {
          if (docSnap.exists() && !docSnap.metadata.hasPendingWrites) {
            const remoteData = docSnap.data();
            
            // Clean volatile server fields for stable comparison
            const { lastSync, ...comparableData } = remoteData as any;
            const dataStr = JSON.stringify(comparableData);
            
            // Only update local store if remote data actually changed
            if (dataStr !== lastSyncedDataRef.current) {
              lastSyncedDataRef.current = dataStr;
              updateProfile(user.uid, remoteData as any);
            }
          }
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribeAuth();
  }, [auth, db, updateProfile]);

  // 2. Optimized Auto-Save (Local -> Cloud)
  useEffect(() => {
    const user = auth.currentUser;
    const uid = user?.uid;
    if (!uid || !profiles[uid]) return;

    const localProfile = profiles[uid];
    
    // Ignore internal system fields and metadata for comparison
    const { lastLogin, lastSync, ...cleanLocal } = localProfile as any;
    const localStr = JSON.stringify(cleanLocal);

    // BREAK THE LOOP: If local state matches what we last synced, do nothing
    if (localStr === lastSyncedDataRef.current) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    
    // Increased debounce to 2s to preserve quota during heavy usage
    syncTimeoutRef.current = setTimeout(() => {
      const userRef = doc(db, 'users', uid);
      
      // Update our sync reference immediately to block echos
      lastSyncedDataRef.current = localStr;
      
      setDoc(userRef, {
        ...localProfile,
        lastSync: serverTimestamp()
      }, { merge: true }).catch(() => {
        // Silent catch to prevent UI interruption on network dips
      });
    }, 2000); 

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [profiles, auth.currentUser, db]);

  return null;
}
