'use client';

type ErrorListener = (error: any) => void;

/**
 * A simple, client-side event emitter for managing Firebase errors.
 */
class SimpleEmitter {
  private listeners: { [event: string]: ErrorListener[] } = {};

  /**
   * Register a listener for a specific error event.
   * @returns An unsubscribe function.
   */
  on(event: string, listener: ErrorListener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
    return () => this.off(event, listener);
  }

  /**
   * Unregister a listener.
   */
  off(event: string, listener: ErrorListener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  /**
   * Emit an error event to all registered listeners.
   */
  emit(event: string, data: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(l => l(data));
  }
}

export const errorEmitter = new SimpleEmitter();
