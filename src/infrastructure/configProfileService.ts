/**
 * VikiMedic v2 - Configuration Profiles Infrastructure Service
 * Clean Architecture Layer: Infrastructure
 * Enterprise Patch 01
 */

import { ConfigurationProfile, ProfileContent } from '../domain/profileTypes';
import { LocalStorageManager } from './storage';
import { DEFAULT_AI_SETTINGS } from '../domain/aiTypes';
import { Clinic, ShiftConfig } from '../domain/types';

const PROFILES_STORAGE_KEY = 'vikimedic_v2_config_profiles';

const DEFAULT_PROFILE_CONTENT: ProfileContent = {
  clinicInfo: {
    name: 'کلینیک تخصصی VikiMedic',
    city: 'تهران',
    address: 'خیابان ولیعصر، بالاتر از ظفر، پلاک ۱۲۴',
    phone: '۰۲۱-۸۸۷۷۶۶۵۵',
    licenseNumber: 'م/۱۲۳۴۵/د',
  },
  theme: 'light',
  printerConfig: {
    defaultPrinter: 'Thermal POS Printer 80mm',
    paperSize: '80mm',
    autoPrintInvoice: true,
    autoPrintPrescription: false,
    copiesCount: 1,
  },
  receiptLayout: {
    headerTitleFa: 'کلینیک تخصصی درمانی VikiMedic',
    subtitleFa: 'قبض رسمی دریافت وجه و فرانشیز بیمار',
    footerNoteFa: 'با تشکر از مراجعه شما • آرزومند سلامتی شما هستیم',
    showLogo: true,
    showBarcode: true,
    showDoctorLicense: true,
  },
  workingHours: {
    startTime: '08:00',
    endTime: '22:00',
    workingDays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه'],
  },
  shiftSettings: [],
  language: 'fa-IR',
  currency: 'IRT',
  notificationPreferences: {
    soundEnabled: true,
    desktopNotifications: true,
    shiftAlerts: true,
    queueAudioAlerts: true,
  },
  aiSettings: DEFAULT_AI_SETTINGS,
};

export class ConfigProfileService {
  /**
   * Get all configuration profiles
   */
  public static getProfiles(): ConfigurationProfile[] {
    const saved = LocalStorageManager.getItem<ConfigurationProfile[] | null>(PROFILES_STORAGE_KEY, null);
    if (saved && saved.length > 0) return saved;

    // Seed default profiles
    const defaultProfiles: ConfigurationProfile[] = [
      {
        id: 'prof_default_standard',
        name: 'پروفایل پیش‌فرض کلینیک عمومی',
        description: 'پیکربندی استاندارد برای درمانگاه‌های عمومی با شیفت‌های ۳ گانه و قالب فاکتور حرارتی ۸۰mm',
        isDefault: true,
        isActive: true,
        createdAt: new Date().toLocaleDateString('fa-IR'),
        updatedAt: new Date().toLocaleDateString('fa-IR'),
        createdBy: 'مدیر ارشد سیستم',
        content: DEFAULT_PROFILE_CONTENT,
      },
      {
        id: 'prof_24h_emergency',
        name: 'پروفایل مرکز شبانه‌روزی و اورژانس',
        description: 'پیکربندی ویژه مراکز ۲۴ ساعته با صدای هشدار فراخوان بالا و چاپ خودکار ۲ نسخه قبض',
        isDefault: false,
        isActive: false,
        createdAt: new Date().toLocaleDateString('fa-IR'),
        updatedAt: new Date().toLocaleDateString('fa-IR'),
        createdBy: 'مدیر سیستم',
        content: {
          ...DEFAULT_PROFILE_CONTENT,
          clinicInfo: {
            ...DEFAULT_PROFILE_CONTENT.clinicInfo,
            name: 'مرکز شبانه‌روزی و اورژانس VikiMedic',
          },
          printerConfig: {
            ...DEFAULT_PROFILE_CONTENT.printerConfig,
            copiesCount: 2,
            autoPrintInvoice: true,
          },
          workingHours: {
            startTime: '00:00',
            endTime: '23:59',
            workingDays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'],
          },
        },
      },
      {
        id: 'prof_rose_beauty',
        name: 'پروفایل کلینیک زیبایی و پوست (تم رز)',
        description: 'پیکربندی دیداری با تم رز پاستلی و تنظیمات پیش‌فرض نوبت‌دهی خدمات زیبایی',
        isDefault: false,
        isActive: false,
        createdAt: new Date().toLocaleDateString('fa-IR'),
        updatedAt: new Date().toLocaleDateString('fa-IR'),
        createdBy: 'مدیر سیستم',
        content: {
          ...DEFAULT_PROFILE_CONTENT,
          theme: 'rose',
          clinicInfo: {
            ...DEFAULT_PROFILE_CONTENT.clinicInfo,
            name: 'کلینیک تخصصی پوست و زیبایی رز',
          },
        },
      },
    ];

    LocalStorageManager.setItem(PROFILES_STORAGE_KEY, defaultProfiles);
    return defaultProfiles;
  }

  /**
   * Save profiles list to storage
   */
  public static saveProfiles(profiles: ConfigurationProfile[]): void {
    LocalStorageManager.setItem(PROFILES_STORAGE_KEY, profiles);
  }

