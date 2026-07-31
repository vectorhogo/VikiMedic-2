/**
 * VikiMedic v2 - Display & Performance Mode Panel
 * Performance Patch 01 - Adaptive Performance Mode
 * Clean Architecture Layer: Presentation
 */

import React from 'react';
import {
  Zap,
  Gauge,
  Sparkles,
  Monitor,
  Cpu,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Layers,
  Palette,
  Check,
  Leaf,
} from 'lucide-react';
import { usePerformance } from '../../PerformanceContext';
import { useTheme } from '../../ThemeContext';
import { PerformanceMode } from '../../../domain/performanceTypes';

export const DisplayPerformancePanel: React.FC = () => {
  const {
    mode,
    effectiveMode,
    hardwareReport,
    isBenchmarking,
    setPerformanceMode,
    runHardwareBenchmark,
  } = usePerformance();

  const { theme, setTheme } = useTheme();

  const modeOptions: {
    id: PerformanceMode;
    titleFa: string;
    badgeFa: string;
    descriptionFa: string;
    icon: any;
    colorClass: string;
  }[] = [
    {
      id: 'auto',
      titleFa: 'هوشمند و خودکار (Auto)',
      badgeFa: 'پیش‌فرض توصیه شده',
      descriptionFa: 'سنجش خودکار سخت‌افزار رایانه در زمان اجرا و اعمال بهترین حالت رندرینگ متناسب با GPU و CPU.',
      icon: Sparkles,
      colorClass: 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'high_quality',
      titleFa: 'کیفیت بصری حداکثر (High Quality)',
      badgeFa: 'مناسب سیستم‌های قوی',
      descriptionFa: 'فعال‌سازی تمامی افکت‌های شیشه‌ای، بلورهای سه‌بعدی، انیمیشن‌های روان و سایه‌های نرم و عمیق.',
      icon: Layers,
      colorClass: 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'balanced',
      titleFa: 'متوازن (Balanced)',
      badgeFa: 'تعادل سرعت و زیبایی',
      descriptionFa: 'کاهش ملایم شدت بلور پس‌زمینه و انیمیشن‌ها جهت حفظ سرعت بالا همراه با زیبایی محیط کاربری.',
      icon: Gauge,
      colorClass: 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'performance',
      titleFa: 'عملکرد و سرعت حداکثر (Performance)',
      badgeFa: 'ویژه رایانه‌های ضعیف',
      descriptionFa: 'حذف بلورها، غیرفعال‌سازی سایه‌های سنگین و انیمیشن‌های زاید جهت اجرای آنی روی سخت‌افزار قدیمی.',
      icon: Zap,
      colorClass: 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  const getModeTitleFA = (m: string) => {
    switch (m) {
      case 'high_quality':
        return 'کیفیت بالا (High Quality)';
      case 'balanced':
        return 'متوازن (Balanced)';
      case 'performance':
        return 'سرعت و عملکرد (Performance)';
      default:
        return 'هوشمند';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 dir-rtl text-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 rounded-2xl shadow-sm border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black">تنظیمات نمایش و حالت عملکرد (Display & Performance Mode)</h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Performance Patch 01
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              مدیریت هوشمند موتور رندرینگ، بهینه‌سازی سرعت روی رایانه‌های ضعیف و حفظ کیفیت شفاف تایپوگرافی فارسی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700 font-mono text-[11px]">
          <span className="text-slate-400">حالت فعال فعلی:</span>
          <span className="font-bold text-amber-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            {getModeTitleFA(effectiveMode)}
          </span>
        </div>
      </div>

      {/* Main Grid: Performance Modes + Theme Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Mode Card Selector */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h2 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>انتخاب حالت عملکرد (Performance Mode)</span>
            </h2>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              تنظیم شده روی: <strong className="text-blue-600 dark:text-blue-400">{mode.toUpperCase()}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {modeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = mode === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() => setPerformanceMode(opt.id)}
                  className={`p-4 rounded-xl border text-right transition relative flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? `${opt.colorClass} ring-2 ring-blue-500/30 shadow-md`
                      : 'border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-slate-400 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">{opt.titleFa}</h3>
                        <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">{opt.badgeFa}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{opt.descriptionFa}</p>
                </button>
              );
            })}
          </div>

          {/* Table of Active Render Effects */}
          <div className="mt-4 bg-[var(--bg-app)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>وضعیت دقیق بهینه‌سازی‌ها در حالت فعال فعلی ({getModeTitleFA(effectiveMode)})</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 font-medium text-[11px]">
              <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col gap-1">
                <span className="text-[10px] text-[var(--text-muted)]">شدت بلور پس‌زمینه (Blur)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {effectiveMode === 'performance' ? 'غیرفعال (0px)' : effectiveMode === 'balanced' ? 'کاهش‌یافته (4px)' : 'کامل (12px)'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col gap-1">
                <span className="text-[10px] text-[var(--text-muted)]">شفافیت گلاس (Glass Effect)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {effectiveMode === 'performance' ? 'سطح ساده (Solid)' : effectiveMode === 'balanced' ? 'نیمه‌شفاف ساده' : 'گلاس سه‌بعدی'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col gap-1">
                <span className="text-[10px] text-[var(--text-muted)]">مدت انیمیشن‌ها (Animations)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {effectiveMode === 'performance' ? 'آنی (0.05s)' : effectiveMode === 'balanced' ? 'سریع (0.12s)' : 'روان (0.22s)'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col gap-1">
                <span className="text-[10px] text-[var(--text-muted)]">سایه‌ها و هالوهای نوری</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {effectiveMode === 'performance' ? 'حذف سایه z' : effectiveMode === 'balanced' ? 'سایه تک‌لایه' : 'سایه‌های عمیق'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col gap-1 col-span-2 md:col-span-2">
                <span className="text-[10px] text-[var(--text-muted)]">کیفیت فونت و تایپوگرافی (Persian Font Quality)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>شفافیت و وضوح ۱۰۰٪ (Antialiased & Tabular Numbers)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Hardware Capability & Benchmark Report */}
        <div className="space-y-6">
          {/* Hardware Diagnostic Card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h2 className="font-bold text-sm flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Monitor className="w-4 h-4" />
                <span>گزارش ارزیابی سخت‌افزار دستگاه</span>
              </h2>

              <button
                onClick={runHardwareBenchmark}
                disabled={isBenchmarking}
                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 font-bold flex items-center gap-1 transition text-[11px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBenchmarking ? 'animate-spin' : ''}`} />
                <span>ارزیابی مجدد</span>
              </button>
            </div>

            {hardwareReport ? (
              <div className="space-y-3 font-mono">
                <div className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)] flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-blue-500" />
                      <span>پردازنده (CPU Cores):</span>
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100">{hardwareReport.logicalCores} هسته منطقی</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)] flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-purple-500" />
                      <span>حافظه رم (RAM):</span>
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100">
                      {hardwareReport.deviceMemoryGb ? `حدود ${hardwareReport.deviceMemoryGb} گیگابایت` : 'استاندارد'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)] flex items-center gap-1">
                      <Monitor className="w-3.5 h-3.5 text-emerald-500" />
                      <span>رزولوشن تصویر:</span>
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100">
                      {hardwareReport.screenResolution} (DPR {hardwareReport.devicePixelRatio})
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)] flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-amber-500" />
                      <span>فریم‌ریت رندر (FPS):</span>
                    </span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{hardwareReport.measuredFps} FPS</strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)] flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-pink-500" />
                      <span>تست سرعت محاسباتی:</span>
                    </span>
                    <strong className="text-slate-900 dark:text-slate-100">{hardwareReport.cpuBenchmarkTimeMs} میلی‌ثانیه</strong>
                  </div>
                </div>

                {/* GPU Renderer string */}
                <div className="p-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] text-[11px] leading-relaxed">
                  <span className="text-[var(--text-muted)] block font-sans font-bold mb-1">کارت گرافیک و موتور WebGL:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold block truncate">{hardwareReport.gpuRenderer}</span>
                  <span className="text-[10px] text-[var(--text-muted)] block mt-0.5 font-mono">سازنده: {hardwareReport.gpuVendor}</span>
                </div>

                {/* Capability Score & Recommended Mode Badge */}
                <div className="p-3.5 bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 rounded-xl space-y-2 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-300">امتیاز توان سخت‌افزار:</span>
                    <span className="font-mono font-black text-sm text-blue-400">{hardwareReport.score} / 100</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-blue-500/20">
                    <span className="font-bold text-slate-300">حالت پیشنهادی سامانه:</span>
                    <span className="font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">
                      {getModeTitleFA(hardwareReport.recommendedMode)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-[var(--text-muted)]">در حال تحلیل سخت‌افزار...</div>
            )}
          </div>

          {/* Theme Quick Selector Box */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="font-bold text-sm flex items-center gap-2 text-pink-600 dark:text-pink-400">
              <Palette className="w-4 h-4" />
              <span>پوسته و تم رنگی (Color Theme)</span>
            </h2>

            <div className="grid grid-cols-1 gap-2 pt-1 font-bold">
              <button
                onClick={() => setTheme('theme-default')}
                className={`p-3 rounded-xl border text-right flex items-center justify-between transition ${
                  theme === 'theme-default' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'border-[var(--border-subtle)] bg-[var(--bg-app)]'
                }`}
              >
                <span>تم سفید پزشکی (Medical White)</span>
                {theme === 'theme-default' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
              </button>

              <button
                onClick={() => setTheme('clinic-olive')}
                className={`p-3 rounded-xl border text-right flex items-center justify-between transition ${
                  theme === 'clinic-olive' ? 'border-[#6F7952] bg-[#E7E9DC] text-[#20231D]' : 'border-[var(--border-subtle)] bg-[var(--bg-app)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-[#6F7952]" />
                  <span>تم سبز کلینیک (Minimal Olive - سبز)</span>
                </div>
                {theme === 'clinic-olive' && <CheckCircle2 className="w-4 h-4 text-[#6F7952]" />}
              </button>

              <button
                onClick={() => setTheme('theme-dark')}
                className={`p-3 rounded-xl border text-right flex items-center justify-between transition ${
                  theme === 'theme-dark' ? 'border-purple-500 bg-purple-950/40 text-purple-300' : 'border-[var(--border-subtle)] bg-[var(--bg-app)]'
                }`}
              >
                <span>تم دارک و شب (Sophisticated Dark)</span>
                {theme === 'theme-dark' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
              </button>

              <button
                onClick={() => setTheme('theme-rose')}
                className={`p-3 rounded-xl border text-right flex items-center justify-between transition ${
                  theme === 'theme-rose' ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'border-[var(--border-subtle)] bg-[var(--bg-app)]'
                }`}
              >
                <span>تم رز لوکس (Hidden Rose)</span>
                {theme === 'theme-rose' && <CheckCircle2 className="w-4 h-4 text-rose-500" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
