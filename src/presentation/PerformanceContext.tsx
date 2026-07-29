/**
 * VikiMedic v2 - Adaptive Performance Provider & Context
 * Clean Architecture Layer: Presentation
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  PerformanceMode,
  EffectivePerformanceMode,
  HardwareBenchmarkResult,
} from '../domain/performanceTypes';
import { PerformanceService } from '../infrastructure/performanceService';

interface PerformanceContextProps {
  mode: PerformanceMode;
  effectiveMode: EffectivePerformanceMode;
  hardwareReport: HardwareBenchmarkResult | null;
  isBenchmarking: boolean;
  setPerformanceMode: (mode: PerformanceMode) => void;
  runHardwareBenchmark: () => Promise<HardwareBenchmarkResult>;
}

const PerformanceContext = createContext<PerformanceContextProps>({
  mode: 'auto',
  effectiveMode: 'balanced',
  hardwareReport: null,
  isBenchmarking: false,
  setPerformanceMode: () => {},
  runHardwareBenchmark: async () => ({
    hasWebGL: true,
    gpuVendor: 'Standard',
    gpuRenderer: 'Default',
    logicalCores: 4,
    deviceMemoryGb: 8,
    screenResolution: '1920x1080',
    devicePixelRatio: 1,
    measuredFps: 60,
    cpuBenchmarkTimeMs: 10,
    score: 80,
    recommendedMode: 'high_quality',
    timestamp: '',
  }),
});

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<PerformanceMode>(() => PerformanceService.getSavedMode());
  const [hardwareReport, setHardwareReport] = useState<HardwareBenchmarkResult | null>(() =>
    PerformanceService.getCachedBenchmark()
  );
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);

  const runBenchmark = useCallback(async () => {
    setIsBenchmarking(true);
    try {
      const result = await PerformanceService.runHardwareBenchmark();
      setHardwareReport(result);
      return result;
    } finally {
      setIsBenchmarking(false);
    }
  }, []);

  // Run benchmark on initial mount if not present
  useEffect(() => {
    if (!hardwareReport) {
      runBenchmark();
    }
  }, [hardwareReport, runBenchmark]);

  // Determine active effective mode
  const effectiveMode: EffectivePerformanceMode =
    mode === 'auto'
      ? hardwareReport?.recommendedMode || 'balanced'
      : mode;

  // Apply CSS classes & data attributes to document head/root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      'perf-mode-auto',
      'perf-mode-high_quality',
      'perf-mode-balanced',
      'perf-mode-performance',
      'perf-effective-high_quality',
      'perf-effective-balanced',
      'perf-effective-performance'
    );

    root.classList.add(`perf-mode-${mode}`, `perf-effective-${effectiveMode}`);
    root.setAttribute('data-perf-mode', effectiveMode);
  }, [mode, effectiveMode]);

  const setPerformanceMode = (newMode: PerformanceMode) => {
    setModeState(newMode);
    PerformanceService.saveMode(newMode);
  };

  return (
    <PerformanceContext.Provider
      value={{
        mode,
        effectiveMode,
        hardwareReport,
        isBenchmarking,
        setPerformanceMode,
        runHardwareBenchmark: runBenchmark,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => useContext(PerformanceContext);
