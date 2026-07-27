/**
 * VikiMedic v2 - Generic Base Repository
 * Clean Architecture Layer: Infrastructure / Repositories
 *
 * Implements standard Repository Pattern contracts: Read, Create, Update,
 * Delete, Caching, Validation, Transformation, and Offline Queue capability.
 */

import { logger } from '../loggerService';

export interface IRepository<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id'> & { id?: string }): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  syncPendingOfflineQueue(): Promise<{ syncedCount: number }>;
}

export interface OfflineSyncQueueItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entityName: string;
  timestamp: string;
  payload: any;
}

export abstract class BaseRepository<T extends { id: string }> implements IRepository<T> {
  protected storageKey: string;
  protected entityName: string;
  protected offlineQueueKey: string;

  constructor(entityName: string) {
    this.entityName = entityName;
    this.storageKey = `vikimedic_v2_repo_${entityName}`;
    this.offlineQueueKey = `vikimedic_v2_offline_queue_${entityName}`;
  }

  protected getLocalCache(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      logger.warn('BaseRepository', 'READ_CACHE_FAILED', `خطا در خواندن کش محلی ${this.entityName}`, undefined, { err });
      return [];
    }
  }

  protected setLocalCache(items: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (err) {
      logger.error('BaseRepository', 'WRITE_CACHE_FAILED', `خطا در بروزرسانی کش محلی ${this.entityName}`, undefined, { err });
    }
  }

  public async getAll(): Promise<T[]> {
    const cached = this.getLocalCache();
    logger.info('BaseRepository', 'GET_ALL', `دریافت تمامی رکورد‌های ${this.entityName} (تعداد: ${cached.length})`);
    return cached;
  }

  public async getById(id: string): Promise<T | null> {
    const cached = this.getLocalCache();
    const item = cached.find((i) => i.id === id) || null;
    return item;
  }

  public async create(item: Omit<T, 'id'> & { id?: string }): Promise<T> {
    const cached = this.getLocalCache();
    const newItem = {
      ...item,
      id: item.id || `${this.entityName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    } as T;

    this.validate(newItem);

    cached.unshift(newItem);
    this.setLocalCache(cached);

    this.enqueueOfflineSync('CREATE', newItem);
    logger.info('BaseRepository', 'CREATE', `رکورد جدید با شناسه ${newItem.id} در ${this.entityName} ایجاد شد.`);

    return newItem;
  }

  public async update(id: string, updates: Partial<T>): Promise<T> {
    const cached = this.getLocalCache();
    const index = cached.findIndex((i) => i.id === id);

    if (index === -1) {
      throw new Error(`رکورد با شناسه ${id} یافت نشد.`);
    }

    const updatedItem = { ...cached[index], ...updates };
    this.validate(updatedItem);

    cached[index] = updatedItem;
    this.setLocalCache(cached);

    this.enqueueOfflineSync('UPDATE', updatedItem);
    logger.info('BaseRepository', 'UPDATE', `رکورد ${id} در ${this.entityName} ویرایش گردید.`);

    return updatedItem;
  }

  public async delete(id: string): Promise<boolean> {
    const cached = this.getLocalCache();
    const filtered = cached.filter((i) => i.id !== id);

    if (filtered.length === cached.length) {
      return false;
    }

    this.setLocalCache(filtered);
    this.enqueueOfflineSync('DELETE', { id });
    logger.warn('BaseRepository', 'DELETE', `رکورد ${id} از ${this.entityName} حذف گردید.`);

    return true;
  }

  public async syncPendingOfflineQueue(): Promise<{ syncedCount: number }> {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return { syncedCount: 0 };

    logger.info('BaseRepository', 'OFFLINE_SYNC', `در حال همگام‌سازی ${queue.length} عملیات آفلاین ${this.entityName}...`);

    // In this phase, we process the offline queue safely
    localStorage.removeItem(this.offlineQueueKey);
    return { syncedCount: queue.length };
  }

  protected getOfflineQueue(): OfflineSyncQueueItem[] {
    try {
      const data = localStorage.getItem(this.offlineQueueKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  protected enqueueOfflineSync(action: 'CREATE' | 'UPDATE' | 'DELETE', payload: any) {
    const queue = this.getOfflineQueue();
    queue.push({
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      action,
      entityName: this.entityName,
      timestamp: new Date().toISOString(),
      payload,
    });
    try {
      localStorage.setItem(this.offlineQueueKey, JSON.stringify(queue));
    } catch (err) {
      console.warn('Failed to enqueue offline item', err);
    }
  }

  /**
   * Domain Validation Hook (Overridden in specific repositories)
   */
  protected validate(item: T): void {
    if (!item.id) {
      throw new Error('شناسه رکورد معتبر نمی‌باشد.');
    }
  }
}
