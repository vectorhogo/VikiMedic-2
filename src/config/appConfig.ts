/**
 * VikiMedic v2 - Centralized Configuration Layer & Environment Manager
 * Clean Architecture Layer: Configuration
 *
 * Stores all configurable values (App Name, Clinic Name, Version, Environment,
 * Supabase placeholders, Theme configs, Feature Flags, and Brand Assets).
 */

import { CentralAppConfig, EnvironmentMode, TargetPlatform } from '../packages/types/bootstrap';

// Default Central Configuration State
export const APP_CONFIG: CentralAppConfig = {
  appName: 'VikiMedic v2',
  appNameFA: 'ویکی‌مدیک نسخه ۲',
  clinicName: 'VikiMedic Specialized & Subspecialized Clinic',
  clinicNameFA: 'کلینیک تخصصی و فوق‌تخصصی ویکی‌مدیک',
  version: '2.0.0-phase1.5',
  environment: 'DEVELOPMENT',
  targetPlatform: 'WINDOWS_DESKTOP',
  supabase: {
    url: 'https://viki-medic-clinic.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder.anon.key',
    serviceRoleKeyPlaceholder: 'SERVICE_ROLE_KEY_PROTECTED',
    dbVersion: '15.1-pgvector',
  },
  defaultTheme: 'medical_white',
  featureFlags: {
    enableOfflineSync: true,
    enableThermalPrinting: true,
    enableLaserPrinting: true,
    enableAiAssistant: true,
    enableBiometrics: false,
    enableMultiBranch: true,
    enableInsuranceAPI: true,
    enableSmsGateway: true,
  },
  brandAssets: {
    logoUrl: '/assets/logo-vikimedic.svg',
    logoRtlUrl: '/assets/logo-vikimedic-fa.svg',
    faviconUrl: '/favicon.ico',
    primaryFont: 'IRANYekanX, Vazirmatn, sans-serif',
    secondaryFont: 'Playfair Display, serif',
  },
};

/**
 * Switch Active Environment dynamically without breaking application runtime.
 */
export function setEnvironmentMode(mode: EnvironmentMode): CentralAppConfig {
  APP_CONFIG.environment = mode;
  return { ...APP_CONFIG };
}

/**
 * Switch Target Platform dynamically.
 */
export function setTargetPlatform(platform: TargetPlatform): CentralAppConfig {
  APP_CONFIG.targetPlatform = platform;
  return { ...APP_CONFIG };
}

/**
 * Toggle Feature Flag dynamically.
 */
export function toggleFeatureFlag(flagKey: keyof typeof APP_CONFIG.featureFlags): CentralAppConfig {
  APP_CONFIG.featureFlags[flagKey] = !APP_CONFIG.featureFlags[flagKey];
  return { ...APP_CONFIG };
}
