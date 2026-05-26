'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * A global listener component that catches emitted Firebase permission errors.
 * In development, it re-throws the error to trigger the Next.js error overlay.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error) => {
      // Re-throw the error to ensure it's surfaced to the developer.
      // In production, this error could be caught by a global error boundary or logged.
      console.warn('Sovereign Security Alert: Firestore Permission Denied');
      throw error;
    });

    return () => unsubscribe();
  }, []);

  return null;
}
