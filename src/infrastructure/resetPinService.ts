/**
 * VikiMedic v2 - Secure Reset Protection & PIN Engine
 * Clean Architecture Layer: Infrastructure
 */

import { LocalStorageManager } from './storage';

export interface ResetPinAuditLog {
  id: string;
  user: string;
  userId: string;
  role: string;
  date: string;
  time: string;
  result: 'SUCCESS' | 'FAILED_INVALID_PIN' | 'LOCKED_5_FAILED_ATTEMPTS' | 'PIN_CHANGED' | 'ADMIN_PIN_RESET';
  details: string;
  ipDevice: string;
}

const STORAGE_KEYS = {
  PIN_HASH: 'vikimedic_v2_reset_pin_hash',
  IS_DEFAULT_PIN: 'vikimedic_v2_reset_pin_is_default',
  FAILED_ATTEMPTS: 'vikimedic_v2_reset_pin_failed_attempts',
  LOCKOUT_UNTIL: 'vikimedic_v2_reset_pin_lockout_until',
  AUDIT_LOGS: 'vikimedic_v2_reset_pin_audit_logs',
};

const DEFAULT_PIN_PLAIN = '8585';
const SALT = 'vikimedic_reset_pin_salt_2026_secure';

/**
 * Hash PIN using SHA-256 via Web Crypto API with fallback
 */
export async function hashPin(pin: string): Promise<string> {
  const saltedPin = pin.trim() + '_' + SALT;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(saltedPin);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }
  // Simple deterministic string hash fallback
  let hash = 0;
  for (let i = 0; i < saltedPin.length; i++) {
    hash = (hash << 5) - hash + saltedPin.charCodeAt(i);
    hash |= 0;
  }
  return 'shash_' + Math.abs(hash).toString(16);
}

export class ResetPinService {
  private static defaultHashPromise: Promise<string> | null = null;

  private static async getDefaultPinHash(): Promise<string> {
    return hashPin(DEFAULT_PIN_PLAIN);
  }

  /**
   * Get current stored hash or initialize with default '8585' hash
   */
  public static async getStoredPinHash(): Promise<string> {
    if (typeof window === 'undefined') return '';
    const stored = localStorage.getItem(STORAGE_KEYS.PIN_HASH);
    if (stored) return stored;

    const defaultHash = await this.getDefaultPinHash();
    localStorage.setItem(STORAGE_KEYS.PIN_HASH, defaultHash);
    localStorage.setItem(STORAGE_KEYS.IS_DEFAULT_PIN, 'true');
    return defaultHash;
  }

