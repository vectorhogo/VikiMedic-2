/**
 * VikiMedic v2 - Pre-Launch System Readiness Validation Types
 * Clean Architecture Layer: Domain
 * Enterprise Patch 01
 */

export type ValidationStatus = 'PASSED' | 'WARNING' | 'FAILED';

export interface ValidationItemResult {
  id: string;
  titleFa: string;
  categoryFa: string;
  status: ValidationStatus;
  summaryFa: string;
  problemFa?: string;
  actionFa?: string;
  targetTab?: string; // Tab key in Settings or module key to navigate to
  targetModule?: string;
}

export interface ReadinessReport {
  timestamp: string;
  generatedBy: string;
  clinicName: string;
  totalChecks: number;
  passedCount: number;
  warningCount: number;
  failedCount: number;
  readinessScore: number; // 0 - 100%
  items: ValidationItemResult[];
  environmentInfo: {
    appVersion: string;
    browser: string;
    storageUsage: string;
    activeClinicCode: string;
    supabaseStatus: string;
  };
}
