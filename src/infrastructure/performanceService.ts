/**
 * VikiMedic v2 - Performance Benchmark & Detection Service
 * Clean Architecture Layer: Infrastructure
 */

import { HardwareBenchmarkResult, EffectivePerformanceMode, PerformanceMode } from '../domain/performanceTypes';

const PERFORMANCE_MODE_STORAGE_KEY = 'vikimedic_v2_performance_mode';
const BENCHMARK_RESULT_STORAGE_KEY = 'vikimedic_v2_performance_benchmark';

export class PerformanceService {
  /**
   * Retrieves saved performance mode or defaults to 'auto'
   */
  public static getSavedMode(): PerformanceMode {
    try {
      const saved = localStorage.getItem(PERFORMANCE_MODE_STORAGE_KEY);
      if (saved && ['auto', 'high_quality', 'balanced', 'performance'].includes(saved)) {
        return saved as PerformanceMode;
      }
    } catch {
      // Fallback
    }
    return 'auto';
  }

  /**
   * Saves performance mode preference to local storage
   */
  public static saveMode(mode: PerformanceMode): void {
    try {
      localStorage.setItem(PERFORMANCE_MODE_STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Retrieves cached benchmark result if available
   */
  public static getCachedBenchmark(): HardwareBenchmarkResult | null {
    try {
      const raw = localStorage.getItem(BENCHMARK_RESULT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Measures device FPS over ~10 frames
   */
  private static async measureFps(): Promise<number> {
    return new Promise((resolve) => {
      let frameCount = 0;
      let startTime = performance.now();

      const checkFrame = () => {
        frameCount++;
        if (frameCount >= 12) {
          const elapsed = performance.now() - startTime;
          const fps = Math.round((frameCount / elapsed) * 1000);
          resolve(Math.min(fps, 120));
        } else {
          requestAnimationFrame(checkFrame);
        }
      };

      requestAnimationFrame(checkFrame);
    });
  }

  /**
   * Runs a quick CPU benchmark
   */
  private static runCpuBenchmark(): number {
    const start = performance.now();
    let val = 0;
    for (let i = 0; i < 300000; i++) {
      val += Math.sqrt(i) * Math.sin(i);
    }
    const duration = performance.now() - start;
    return Math.round(duration * 100) / 100;
  }

  /**
   * Executes full hardware capability analysis
   */
  public static async runHardwareBenchmark(): Promise<HardwareBenchmarkResult> {
    let hasWebGL = false;
    let gpuVendor = 'نامشخص / نرم‌افزاری';
    let gpuRenderer = 'رندر نرم‌افزاری (Standard WebGL)';

    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (gl) {
        hasWebGL = true;
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'معتبر';
          gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'شتاب‌دهنده گرافیکی GPU';
        } else {
          gpuVendor = gl.getParameter(gl.VENDOR) || 'گرافیک مرجع';
          gpuRenderer = gl.getParameter(gl.RENDERER) || 'شتاب‌دهنده سخت‌افزاری';
        }
      }
    } catch {
      hasWebGL = false;
    }

    const logicalCores = navigator.hardwareConcurrency || 2;
    const deviceMemoryGb = (navigator as any).deviceMemory || null;
    const screenResolution = `${window.innerWidth}x${window.innerHeight}`;
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Run CPU test & FPS test
    const cpuBenchmarkTimeMs = this.runCpuBenchmark();
    const measuredFps = await this.measureFps();

    // Check for software GPU
    const isSoftwareGpu =
      !hasWebGL ||
      gpuRenderer.toLowerCase().includes('swiftshader') ||
      gpuRenderer.toLowerCase().includes('llvmpipe') ||
      gpuRenderer.toLowerCase().includes('software');

    // Calculate Hardware Capability Score (0 to 100)
    let score = 0;

    // GPU Score (max 25)
    if (hasWebGL && !isSoftwareGpu) score += 25;
    else if (hasWebGL) score += 10;
    else score += 0;

    // CPU Cores Score (max 25)
    if (logicalCores >= 8) score += 25;
    else if (logicalCores >= 4) score += 18;
    else if (logicalCores >= 2) score += 10;
    else score += 5;

    // RAM Score (max 20)
    if (deviceMemoryGb === null) {
      score += 12; // Moderate assumption
    } else if (deviceMemoryGb >= 8) {
      score += 20;
    } else if (deviceMemoryGb >= 4) {
      score += 12;
    } else {
      score += 5;
    }

    // FPS Score (max 20)
    if (measuredFps >= 55) score += 20;
    else if (measuredFps >= 35) score += 12;
    else score += 5;

    // CPU Benchmark Score (max 10)
    if (cpuBenchmarkTimeMs < 12) score += 10;
    else if (cpuBenchmarkTimeMs < 30) score += 6;
    else score += 2;

    // Determine Recommended Effective Performance Mode
    let recommendedMode: EffectivePerformanceMode = 'balanced';
    if (score >= 68) {
      recommendedMode = 'high_quality';
    } else if (score >= 42) {
      recommendedMode = 'balanced';
    } else {
      recommendedMode = 'performance';
    }

    const result: HardwareBenchmarkResult = {
      hasWebGL,
      gpuVendor,
      gpuRenderer,
      logicalCores,
      deviceMemoryGb,
      screenResolution,
      devicePixelRatio,
      measuredFps,
      cpuBenchmarkTimeMs,
      score,
      recommendedMode,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      localStorage.setItem(BENCHMARK_RESULT_STORAGE_KEY, JSON.stringify(result));
    } catch {
      // Ignore
    }

    return result;
  }
}