  /**
   * Check if the default PIN '8585' is still active
   */
  public static isDefaultPinActive(): boolean {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEYS.IS_DEFAULT_PIN);
    if (stored === null) return true;
    return stored === 'true';
  }

  /**
   * Check lockout status
   */
  public static getLockoutStatus(): { isLocked: boolean; remainingMinutes: number; failedAttempts: number } {
    if (typeof window === 'undefined') return { isLocked: false, remainingMinutes: 0, failedAttempts: 0 };
    
    const lockoutUntilRaw = localStorage.getItem(STORAGE_KEYS.LOCKOUT_UNTIL);
    const failedAttemptsRaw = localStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS);
    
    const lockoutUntil = lockoutUntilRaw ? parseInt(lockoutUntilRaw, 10) : 0;
    const failedAttempts = failedAttemptsRaw ? parseInt(failedAttemptsRaw, 10) : 0;

    const now = Date.now();
    if (lockoutUntil > now) {
      const diffMs = lockoutUntil - now;
      const remainingMinutes = Math.ceil(diffMs / (60 * 1000));
      return { isLocked: true, remainingMinutes, failedAttempts };
    }

    // If lockout expired, clear lockout time
    if (lockoutUntil > 0 && lockoutUntil <= now) {
      localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
      localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, '0');
    }

    return { isLocked: false, remainingMinutes: 0, failedAttempts };
  }

  /**
   * Verify input PIN
   */
  public static async verifyPin(
    inputPin: string,
    user: { id: string; fullName: string; role: string }
  ): Promise<{ success: boolean; isLocked?: boolean; remainingMinutes?: number; remainingAttempts?: number; error?: string }> {
    const lockout = this.getLockoutStatus();
    if (lockout.isLocked) {
      return {
        success: false,
        isLocked: true,
        remainingMinutes: lockout.remainingMinutes,
        error: `عملکرد پاکسازی به دلیل ۵ بار ورود ناموفق قفل می‌باشد. لطفاً ${lockout.remainingMinutes} دقیقه دیگر تلاش فرمایید.`,
      };
    }

    const storedHash = await this.getStoredPinHash();
    const inputHash = await hashPin(inputPin);

    const now = new Date();
    const dateStr = now.toLocaleDateString('fa-IR');
    const timeStr = now.toLocaleTimeString('fa-IR');

    if (inputHash === storedHash) {
      // Success! Reset failed attempts
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, '0');
      }

      this.addAuditLog({
        id: 'log_' + Date.now(),
        user: user.fullName || 'کاربر سیستم',
        userId: user.id || 'system',
        role: user.role || 'ADMIN',
        date: dateStr,
        time: timeStr,
        result: 'SUCCESS',
        details: 'تأیید موفقیت‌آمیز پین امنیتی پاکسازی داده‌ها',
        ipDevice: 'Desktop Client / Security Console (127.0.0.1)',
      });

      return { success: true };
    } else {
      // Incorrect PIN
      let failed = lockout.failedAttempts + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, failed.toString());
      }

      if (failed >= 5) {
        // Lock for 15 minutes
        const lockTime = Date.now() + 15 * 60 * 1000;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.LOCKOUT_UNTIL, lockTime.toString());
        }

        this.addAuditLog({
          id: 'log_' + Date.now(),
          user: user.fullName || 'کاربر سیستم',
          userId: user.id || 'system',
          role: user.role || 'ADMIN',
          date: dateStr,
          time: timeStr,
          result: 'LOCKED_5_FAILED_ATTEMPTS',
          details: 'قفل شدن عملکرد پاکسازی به مدت ۱۵ دقیقه پس از ۵ بار پین اشتباه',
          ipDevice: 'Desktop Client / Security Console (127.0.0.1)',
        });

        // Also add to global auth activity log
        LocalStorageManager.addAuthActivityLog({
          timestamp: `${dateStr} - ${timeStr}`,
          userId: user.id,
          username: user.fullName,
          fullName: user.fullName,
          userRole: user.role,
          action: 'INITIAL_SETUP_RESET',
          details: 'هشدار امنیتی: قفل عملکرد پاکسازی کلینیک پس از ۵ تلاش ناموفق پین',
          device: 'Desktop Client / Security Lockout',
          clinicId: 'clinic-01',
        });

        return {
          success: false,
          isLocked: true,
          remainingMinutes: 15,
          error: '۵ بار ورود اشتباه پین! عملکرد پاکسازی داده‌ها به مدت ۱۵ دقیقه قفل گردید.',
        };
      } else {
        const remainingAttempts = 5 - failed;
        this.addAuditLog({
          id: 'log_' + Date.now(),
          user: user.fullName || 'کاربر سیستم',
          userId: user.id || 'system',
          role: user.role || 'ADMIN',
          date: dateStr,
          time: timeStr,
          result: 'FAILED_INVALID_PIN',
          details: `ورود پین امنیتی نادرست (تلاش ${failed} از ۵)`,
          ipDevice: 'Desktop Client / Security Console (127.0.0.1)',
        });

        return {
          success: false,
          isLocked: false,
          remainingAttempts,
          error: `پین امنیتی وارد شده نادرست است. (${remainingAttempts} تلاش دیگر باقی مانده است)`,
        };
      }
    }
  }

  /**
   * Change Reset PIN
   */
  public static async changePin(
    currentPin: string,
    newPin: string,
    user: { id: string; fullName: string; role: string }
  ): Promise<{ success: boolean; error?: string }> {
    if (newPin.trim().length < 4) {
      return { success: false, error: 'پین جدید باید حداقل ۴ رقم باشد.' };
    }

    const verification = await this.verifyPin(currentPin, user);
    if (!verification.success) {
      return { success: false, error: verification.error || 'پین فعلی نادرست است.' };
    }

    const newHash = await hashPin(newPin);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PIN_HASH, newHash);
      localStorage.setItem(STORAGE_KEYS.IS_DEFAULT_PIN, 'false');
      localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, '0');
      localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
    }

    const now = new Date();
    this.addAuditLog({
      id: 'log_' + Date.now(),
      user: user.fullName || 'کاربر سیستم',
      userId: user.id || 'system',
      role: user.role || 'ADMIN',
      date: now.toLocaleDateString('fa-IR'),
      time: now.toLocaleTimeString('fa-IR'),
      result: 'PIN_CHANGED',
      details: 'تغییر پین امنیتی پاکسازی داده‌ها با موفقیت انجام شد.',
      ipDevice: 'Desktop Client / Security Console (127.0.0.1)',
    });

    return { success: true };
  }

  /**
   * Reset PIN with Administrator authentication
   */
  public static async adminForceResetPin(
    newPin: string,
    user: { id: string; fullName: string; role: string }
  ): Promise<{ success: boolean; error?: string }> {
    if (newPin.trim().length < 4) {
      return { success: false, error: 'پین جدید باید حداقل ۴ رقم باشد.' };
    }

    const newHash = await hashPin(newPin);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PIN_HASH, newHash);
      localStorage.setItem(STORAGE_KEYS.IS_DEFAULT_PIN, 'false');
      localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, '0');
      localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
    }

    const now = new Date();
    this.addAuditLog({
      id: 'log_' + Date.now(),
      user: user.fullName || 'مدیر کل سیستم',
      userId: user.id || 'system',
      role: user.role || 'ADMIN',
      date: now.toLocaleDateString('fa-IR'),
      time: now.toLocaleTimeString('fa-IR'),
      result: 'ADMIN_PIN_RESET',
      details: 'بازنشانی پین امنیتی توسط احراز هویت مستقیم مدیر سیستم',
      ipDevice: 'Desktop Client / Security Console (127.0.0.1)',
    });

    return { success: true };
  }

  /**
   * Get Audit Logs
   */
  public static getAuditLogs(): ResetPinAuditLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (raw) return JSON.parse(raw);
    } catch {
      // Fallback
    }
    return [];
  }

  private static addAuditLog(log: ResetPinAuditLog): void {
    const existing = this.getAuditLogs();
    const updated = [log, ...existing].slice(0, 50); // Keep last 50
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
    }
  }
}
