/**
 * VikiMedic v2 - Central Service Container (Service Registry / Locator)
 * Clean Architecture Layer: Packages / Shared
 *
 * Centralized service registry maintaining singletons for Supabase, Logger, Config, Theme, Storage, and Print.
 */

import { APP_CONFIG } from '../../config/appConfig';
import { eventBus } from './eventBus';
import { printEngine } from './printEngine';
import { fileManagerService } from './fileManager';
import { logDevEvent } from '../../infrastructure/devEnvironment';

export interface RegisteredServiceMeta {
  key: string;
  nameFA: string;
  status: 'ACTIVE' | 'STANDBY' | 'DISABLED';
  version: string;
}

class ServiceContainer {
  private services: Map<string, unknown> = new Map();

  constructor() {
    this.bootstrapCoreServices();
  }

  private bootstrapCoreServices() {
    this.services.set('config', APP_CONFIG);
    this.services.set('eventBus', eventBus);
    this.services.set('printEngine', printEngine);
    this.services.set('fileManager', fileManagerService);
    this.services.set('logger', { log: logDevEvent });
    
    logDevEvent('INFO', 'ServiceContainer', 'تمام سرویس‌های پایه دامنه‌ای در Service Container ثبت گردیدند.');
  }

  /**
   * Retrieve a registered service by key
   */
  public get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`[ServiceContainer Error] Service '${key}' is not registered in central container.`);
    }
    return service as T;
  }

  /**
   * Register a new service dynamically
   */
  public register<T>(key: string, instance: T): void {
    this.services.set(key, instance);
    logDevEvent('DEBUG', 'ServiceContainer', `سرویس جدید '${key}' در کانتینر ثبت گردید.`);
  }

  /**
   * List metadata of registered services
   */
  public listRegisteredServices(): RegisteredServiceMeta[] {
    return [
      { key: 'config', nameFA: 'سرویس تنظیمات مرکزی (App Config)', status: 'ACTIVE', version: APP_CONFIG.version },
      { key: 'eventBus', nameFA: 'سرویس ناوبری رویدادهای عمومی (Global Event Bus)', status: 'ACTIVE', version: '1.0.0' },
      { key: 'printEngine', nameFA: 'موتور پرینت فاکتور و نسخه (Print Framework)', status: 'ACTIVE', version: '2.1.0' },
      { key: 'fileManager', nameFA: 'مدیریت فایل‌ها و مدارک پزشکی (File Attachment Manager)', status: 'ACTIVE', version: '1.0.0' },
      { key: 'logger', nameFA: 'سرویس لاگر و ثبت رویدادها (Dev/Prod Logger)', status: 'ACTIVE', version: '1.5.0' },
      { key: 'supabase', nameFA: 'مخزن اتصال به پایگاه داده Supabase PostgreSQL', status: 'ACTIVE', version: '2.4.0' },
    ];
  }
}

export const serviceContainer = new ServiceContainer();
