/**
 * VikiMedic v2 - AI Command Mode Service (Voice & Text Command Engine)
 * Clean Architecture Layer: Infrastructure
 * Enterprise Patch 01
 */

import { CommandHistoryItem, CommandExecutionStatus } from '../../domain/commandTypes';
import { UserStaff } from '../../domain/types';
import { LocalStorageManager } from '../storage';

const COMMAND_HISTORY_KEY = 'vikimedic_v2_command_history';

export interface ParsedCommandResult {
  intentKey: string;
  matchedTextFa: string;
  category: 'NAVIGATION' | 'SEARCH' | 'MODAL' | 'SYSTEM' | 'RESTRICTED';
  actionSummaryFa: string;
  requiresConfirmation: boolean;
  confirmationPromptFa?: string;
  targetModule?: string;
  targetTab?: string;
}

export class AICommandService {
  /**
   * Get recorded command execution history
   */
  public static getHistory(): CommandHistoryItem[] {
    return LocalStorageManager.getItem<CommandHistoryItem[]>(COMMAND_HISTORY_KEY, []);
  }

  /**
   * Save command execution history
   */
  public static saveHistory(items: CommandHistoryItem[]): void {
    LocalStorageManager.setItem(COMMAND_HISTORY_KEY, items);
  }

  /**
   * Clear history
   */
  public static clearHistory(): void {
    LocalStorageManager.removeItem(COMMAND_HISTORY_KEY);
  }