  /**
   * Get active profile
   */
  public static getActiveProfile(): ConfigurationProfile {
    const profiles = this.getProfiles();
    return profiles.find((p) => p.isActive) || profiles[0];
  }

  /**
   * Create new profile
   */
  public static createProfile(name: string, description: string, baseContent?: ProfileContent): ConfigurationProfile {
    const profiles = this.getProfiles();
    const newProfile: ConfigurationProfile = {
      id: `prof_${Date.now()}`,
      name,
      description: description || 'پروفایل سفارشی جدید سیستم',
      isDefault: false,
      isActive: false,
      createdAt: new Date().toLocaleDateString('fa-IR'),
      updatedAt: new Date().toLocaleDateString('fa-IR'),
      createdBy: 'مدیر سیستم',
      content: baseContent ? JSON.parse(JSON.stringify(baseContent)) : DEFAULT_PROFILE_CONTENT,
    };

    profiles.push(newProfile);
    this.saveProfiles(profiles);
    return newProfile;
  }

  /**
   * Rename profile
   */
  public static renameProfile(profileId: string, name: string, description: string): void {
    const profiles = this.getProfiles();
    const target = profiles.find((p) => p.id === profileId);
    if (target) {
      target.name = name;
      target.description = description;
      target.updatedAt = new Date().toLocaleDateString('fa-IR');
      this.saveProfiles(profiles);
    }
  }

  /**
   * Duplicate profile
   */
  public static duplicateProfile(profileId: string, newName: string): ConfigurationProfile | null {
    const profiles = this.getProfiles();
    const source = profiles.find((p) => p.id === profileId);
    if (!source) return null;

    const copy: ConfigurationProfile = {
      id: `prof_${Date.now()}`,
      name: newName || `${source.name} (نسخه کپی)`,
      description: `کپی شده از ${source.name}`,
      isDefault: false,
      isActive: false,
      createdAt: new Date().toLocaleDateString('fa-IR'),
      updatedAt: new Date().toLocaleDateString('fa-IR'),
      createdBy: 'مدیر سیستم',
      content: JSON.parse(JSON.stringify(source.content)),
    };

    profiles.push(copy);
    this.saveProfiles(profiles);
    return copy;
  }

  /**
   * Delete profile
   */
  public static deleteProfile(profileId: string): boolean {
    let profiles = this.getProfiles();
    const target = profiles.find((p) => p.id === profileId);
    if (!target || target.isActive || target.isDefault) {
      return false; // Cannot delete active or default profile
    }

    profiles = profiles.filter((p) => p.id !== profileId);
    this.saveProfiles(profiles);
    return true;
  }

  /**
   * Export profile as JSON
   */
  public static exportProfileJSON(profileId: string): void {
    const profiles = this.getProfiles();
    const target = profiles.find((p) => p.id === profileId);
    if (!target) return;

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(target, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `VikiMedic_Profile_${target.name.replace(/\s+/g, '_')}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Import profile from JSON string
   */
  public static importProfileFromJSON(jsonText: string): ConfigurationProfile | null {
    try {
      const parsed = JSON.parse(jsonText) as ConfigurationProfile;
      if (!parsed.name || !parsed.content) return null;

      const profiles = this.getProfiles();
      const newProf: ConfigurationProfile = {
        ...parsed,
        id: `prof_imp_${Date.now()}`,
        name: `${parsed.name} (واردشده)`,
        isActive: false,
        isDefault: false,
        createdAt: new Date().toLocaleDateString('fa-IR'),
        updatedAt: new Date().toLocaleDateString('fa-IR'),
      };

      profiles.push(newProf);
      this.saveProfiles(profiles);
      return newProf;
    } catch (e) {
      return null;
    }
  }

  /**
   * Activate profile safely (DOES NOT MODIFY operational records: patients, medical records, invoices)
   */
  public static activateProfile(
    profileId: string,
    callbacks: {
      onUpdateClinicSettings: (clinic: Clinic) => void;
      onSetTheme?: (themeName: any) => void;
      onUpdateAISettings?: (ai: any) => void;
    }
  ): boolean {
    const profiles = this.getProfiles();
    const target = profiles.find((p) => p.id === profileId);
    if (!target) return false;

    // Mark active
    profiles.forEach((p) => {
      p.isActive = p.id === profileId;
    });
    this.saveProfiles(profiles);

    // Apply safe configuration settings
    const activeClinic = LocalStorageManager.getClinics()[0];
    if (activeClinic) {
      callbacks.onUpdateClinicSettings({
        ...activeClinic,
        name: target.content.clinicInfo.name,
        address: target.content.clinicInfo.address,
        phone: target.content.clinicInfo.phone,
        licenseNumber: target.content.clinicInfo.licenseNumber,
      });
    }

    // Apply printer config & receipt layout to storage
    LocalStorageManager.setItem('vikimedic_v2_printer_config', target.content.printerConfig);
    LocalStorageManager.setItem('vikimedic_v2_receipt_layout', target.content.receiptLayout);

    // Apply theme
    if (callbacks.onSetTheme && target.content.theme) {
      callbacks.onSetTheme(target.content.theme);
    }

    // Apply AI settings
    if (target.content.aiSettings) {
      LocalStorageManager.saveAISettings(target.content.aiSettings);
    }

    return true;
  }
}
