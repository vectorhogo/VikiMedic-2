/**
 * VikiMedic v2 - Smart Notification Engine & Persistence
 * Clean Architecture Layer: Infrastructure
 */

import {
  SmartNotification,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  NotificationRoleTarget,
  NotificationAction
} from '../domain/notifications';
import { notificationAudio } from './notificationAudioService';

const STORAGE_KEY_NOTIFS = 'vikimedic_smart_notifications_v2';
const STORAGE_KEY_SETTINGS = 'vikimedic_notif_settings_v2';
const STORAGE_KEY_DEDUP = 'vikimedic_notif_dedup_v2';

export class NotificationEngine {
  private notifications: SmartNotification[] = [];
  private settings: NotificationSettings = DEFAULT_NOTIFICATION_SETTINGS;
  private shownToastKeys: Set<string> = new Set();
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadSettings();
    this.loadNotifications();
    this.cleanUpOldNotifications();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        this.settings = { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      this.settings = DEFAULT_NOTIFICATION_SETTINGS;
    }
  }

  public saveSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(this.settings));
    } catch (e) {}
    this.notify();
  }

  public getSettings(): NotificationSettings {
    return this.settings;
  }

  private loadNotifications() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (saved) {
        this.notifications = JSON.parse(saved);
      } else {
        this.notifications = this.generateInitialSeedNotifications();
        this.saveToStorage();
      }
    } catch (e) {
      this.notifications = this.generateInitialSeedNotifications();
    }

    try {
      const savedDedup = localStorage.getItem(STORAGE_KEY_DEDUP);
      if (savedDedup) {
        this.shownToastKeys = new Set(JSON.parse(savedDedup));
      }
    } catch (e) {}
  }

  private saveToStorage() {
    try {
      // Keep up to 200 in storage to allow lazy load, presenting max 100
      const trimmed = this.notifications.slice(0, 200);
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(trimmed));
      localStorage.setItem(STORAGE_KEY_DEDUP, JSON.stringify(Array.from(this.shownToastKeys)));
    } catch (e) {}
  }

  /**
   * Auto archive INFO notifications older than 30 days
   */
  private cleanUpOldNotifications() {
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    let updated = false;
    this.notifications = this.notifications.map((n) => {
      if (
        n.category === 'INFO' &&
        n.priority !== 'CRITICAL' &&
        n.status !== 'ARCHIVED' &&
        now - n.createdTimestamp > thirtyDaysMs
      ) {
        updated = true;
        return { ...n, status: 'ARCHIVED' };
      }
      return n;
    });

    if (updated) {
      this.saveToStorage();
    }
  }

  /**
   * Initial seed notifications for demo and system startup
   */
  private generateInitialSeedNotifications(): SmartNotification[] {
    const now = Date.now();
    const faDate = new Date().toLocaleDateString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    });

    return [
      {
        id: 'notif-seed-1',
        title: 'بروزرسانی نسخه v2.4.0 سیستم VikiMedic',
        message: 'نسخه جدید نرم‌افزار شامل مرکز هوشمند اعلان‌ها و موتور محاسباتی کارانه آماده استفاده است.',
        category: 'SOFTWARE_UPDATE',
        priority: 'NORMAL',
        status: 'UNREAD',
        isPinned: true,
        createdAt: faDate,
        createdTimestamp: now - 3600000,
        targetRole: 'ALL',
        actions: [
          { label: 'مشاهده ویژگی‌های نسخه', actionType: 'UPDATE_SOFTWARE' }
        ],
        dedupKey: 'software_update_v2.4.0'
      },
      {
        id: 'notif-seed-2',
        title: 'هشدار عدم پشتیبان‌گیری روزانه',
        message: 'آخرین نسخه پشتیبان‌گیری دیتابیس درمانگاه امروز هنوز ثبت نشده است.',
        category: 'BACKUP',
        priority: 'HIGH',
        status: 'UNREAD',
        isPinned: false,
        createdAt: faDate,
        createdTimestamp: now - 7200000,
        targetRole: 'ADMIN',
        actions: [
          { label: 'ایجاد بکاپ فوری', actionType: 'CREATE_BACKUP' }
        ],
        dedupKey: 'daily_backup_missing'
      },
      {
        id: 'notif-seed-3',
        title: 'فاکتورهای بلاتکلیف و تسویه نشده',
        message: 'تعداد ۳ فاکتور صورتحساب بیمار در حالت پیش‌نویس قرار دارد.',
        category: 'FINANCIAL',
        priority: 'HIGH',
        status: 'UNREAD',
        isPinned: false,
        createdAt: faDate,
        createdTimestamp: now - 10800000,
        targetRole: 'ACCOUNTANT',
        actions: [
          { label: 'تکمیل فاکتورها', actionType: 'FINALIZE_INVOICE' }
        ],
        dedupKey: 'unfinalized_invoices'
      },
      {
        id: 'notif-seed-4',
        title: 'عدم تأیید تحویل شیفت صبح',
        message: 'شیفت صبح درمانگاه بدون تأیید نهایی فرم تحویل به پایان رسیده است.',
        category: 'SHIFT',
        priority: 'CRITICAL',
        status: 'UNREAD',
        isPinned: false,
        createdAt: faDate,
        createdTimestamp: now - 14400000,
        targetRole: 'RECEPTION',
        actions: [
          { label: 'ورود به مرکز شیفت', actionType: 'GO_TO_SHIFT' }
        ],
        dedupKey: 'shift_handover_pending'
      }
    ];
  }

  /**
   * Add a new notification with deduplication and audio chime
   */
  public addNotification(param: {
    title: string;
    message: string;
    category?: NotificationCategory;
    priority?: NotificationPriority;
    targetRole?: NotificationRoleTarget;
    actions?: NotificationAction[];
    dedupKey?: string;
    sourceModule?: string;
  }): SmartNotification {
    const dedup = param.dedupKey || `${param.title}_${param.message}`;

    // Prevent duplicate toast/notifications in same session if dedupKey provided
    if (param.dedupKey && this.shownToastKeys.has(param.dedupKey)) {
      const existing = this.notifications.find((n) => n.dedupKey === param.dedupKey);
      if (existing) return existing;
    }

    const category = param.category || 'INFO';
    const priority = param.priority || 'NORMAL';
    const now = Date.now();
    const faDate = new Date().toLocaleDateString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    });

    const newNotif: SmartNotification = {
      id: `notif-${now}-${Math.random().toString(36).substr(2, 5)}`,
      title: param.title,
      message: param.message,
      category,
      priority,
      status: 'UNREAD',
      isPinned: priority === 'CRITICAL',
      isToastShown: false,
      createdAt: faDate,
      createdTimestamp: now,
      targetRole: param.targetRole || 'ALL',
      actions: param.actions || [],
      sourceModule: param.sourceModule,
      dedupKey: dedup
    };

    if (dedup) {
      this.shownToastKeys.add(dedup);
    }

    this.notifications.unshift(newNotif);
    this.saveToStorage();

    // Play chime sound
    notificationAudio.playChime(priority, this.settings);

    this.notify();
    return newNotif;
  }

  /**
   * Get filtered, role-aware, sorted notifications (max 100)
   */
  public getNotifications(options?: {
    role?: string;
    statusFilter?: 'ALL' | 'UNREAD' | 'READ' | 'PINNED' | 'ARCHIVED';
    categoryFilter?: string;
    searchQuery?: string;
  }): SmartNotification[] {
    const role = options?.role || 'ADMIN';
    const statusFilter = options?.statusFilter || 'ALL';
    const categoryFilter = options?.categoryFilter || 'ALL';
    const query = (options?.searchQuery || '').trim().toLowerCase();
    const now = Date.now();

    return this.notifications
      .filter((n) => {
        // Snoozed filter
        if (n.snoozedUntil && n.snoozedUntil > now) {
          return false;
        }

        // Role filter
        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
          if (n.targetRole && n.targetRole !== 'ALL') {
            if (role === 'RECEPTIONIST' && n.targetRole !== 'RECEPTION') return false;
            if (role === 'DOCTOR' && n.targetRole !== 'DOCTOR') return false;
            if (role === 'ACCOUNTANT' && n.targetRole !== 'ACCOUNTANT') return false;
          }
        }

        // Tab Status Filter
        if (statusFilter === 'UNREAD' && n.status !== 'UNREAD') return false;
        if (statusFilter === 'READ' && n.status !== 'READ') return false;
        if (statusFilter === 'PINNED' && !n.isPinned) return false;
        if (statusFilter === 'ARCHIVED' && n.status !== 'ARCHIVED') return false;

        // Category Filter
        if (categoryFilter !== 'ALL') {
          if (categoryFilter === 'CRITICAL' && n.priority !== 'CRITICAL') return false;
          if (categoryFilter === 'FINANCIAL' && n.category !== 'FINANCIAL') return false;
          if (categoryFilter === 'RECEPTION' && n.category !== 'RECEPTION' && n.category !== 'PATIENT_ALERT') return false;
          if (categoryFilter === 'MEDICAL' && n.category !== 'MEDICAL' && n.category !== 'APPOINTMENT') return false;
          if (categoryFilter === 'UPDATES' && n.category !== 'SOFTWARE_UPDATE') return false;
          if (categoryFilter === 'SYSTEM' && n.category !== 'SYSTEM' && n.category !== 'BACKUP' && n.category !== 'SECURITY') return false;
        }

        // Search Query
        if (query) {
          const matchTitle = n.title.toLowerCase().includes(query);
          const matchMsg = n.message.toLowerCase().includes(query);
          const matchCat = n.category.toLowerCase().includes(query);
          const matchPrio = n.priority.toLowerCase().includes(query);
          if (!matchTitle && !matchMsg && !matchCat && !matchPrio) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // Priority weight
        const prioMap: Record<NotificationPriority, number> = {
          CRITICAL: 4,
          HIGH: 3,
          NORMAL: 2,
          LOW: 1
        };
        if (prioMap[a.priority] !== prioMap[b.priority]) {
          return prioMap[b.priority] - prioMap[a.priority];
        }

        // Created timestamp descending
        return b.createdTimestamp - a.createdTimestamp;
      })
      .slice(0, 100); // Max 100 visible
  }

  public getUnreadCount(role?: string): { unread: number; hasCritical: boolean } {
    const now = Date.now();
    let unread = 0;
    let hasCritical = false;

    this.notifications.forEach((n) => {
      if (n.snoozedUntil && n.snoozedUntil > now) return;
      if (n.status === 'UNREAD') {
        if (role && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
          if (n.targetRole && n.targetRole !== 'ALL') {
            if (role === 'RECEPTIONIST' && n.targetRole !== 'RECEPTION') return;
            if (role === 'DOCTOR' && n.targetRole !== 'DOCTOR') return;
            if (role === 'ACCOUNTANT' && n.targetRole !== 'ACCOUNTANT') return;
          }
        }
        unread++;
        if (n.priority === 'CRITICAL') {
          hasCritical = true;
        }
      }
    });

    return { unread, hasCritical };
  }

  public markAsRead(id: string) {
    let changed = false;
    const faDate = new Date().toLocaleDateString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    this.notifications = this.notifications.map((n) => {
      if (n.id === id && n.status === 'UNREAD') {
        changed = true;
        return { ...n, status: 'READ', readAt: faDate };
      }
      return n;
    });

    if (changed) {
      this.saveToStorage();
      this.notify();
    }
  }

  public markAllAsRead() {
    const faDate = new Date().toLocaleDateString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    this.notifications = this.notifications.map((n) =>
      n.status === 'UNREAD' ? { ...n, status: 'READ', readAt: faDate } : n
    );

    this.saveToStorage();
    this.notify();
  }

  public togglePin(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    );
    this.saveToStorage();
    this.notify();
  }

  public archiveNotification(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, status: 'ARCHIVED' } : n
    );
    this.saveToStorage();
    this.notify();
  }

  public resolveNotification(id: string, userName: string, actionName?: string) {
    const faDate = new Date().toLocaleDateString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    this.notifications = this.notifications.map((n) => {
      if (n.id === id) {
        return {
          ...n,
          status: 'ARCHIVED',
          resolvedAt: faDate,
          resolvedBy: userName,
          actionTaken: actionName || 'حل دستی توسط کاربر'
        };
      }
      return n;
    });

    this.saveToStorage();
    this.notify();
  }

  public snoozeNotification(id: string, minutes: number) {
    const snoozedUntil = Date.now() + minutes * 60 * 1000;
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, snoozedUntil } : n
    );
    this.saveToStorage();
    this.notify();
  }

  public setToastShown(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, isToastShown: true } : n
    );
    this.saveToStorage();
  }

  /**
   * Smart Scanner: Checks clinic domain state and raises smart reminders
   */
  public runSmartReminderScan(contextData: {
    patients?: any[];
    orders?: any[];
    shifts?: any[];
    catalog?: any[];
    staff?: any[];
  }) {
    // 1. Check incomplete patient registrations
    if (contextData.patients) {
      const incomplete = contextData.patients.filter((p) => !p.phone || !p.nationalId);
      if (incomplete.length > 0) {
        this.addNotification({
          title: 'پرونده‌های بیمار با اطلاعات ناقص',
          message: `تعداد ${incomplete.length} بیمار فاقد شماره تماس یا کد ملی ثبت‌شده می‌باشند.`,
          category: 'PATIENT_ALERT',
          priority: 'NORMAL',
          targetRole: 'RECEPTION',
          dedupKey: 'scan_incomplete_patients',
          actions: [{ label: 'مشاهده بیماران', actionType: 'NAVIGATE', payload: 'patients' }]
        });
      }
    }

    // 2. Check draft or unfinalized orders
    if (contextData.orders) {
      const pendingInvoices = contextData.orders.filter((o) => o.orderStatus === 'DRAFT');
      if (pendingInvoices.length > 0) {
        this.addNotification({
          title: 'فاکتورهای بلاتکلیف و پیش‌نویس',
          message: `تعداد ${pendingInvoices.length} سفارش بیمار در وضعیت پیش‌نویس نیازمند تعیین تکلیف مالی می‌باشند.`,
          category: 'FINANCIAL',
          priority: 'HIGH',
          targetRole: 'ACCOUNTANT',
          dedupKey: 'scan_pending_invoices',
          actions: [{ label: 'تکمیل فاکتورها', actionType: 'FINALIZE_INVOICE' }]
        });
      }
    }

    // 3. Check inactive/zero catalog prices
    if (contextData.catalog) {
      const zeroPriceItems = contextData.catalog.filter((i) => !i.priceToman || i.priceToman === 0);
      if (zeroPriceItems.length > 0) {
        this.addNotification({
          title: 'تعرفه‌های غیرفعال یا صفر در کاتالوگ',
          message: `تعداد ${zeroPriceItems.length} خدمت یا کالای کاتالوگ فاقد قیمت‌گذاری معتبر می‌باشد.`,
          category: 'SYSTEM',
          priority: 'NORMAL',
          targetRole: 'ADMIN',
          dedupKey: 'scan_zero_catalog_prices',
          actions: [{ label: 'ویرایش کاتالوگ', actionType: 'OPEN_SETTINGS' }]
        });
      }
    }
  }
}

export const notificationEngine = new NotificationEngine();