  /**
   * Record a command in history
   */
  public static logCommandExecution(params: {
    commandText: string;
    parsedIntent: string;
    user: UserStaff;
    status: CommandExecutionStatus;
    actionSummaryFa: string;
    requiresConfirmation: boolean;
  }): CommandHistoryItem {
    const history = this.getHistory();
    const newItem: CommandHistoryItem = {
      id: `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      commandText: params.commandText,
      parsedIntent: params.parsedIntent,
      userFullName: params.user.fullName,
      userRole: params.user.role,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: params.status,
      actionSummaryFa: params.actionSummaryFa,
      requiresConfirmation: params.requiresConfirmation,
    };

    history.unshift(newItem);
    // Keep max 50 command logs
    if (history.length > 50) history.pop();
    this.saveHistory(history);

    return newItem;
  }

  /**
   * Parse input string (text or speech transcript) into structured Command Intent
   */
  public static parseCommand(text: string): ParsedCommandResult | null {
    if (!text || !text.trim()) return null;
    const clean = text.trim().toLowerCase();

    // 1. Navigation: Reception / Queue
    if (clean.includes('پذیرش') || clean.includes('صف انتظار') || clean.includes('نوبت‌دهی') || clean.includes('open reception')) {
      return {
        intentKey: 'NAV_QUEUE',
        matchedTextFa: 'انتقال به ماژول پذیرش و صف انتظار',
        category: 'NAVIGATION',
        actionSummaryFa: 'انتقال نمای سیستم به سالن پذیرش و صف انتظار بیماران',
        requiresConfirmation: false,
        targetModule: 'queue',
      };
    }

    // 2. Navigation: Patients List
    if (clean.includes('لیست بیماران') || clean.includes('پرونده بیماران') || clean.includes('دفتر پرونده') || clean.includes('open patients')) {
      return {
        intentKey: 'NAV_PATIENTS',
        matchedTextFa: 'انتقال به دفتر پرونده بیماران',
        category: 'NAVIGATION',
        actionSummaryFa: 'انتقال نمای سیستم به لیست و پرونده دیجیتال بیماران',
        requiresConfirmation: false,
        targetModule: 'patients',
      };
    }

    // 3. Navigation: Reports
    if (clean.includes('گزارش') || clean.includes('نمودار') || clean.includes('تحلیل') || clean.includes('open reports')) {
      return {
        intentKey: 'NAV_REPORTS',
        matchedTextFa: 'انتقال به ماژول گزارشات و تحلیل‌ها',
        category: 'NAVIGATION',
        actionSummaryFa: 'انتقال به داشبورد آمار، درآمد و خروجی اکسل کلینیک',
        requiresConfirmation: false,
        targetModule: 'reports',
      };
    }

    // 4. Navigation: System Validation
    if (clean.includes('ارزیابی سیستم') || clean.includes('آمادگی سیستم') || clean.includes('تست سیستم') || clean.includes('چک لیست')) {
      return {
        intentKey: 'NAV_VALIDATION',
        matchedTextFa: 'باز کردن ارزیابی آمادگی سیستم (System Validation)',
        category: 'NAVIGATION',
        actionSummaryFa: 'انتقال به برگه ارزیابی ۱۴ گانه آمادگی سیستم قبل از راه‌اندازی',
        requiresConfirmation: false,
        targetModule: 'settings',
        targetTab: 'system_validation',
      };
    }

    // 5. Navigation: Configuration Profiles
    if (clean.includes('پروفایل') || clean.includes('پیکربندی') || clean.includes('پروفایل تنظیمات') || clean.includes('profiles')) {
      return {
        intentKey: 'NAV_PROFILES',
        matchedTextFa: 'باز کردن مدیریت پروفایل‌های پیکربندی',
        category: 'NAVIGATION',
        actionSummaryFa: 'انتقال به بخش مدیریت و فعال‌سازی پروفایل‌های تنظیمات کلینیک',
        requiresConfirmation: false,
        targetModule: 'settings',
        targetTab: 'config_profiles',
      };
    }

    // 6. Navigation: Settings / Users / Shifts
    if (clean.includes('پنل شیفت') || clean.includes('شیفت کاری') || clean.includes('shifts')) {
      return {
        intentKey: 'NAV_SHIFTS',
        matchedTextFa: 'انتقال به تنظیمات شیفت کاری و پرسنل',
        category: 'NAVIGATION',
        actionSummaryFa: 'انتقال به برگه پیکربندی شیفت‌ها و پرسنل موظف',
        requiresConfirmation: false,
        targetModule: 'settings',
        targetTab: 'shifts',
      };
    }

    if (clean.includes('تنظیمات') || clean.includes('پیکربندی کلینیک') || clean.includes('open settings')) {
      return {
        intentKey: 'NAV_SETTINGS',
        matchedTextFa: 'انتقال به تنظیمات اصلی سیستم',
        category: 'NAVIGATION',
        actionSummaryFa: 'انتقال به ماژول مدیریت تنظیمات کلینیک',
        requiresConfirmation: false,
        targetModule: 'settings',
      };
    }

    // 7. Navigation: Dashboard
    if (clean.includes('داشبورد') || clean.includes('میز کار') || clean.includes('صفحه اصلی') || clean.includes('open dashboard')) {
      return {
        intentKey: 'NAV_DASHBOARD',
        matchedTextFa: 'انتقال به داشبورد اصلی',
        category: 'NAVIGATION',
        actionSummaryFa: 'انتقال به میز کار اصلی کلینیک VikiMedic',
        requiresConfirmation: false,
        targetModule: 'dashboard',
      };
    }

    // 8. Navigation: Financials
    if (clean.includes('مالی') || clean.includes('صندوق') || clean.includes('فاکتور') || clean.includes('open financials')) {
      return {
        intentKey: 'NAV_FINANCIALS',
        matchedTextFa: 'انتقال به ماژول امور مالی و صندوق',
        category: 'NAVIGATION',
        actionSummaryFa: 'انتقال به بخش تراکنش‌ها، فاکتورها و تسویه حساب بیمار',
        requiresConfirmation: false,
        targetModule: 'financials',
      };
    }

    // 9. Quick Action: New Patient
    if (clean.includes('ثبت بیمار') || clean.includes('پرونده جدید') || clean.includes('بیمار جدید') || clean.includes('new patient')) {
      return {
        intentKey: 'ACTION_NEW_PATIENT',
        matchedTextFa: 'باز کردن فرم ثبت پرونده بیمار جدید',
        category: 'MODAL',
        actionSummaryFa: 'نمایش پنجره شناور ثبت بیمار جدید در کلینیک',
        requiresConfirmation: false,
      };
    }

    // 10. Quick Action: Search Modal
    if (clean.includes('جستجو') || clean.includes('سرچ') || clean.includes('search patient')) {
      return {
        intentKey: 'ACTION_SEARCH',
        matchedTextFa: 'باز کردن مدال جستجوی سریع هوشمند',
        category: 'SEARCH',
        actionSummaryFa: 'نمایش مدال پالت دستورات و جستجوی بیمار و نوبت',
        requiresConfirmation: false,
      };
    }

    // 11. Restricted Action: Reset System or Clear Chat
    if (clean.includes('بازنشانی سیستم') || clean.includes('پاکسازی سیستم')) {
      return {
        intentKey: 'RESTRICTED_RESET_DATA',
        matchedTextFa: 'درخواست بازنشانی داده‌های کلینیک',
        category: 'RESTRICTED',
        actionSummaryFa: 'هشدار: درخواست بازنشانی داده‌های محلی کلینیک نیازمند تایید صریح مدیر است.',
        requiresConfirmation: true,
        confirmationPromptFa: 'آیا اطمینان دارید می‌خواهید به برگه بازنشانی داده‌ها منتقل شوید؟',
        targetModule: 'settings',
        targetTab: 'system_setup',
      };
    }

    return null;
  }
}
