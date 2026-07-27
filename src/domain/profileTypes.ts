/**
 * VikiMedic v2 - Configuration Profiles Domain Types
 * Clean Architecture Layer: Domain
 * Enterprise Patch 01
 */

import { AISettingsConfig } from './aiTypes';
import { ShiftConfig } from './types';

export interface ProfileContent {
  clinicInfo: {
    name: string;
    city: string;
    address: string;
    phone: string;
    licenseNumber: string;
  };
  theme: 'light' | 'dark' | 'rose' | 'emerald' | 'navy';
  printerConfig: {
    defaultPrinter: string;
    paperSize: 'A4' | 'A5' | '80mm' | '58mm';
    autoPrintInvoice: boolean;
    autoPrintPrescription: boolean;
    copiesCount: number;
  };
  receiptLayout: {
    headerTitleFa: string;
    subtitleFa: string;
    footerNoteFa: string;
    showLogo: boolean;
    showBarcode: boolean;
    showDoctorLicense: boolean;
  };
  workingHours: {
    startTime: string; // e.g. "08:00"
    endTime: string;   // e.g. "22:00"
    workingDays: string[]; // e.g. ["شنبه", "یکشنبه", ...]
  };
  shiftSettings: ShiftConfig[];
  language: 'fa-IR' | 'en-US';
  currency: 'IRR' | 'IRT' | 'USD';
  notificationPreferences: {
    soundEnabled: boolean;
    desktopNotifications: boolean;
    shiftAlerts: boolean;
    queueAudioAlerts: boolean;
  };
  aiSettings: AISettingsConfig;
}

export interface ConfigurationProfile {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  content: ProfileContent;
}
