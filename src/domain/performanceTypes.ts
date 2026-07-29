/**
 * VikiMedic v2 - Performance Patch 01 Domain Types
 * Clean Architecture Layer: Domain
 */

export type PerformanceMode = 'auto' | 'high_quality' | 'balanced' | 'performance';

export type EffectivePerformanceMode = 'high_quality' | 'balanced' | 'performance';

export interface HardwareBenchmarkResult {
  hasWebGL: boolean;
  gpuVendor: string;
  gpuRenderer: string;
  logicalCores: number;
  deviceMemoryGb: number | null;
  screenResolution: string;
  devicePixelRatio: number;
  measuredFps: number;
  cpuBenchmarkTimeMs: number;
  score: number; // 0 (Low) to 100 (Ultra High)
  recommendedMode: EffectivePerformanceMode;
  timestamp: string;
}

export interface PerformanceSettings {
  mode: PerformanceMode;
  lastBenchmark: HardwareBenchmarkResult | null;
}
