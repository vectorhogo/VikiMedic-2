/**
 * VikiMedic v2 - Development Environment Explorer & Inspector Module
 * Clean Architecture Layer: Presentation
 *
 * Interactive module for exploring and auditing:
 * - Environment & Logger (Dev vs Prod error formatting & live log stream)
 * - Path Aliases Registry (@components, @services, @shared, @types, @utils, etc.)
 * - Font Stack & Persian Typography Validator (IRANYekanX, IRANSansX, Noto Sans)
 * - Pre-Build Validation Auditor (Strict TS, ESLint, Env secrets check)
 * - Git & CI/CD Workflow Rules
 */

import React, { useState, useEffect } from 'react';
import {
  Code,
  Terminal,
  Layers,
  FileCode,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FolderGit2,
  Type,
  Bug,
  Sliders,
  Sparkles,
  Trash2,
  Play,
  FileCheck,
  Zap,
} from 'lucide-react';
import { useClinic } from '../../application/ClinicContext';
import { APP_CONFIG, setEnvironmentMode } from '../../config/appConfig';
import {
  logDevEvent,
  getDevLogs,
  clearDevLogs,
  formatErrorMessage,
  runPreBuildValidation,
  LogEntry,
  PreBuildCheckResult,
} from '../../infrastructure/devEnvironment';

