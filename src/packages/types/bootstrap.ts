/**
 * VikiMedic v2 - Workspace Bootstrap & Configuration Types
 * Clean Architecture Layer: Domain / Shared Types
 */

export type EnvironmentMode = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';

export type TargetPlatform = 'WINDOWS_DESKTOP' | 'WEB_SPA' | 'ANDROID_MOBILE';

export interface ClinicBrandAssets {
  logoUrl: string;
  logoRtlUrl: string;
  faviconUrl: string;
  primaryFont: string;
  secondaryFont: string;
}

export interface FeatureFlags {
  enableOfflineSync: boolean;
  enableThermalPrinting: boolean;
  enableLaserPrinting: boolean;
  enableAiAssistant: boolean;
  enableBiometrics: boolean;
  enableMultiBranch: boolean;
  enableInsuranceAPI: boolean;
  enableSmsGateway: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKeyPlaceholder: string;
  dbVersion: string;
}

export interface CentralAppConfig {
  appName: string;
  appNameFA: string;
  clinicName: string;
  clinicNameFA: string;
  version: string;
  environment: EnvironmentMode;
  targetPlatform: TargetPlatform;
  supabase: SupabaseConfig;
  defaultTheme: 'medical_white' | 'dark_eyesafe' | 'rose_luxe';
  featureFlags: FeatureFlags;
  brandAssets: ClinicBrandAssets;
}

export interface BuildProfile {
  id: 'desktop_dev' | 'desktop_prod' | 'web_dev' | 'web_prod';
  name: string;
  nameFA: string;
  platform: TargetPlatform;
  environment: EnvironmentMode;
  enableSourceMaps: boolean;
  minify: boolean;
  bundleTarget: string;
  tauriIntegration: boolean;
  port: number;
}

export interface WorkspaceDirectoryItem {
  path: string;
  purpose: string;
  purposeFA: string;
  status: 'ACTIVE' | 'READY' | 'CONFIGURED';
}
