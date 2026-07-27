/**
 * VikiMedic v2 - Global Event System (Internal Event Bus)
 * Clean Architecture Layer: Packages / Shared
 *
 * Lightweight internal Pub/Sub system for decoupled cross-module communication.
 */

export type AppEventType =
  | 'PATIENT_CREATED'
  | 'PATIENT_UPDATED'
  | 'APPOINTMENT_SCHEDULED'
  | 'PAYMENT_COMPLETED'
  | 'THEME_CHANGED'
  | 'SETTINGS_UPDATED'
  | 'SESSION_CHANGED'
  | 'PRINT_REQUESTED'
  | 'FILE_UPLOADED';

export interface AppEventPayload<T = unknown> {
  type: AppEventType;
  timestamp: number;
  sourceModule: string;
  data: T;
}

export type EventCallback<T = unknown> = (event: AppEventPayload<T>) => void;

class GlobalEventBus {
  private listeners: Map<AppEventType, Set<EventCallback<any>>> = new Map();
  private eventHistory: AppEventPayload<any>[] = [];
  private maxHistorySize = 50;

  /**
   * Subscribe to an application event topic
   */
  public subscribe<T = unknown>(eventType: AppEventType, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const callbacks = this.listeners.get(eventType)!;
    callbacks.add(callback as EventCallback<any>);

    // Unsubscribe function
    return () => {
      callbacks.delete(callback as EventCallback<any>);
    };
  }

  /**
   * Publish an event to all subscribers
   */
  public publish<T = unknown>(type: AppEventType, sourceModule: string, data: T): AppEventPayload<T> {
    const eventPayload: AppEventPayload<T> = {
      type,
      timestamp: Date.now(),
      sourceModule,
      data,
    };

    // Store in history
    this.eventHistory.unshift(eventPayload);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.pop();
    }

    // Trigger subscribers
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(eventPayload);
        } catch (err) {
          console.error(`[EventBus Error] Callback failed for topic ${type}:`, err);
        }
      });
    }

    return eventPayload;
  }

  /**
   * Get recent event history for debugging/auditing
   */
  public getHistory(): AppEventPayload<any>[] {
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  public clearHistory(): void {
    this.eventHistory = [];
  }
}

// Singleton export
export const eventBus = new GlobalEventBus();