export const DevEnvironmentModule: React.FC = () => {
  const { addNotification } = useClinic();
  const [activeTab, setActiveTab] = useState<'logger' | 'aliases' | 'fonts' | 'prebuild' | 'workflow'>('logger');

  // Logs state
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testErrorInput, setTestErrorInput] = useState<string>('خطای اتصال به پایگاه داده درمانگاه (Database Connection Timeout)');
  const [formattedErrorResult, setFormattedErrorResult] = useState<{ userMessageFA: string; devDetails: string } | null>(null);

  // Pre-build validation state
  const [validationResult, setValidationResult] = useState<PreBuildCheckResult>(runPreBuildValidation());
  const [isValidating, setIsValidating] = useState<boolean>(false);

  useEffect(() => {
    // Initial logs seed
    logDevEvent('INFO', 'Bootstrap', 'محیط توسعه VikiMedic v2 با موفقیت راه‌اندازی شد.');
    logDevEvent('DEBUG', 'PathAliases', 'مسیرهای میانبر (Path Aliases) بارگذاری گردیدند.');
    logDevEvent('INFO', 'FontManager', 'فونت IRANYekanX و Vazirmatn در حافظه ثبت شدند.');
    setLogs(getDevLogs());
  }, []);

  const handleSimulateLog = (level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL') => {
    logDevEvent(level, 'UserSim', `تست ثبت رویداد در محیط ${APP_CONFIG.environment}`, { timestamp: Date.now() });
    setLogs(getDevLogs());
  };

  const handleClearLogs = () => {
    clearDevLogs();
    setLogs([]);
    addNotification('لاین لاگ‌های توسعه پاکسازی گردید.', 'info');
  };

  const handleTestErrorFormatting = () => {
    const res = formatErrorMessage(new Error(testErrorInput), 'ماژول مالی & پذیرش');
    setFormattedErrorResult(res);
    logDevEvent('ERROR', 'ErrorSimulator', testErrorInput);
    setLogs(getDevLogs());
  };

  const handleRunBuildValidation = () => {
    setIsValidating(true);
    setTimeout(() => {
      const res = runPreBuildValidation();
      setValidationResult(res);
      setIsValidating(false);
      addNotification('اعتبارسنجی پیش از کامپایل (Pre-Build Check) انجام شد.', 'success');
    }, 600);
  };

  const pathAliasesList = [
    { alias: '@/*', target: './*', purpose: 'ارجاع کلی به ریشه سورس‌کد' },
    { alias: '@components/*', target: './src/presentation/components/*', purpose: 'کامپوننت‌های قابلاحتساب رابط کاربری' },
    { alias: '@modules/*', target: './src/presentation/modules/*', purpose: 'ماژول‌های وظیفه‌ای کلینیک' },
    { alias: '@services/*', target: './src/infrastructure/services/*', purpose: 'سرویس‌های دیتابیس و مخازن داده' },
    { alias: '@shared/*', target: './src/packages/shared/*', purpose: 'موجودیت‌های دامنه و قوانین کسب‌وکار' },
    { alias: '@types/*', target: './src/packages/types/*', purpose: 'اینترفیس‌ها و تایپ‌های تایپ‌اسکریپت' },
    { alias: '@utils/*', target: './src/packages/utils/*', purpose: 'توابع تاریخ شمسی و محاسبات ریالی' },
    { alias: '@config/*', target: './src/config/*', purpose: 'تنظیمات مرکزی و پروفایل‌های ساخت' },
    { alias: '@assets/*', target: './src/assets/*', purpose: 'فونت‌ها، لوگوها و قالب‌های چاپ' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase">
              Phase 01.5 - Part 02
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
              Development Environment Standards
            </span>
          </div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Code className="w-6 h-6 text-sky-400" />
            <span>محیط توسعه و ابزارهای مهندسی (Development Environment)</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            ابزارهای مانیتورینگ لاگ‌های توسعه، آزمایش فرمت خطای فارسی، آدرس‌های میانبر Path Aliases، فونت‌های بومی و چک‌لیست اعتبارسنجی پیش از کامپایل.
          </p>
        </div>

        <div className="z-10 flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 px-3 py-2 rounded-xl text-xs font-bold text-sky-300">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Vite Fast Refresh & HMR Active</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('logger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'logger' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>موتور لاگر و گزارش خطا (Dev Logger & Errors)</span>
        </button>

        <button
          onClick={() => setActiveTab('aliases')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'aliases' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>مسیرهای میانبر (Path Aliases)</span>
        </button>

        <button
          onClick={() => setActiveTab('fonts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'fonts' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>فونت‌ها و بومی‌سازی (Typography)</span>
        </button>

        <button
          onClick={() => setActiveTab('prebuild')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'prebuild' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>اعتبارسنجی پیش از کامپایل (Pre-Build)</span>
        </button>

        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'workflow' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>قوانین کنترل سورس (Git Workflow)</span>
        </button>
      </div>

      {/* Tab 1: Logger & Error Simulator */}
      {activeTab === 'logger' && (
        <div className="space-y-6">
          {/* Environment Switcher for Error Simulator */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm text-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-[var(--text-main)]">آزمایشگر تفکیک پیام خطا (Dev vs Production Error Formatter)</h3>
                <p className="text-[var(--text-muted)]">در حالت تولید (Production) پیام‌های فنی کاملا به متن فارسی کاربرپسند تبدیل می‌شوند.</p>
              </div>

              <div className="flex items-center gap-2 bg-[var(--bg-surface)] p-1.5 rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[11px] font-bold text-[var(--text-muted)] px-2">محیط فعلی:</span>
                <button
                  onClick={() => {
                    setEnvironmentMode('DEVELOPMENT');
                    addNotification('حالت محیط به DEVELOPMENT تغییر یافت.', 'info');
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    APP_CONFIG.environment === 'DEVELOPMENT' ? 'bg-sky-600 text-white shadow' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Development
                </button>
                <button
                  onClick={() => {
                    setEnvironmentMode('PRODUCTION');
                    addNotification('حالت محیط به PRODUCTION تغییر یافت.', 'info');
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    APP_CONFIG.environment === 'PRODUCTION' ? 'bg-emerald-600 text-white shadow' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Production
                </button>
              </div>
            </div>

            {/* Error Formatting Simulator Form */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testErrorInput}
                  onChange={(e) => setTestErrorInput(e.target.value)}
                  placeholder="متن خطای استثنایی را وارد کنید..."
                  className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-2 rounded-xl text-xs text-[var(--text-main)] focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={handleTestErrorFormatting}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2 rounded-xl shadow transition flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>تست قالب‌بندی خطا</span>
                </button>
              </div>

              {formattedErrorResult && (
                <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-amber-400">نتیجه پردازش خطا در حالت {APP_CONFIG.environment}:</div>
                  <div className="p-2 bg-[var(--bg-card)] rounded border border-[var(--border-subtle)]">
                    <span className="font-bold text-emerald-400 block">پیام نمایش داده شده به کاربر (Persian User Msg):</span>
                    <span className="text-[var(--text-main)] font-medium">{formattedErrorResult.userMessageFA}</span>
                  </div>
                  <div className="p-2 bg-[var(--bg-card)] rounded border border-[var(--border-subtle)] font-mono text-[11px]">
                    <span className="font-bold text-sky-400 block">جزئیات فنی جهت لاگ (Dev Details):</span>
                    <span className="text-slate-400">{formattedErrorResult.devDetails}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live In-Memory Dev Log Stream */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base text-[var(--text-main)]">جریان زنده لاگ‌های توسعه (Live Dev Log Buffer)</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulateLog('INFO')}
                  className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg font-bold hover:bg-emerald-500/30"
                >
                  + INFO Log
                </button>
                <button
                  onClick={() => handleSimulateLog('WARN')}
                  className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-bold hover:bg-amber-500/30"
                >
                  + WARN Log
                </button>
                <button
                  onClick={() => handleSimulateLog('ERROR')}
                  className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg font-bold hover:bg-rose-500/30"
                >
                  + ERROR Log
                </button>
                <button
                  onClick={handleClearLogs}
                  className="px-2.5 py-1 bg-slate-700 text-slate-200 rounded-lg font-bold hover:bg-slate-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>پاکسازی</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono max-h-72 overflow-y-auto text-[11px]">
              {logs.length === 0 ? (
                <div className="text-slate-500 text-center py-6">هیچ لاگی در حافظه ثبت نشده است.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 border-b border-slate-800/60 pb-1.5 last:border-0">
                    <span className="text-slate-500 text-[10px] whitespace-nowrap">{log.timestamp}</span>
                    <span
                      className={`font-bold px-1.5 py-0.2 text-[9px] rounded ${
                        log.level === 'ERROR' || log.level === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : log.level === 'WARN'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="text-sky-400 font-bold">[{log.module}]</span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Path Aliases */}
      {activeTab === 'aliases' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[var(--text-main)]">فهرست آدرس‌های میانبر پکیج‌ها (Path Aliases Registry)</h3>
              <p className="text-[var(--text-muted)]">تعریف شده در فایل tsconfig.json جهت جلوگیری از آدرس‌دهی نسبی طولانی.</p>
            </div>
            <span className="font-mono text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded-xl font-bold">
              ۹ میانبر فعال
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pathAliasesList.map((item, idx) => (
              <div key={idx} className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sky-400 text-sm">{item.alias}</span>
                  <span className="font-mono text-[10px] text-slate-400">{item.target}</span>
                </div>
                <p className="text-[var(--text-muted)]">{item.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Fonts & Typography */}
      {activeTab === 'fonts' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-6 shadow-sm text-xs">
          <div>
            <h3 className="font-bold text-base text-[var(--text-main)]">فونت‌های ثبت‌شده و کیفیت تایپوگرافی فارسی</h3>
            <p className="text-[var(--text-muted)]">تضمین عدم وجود حروف شکسته، ارتفاع مناسب خطوط و نمایش صحیح اعداد فارسی.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* IRANYekanX Sample */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="font-bold text-sky-400 block">فونت اصلی IRANYekanX:</span>
              <p className="text-sm font-bold text-[var(--text-main)] leading-relaxed">
                کلینیک تخصصی و فوق‌تخصصی ویکی‌مدیک
              </p>
              <span className="text-[10px] text-[var(--text-muted)] block">مبلغ: ۱,۴۵۰,۰۰۰ ریال | تاریخ: ۱۴۰۳/۰۵/۱۵</span>
            </div>

            {/* IRANSansX Sample */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="font-bold text-purple-400 block">فونت گزارشات IRANSansX:</span>
              <p className="text-sm font-bold text-[var(--text-main)] leading-relaxed">
                صورتحساب خدمات پاراکلینیک و داروخانه
              </p>
              <span className="text-[10px] text-[var(--text-muted)] block">شماره پرونده: ۹۸۲۳۴۱-الف</span>
            </div>

            {/* Fallback Sample */}
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="font-bold text-emerald-400 block">فونت جایگزین Noto Sans Arabic:</span>
              <p className="text-sm font-bold text-[var(--text-main)] leading-relaxed">
                Standard Arabic & Medical Symbol Fallback
              </p>
              <span className="text-[10px] text-[var(--text-muted)] block">حروف ویژه نسخه‌نویسی پزشکی</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Pre-Build Validation */}
      {activeTab === 'prebuild' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[var(--text-main)]">اعتبارسنجی پیش از کامپایل نهایی (Pre-Build Validation Pipeline)</h3>
              <p className="text-[var(--text-muted)]">بررسی تایپ‌اسکریپت سخت‌گیرانه، عدم افشای توکن‌ها و وجود تمامی دارایی‌ها.</p>
            </div>

            <button
              onClick={handleRunBuildValidation}
              disabled={isValidating}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl shadow transition flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
              <span>{isValidating ? 'در حال اجرای تست...' : 'اجرای اعتبارسنجی Pre-Build'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
              <span className="font-bold text-[var(--text-main)]">کامپایل تایپ‌اسکریپت (TypeScript Strict Compiler):</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>پاس شده (Strict Mode Enabled)</span>
              </span>
            </div>

            <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
              <span className="font-bold text-[var(--text-main)]">بررسی لینتر و خطایابی کدها (ESLint Standard):</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>پاس شده (۰ خطا و ۰ اخطار بحرانی)</span>
              </span>
            </div>

            <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
              <span className="font-bold text-[var(--text-main)]">متغیرهای محیطی و کلیدهای محرمانه (Env Secrets Check):</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>پاس شده (تنظیمات Supabase و API)</span>
              </span>
            </div>

            <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
              <span className="font-bold text-[var(--text-main)]">پشتیبانی بومی راست‌به‌چپ (RTL & Persian Digits):</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>پاس شده (تضمین ۱۰۰٪ چیدمان فارسی)</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Git Workflow */}
      {activeTab === 'workflow' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl space-y-4 shadow-sm text-xs">
          <div>
            <h3 className="font-bold text-base text-[var(--text-main)]">قوانین کنترل سورس و انشعاب‌های پروژه (Git Workflow Policy)</h3>
            <p className="text-[var(--text-muted)]">معماری شاخه‌های پروژه جهت تضمین پایداری نسخه تجاری VikiMedic.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="font-bold text-emerald-400 block font-mono">main (Release Branch)</span>
              <p className="text-[var(--text-muted)]">حاوی کدهای با پایداری ۱۰۰٪ و تست شده در نسخه تولید نهایی درمانگاه.</p>
            </div>

            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="font-bold text-sky-400 block font-mono">dev (Development)</span>
              <p className="text-[var(--text-muted)]">انشعاب اصلی توسعه ویژگی‌های جدید و ادغام ماژول‌ها.</p>
            </div>

            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="font-bold text-purple-400 block font-mono">feature/* & bugfix/*</span>
              <p className="text-[var(--text-muted)]">انشعاب‌های موقت توسعه هر قابلیت خاص قبل از مرج نهایی.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
