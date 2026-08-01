/**
 * VikiMedic v2 - Module Integrity Checker Domain Types
 * Clean Architecture Layer: Domain
 * Phase 00.5 Core Infrastructure
 */

export type ModuleHealthStatus =
  | 'Healthy'
  | 'Warning'
  | 'Recovering'
  | 'Degraded'
  | 'Disabled'
  | 'Failed';

export type EventSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface ModuleMetadata {
  id: string;
  nameFa: string;
  nameEn: string;
  version: string;
  status: ModuleHealthStatus;
  dependencies: string[];
  healthScore: number; // 0 - 100
  responseTimeMs: number;
  memoryUsageMb: number;
  lastValidation: string;
  lastError?: string;
  recoveryAttempts: number;
  isEssential: boolean; // Cannot be disabled if essential
}

export interface ModuleIntegrityEvent {
  id: string;
  timestamp: string;
  moduleId: string;
  moduleNameFa: string;
  severity: EventSeverity;
  errorType: string;
  messageFa: string;
  recoveryResult?: string;
  user: string;
  machine: string;
  appVersion: string;
}

export interface StartupIntegrityReport {
  timestamp: string;
  totalModules: number;
  healthyCount: number;
  warningCount: number;
  degradedCount: number;
  failedCount: number;
  disabledCount: number;
  overallHealthScore: number;
  recommendSafeMode: boolean;
  modules: ModuleMetadata[];
  environment: {
    appVersion: string;
    userAgent: string;
    isOffline: boolean;
    storageEngine: string;
  };
}

export interface DiagnosticPackage {
  generatedAt: string;
  appVersion: string;
  overallHealthScore: number;
  recommendSafeMode: boolean;
  modules: ModuleMetadata[];
  startupReport: StartupIntegrityReport;
  recentEvents: ModuleIntegrityEvent[];
  performanceSummary: {
    avgResponseTimeMs: number;
    totalMemoryUsageMb: number;
    unhandledExceptionsCount: number;
  };
  sanitizedConfig: {
    clinicCode: string;
    themeMode: string;
    activeModulesCount: number;
  };
}
