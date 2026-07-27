/**
 * VikiMedic v2 - Architecture & Coding Standards Explorer Module
 * Clean Architecture Layer: Presentation
 *
 * Interactive module displaying Clean Architecture boundaries, Universal Component Registry,
 * Design Tokens Matrix, Live Structured System Logs, Architecture Decision Records (ADRs),
 * and Definition of Done (DoD) Quality Checklist.
 */

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Layers,
  Database,
  Code2,
  FileCheck2,
  BookOpen,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  RotateCcw,
  Trash2,
  Sparkles,
  Download,
  Search,
  Server,
  Key,
} from 'lucide-react';
import { DESIGN_TOKENS } from '../../domain/designTokens';
import { UNIVERSAL_COMPONENT_REGISTRY } from '../../domain/componentRegistry';
import { logger, LogEntry } from '../../infrastructure/loggerService';
import { useClinic } from '../../application/ClinicContext';

export const ArchitectureModule: React.FC = () => {
  const { addNotification } = useClinic();
  const [activeSection, setActiveSection] = useState<'overview' | 'registry' | 'tokens' | 'logs' | 'adrs' | 'dod'>('overview');

  // Logs state
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logFilter, setLogFilter] = useState<string>('ALL');

  useEffect(() => {
    setLogs(logger.getLogs());
    const unsubscribe = logger.subscribe((updated) => setLogs(updated));
    return () => unsubscribe();
  }, []);

  const handleTestLog = () => {
    logger.info('ArchitectureModule', 'TEST_EVENT', 'تست ثبت لوگ ساختاریافته معماری به ثبت رسید.', 'ADMIN_TEST', {
      timestamp: new Date().toISOString(),
      status: 'VERIFIED',
    });
    addNotification('رویداد تست لوگ با موفقیت در لایه Infrastructure ثبت گردید.', 'success');
  };

  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'ALL') return true;
    return l.level === logFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-purple-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide uppercase">
              Phase 01 - Part 03
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
              Clean Architecture Standards
            </span>
          </div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Boxes className="w-6 h-6 text-purple-400" />
            <span>معماری نرم‌افزار و استانداردهای کدنویسی (Architecture & Standards)</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            مستندات استاندارد Clean Architecture، سامانه کامپوننت‌های عمومی، موتور Design Token، لاگر ساختاریافته و چک‌لیست کیفیت DoD.
          </p>
        </div>

        <button
          onClick={handleTestLog}
          className="z-10 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2"
        >
          <Terminal className="w-4 h-4" />
          <span>ثبت لوگ تست در Infrastructure</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeSection === 'overview' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>مرور لایه‌ها (Clean Layers)</span>
        </button>

        <button
          onClick={() => setActiveSection('registry')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeSection === 'registry' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>ثبت کامپوننت‌های عمومی (Component Registry)</span>
        </button>

        <button
          onClick={() => setActiveSection('tokens')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeSection === 'tokens' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>موتور Design Tokens</span>
        </button>

        <button
          onClick={() => setActiveSection('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeSection === 'logs' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>لاگر سیستم (Structured Logger)</span>
        </button>

        <button
          onClick={() => setActiveSection('adrs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeSection === 'adrs' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>تصمیمات معماری (ADRs)</span>
        </button>

        <button
          onClick={() => setActiveSection('dod')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeSection === 'dod' ? 'bg-[var(--accent-primary)] text-white shadow-md' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>تعریف تمامیت (Definition of Done)</span>
        </button>
      </div>

      {/* Section 1: Clean Architecture Layers */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Layer 1: Presentation */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                Layer 1
              </span>
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-extrabold text-sm text-[var(--text-main)]">Presentation Layer</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              شامل کامپوننت‌های React، صفحات ماژول‌ها، نوار عنوان دسکتاپ، منوها و ThemeContext.
            </p>
            <div className="pt-2 text-[11px] font-mono text-blue-400 font-bold">src/presentation/*</div>
          </div>

          {/* Layer 2: Application */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                Layer 2
              </span>
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-extrabold text-sm text-[var(--text-main)]">Application Layer</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              مدیریت جریان‌های کاری، ClinicContext، مدیریت نوبت‌ها، تسویه مالی و حالت‌های برنامه.
            </p>
            <div className="pt-2 text-[11px] font-mono text-emerald-400 font-bold">src/application/*</div>
          </div>

          {/* Layer 3: Domain */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full">
                Layer 3
              </span>
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-extrabold text-sm text-[var(--text-main)]">Domain Layer</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              موجودیت‌های اصلی کسب‌وکار، قوانین نقش‌ها و دسترسی‌ها، Design Tokens و Component Registry.
            </p>
            <div className="pt-2 text-[11px] font-mono text-purple-400 font-bold">src/domain/*</div>
          </div>

          {/* Layer 4: Infrastructure */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                Layer 4
              </span>
              <Database className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-extrabold text-sm text-[var(--text-main)]">Infrastructure Layer</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              مخازن داده (Repositories)، صف آفلاین، لاگر ساختاریافته، سرویس خروجی اکسل و ارتباط Supabase.
            </p>
            <div className="pt-2 text-[11px] font-mono text-amber-400 font-bold">src/infrastructure/*</div>
          </div>
        </div>
      )}

      {/* Section 2: Component Registry */}
      {activeSection === 'registry' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base mb-0.5">ثبت کامپوننت‌های عمومی (Universal Component Registry)</h3>
              <p className="text-xs text-[var(--text-muted)]">ثبت و کنترل ویژگی‌های کامپوننت‌های قابل استفاده مجدد.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
              {UNIVERSAL_COMPONENT_REGISTRY.length} کامپوننت ثبت‌شده
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {UNIVERSAL_COMPONENT_REGISTRY.map((comp) => (
              <div key={comp.id} className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-purple-400">{comp.name}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full uppercase font-bold">
                      {comp.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">v{comp.version}</span>
                </div>
                <p className="text-xs text-[var(--text-main)] font-medium leading-relaxed">{comp.purposeFA}</p>
                <div className="text-[11px] text-[var(--text-muted)] space-y-1">
                  <div><strong className="text-[var(--text-main)]">Props ورودی:</strong> {comp.acceptedProps.join(', ')}</div>
                  <div><strong className="text-[var(--text-main)]">قوانین استفاده:</strong> {comp.usageRulesFA.join(' • ')}</div>
                  <div><strong className="text-[var(--text-main)]">دسترس‌پذیری (A11y):</strong> {comp.accessibilityRulesFA.join(' • ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Design Token Engine */}
      {activeSection === 'tokens' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="font-bold text-base mb-1">موتور Design Tokens متمرکز</h3>
            <p className="text-xs text-[var(--text-muted)]">مقادیر ثابت رنگ‌ها، تایپوگرافی، فواصل، شعاع و انیمیشن‌ها.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="font-bold text-blue-400 block">فواصل baseline (4px grid)</span>
              <div className="font-mono space-y-1 text-[var(--text-muted)]">
                <div>xs: {DESIGN_TOKENS.spacing.xs}</div>
                <div>sm: {DESIGN_TOKENS.spacing.sm}</div>
                <div>md: {DESIGN_TOKENS.spacing.md}</div>
                <div>lg: {DESIGN_TOKENS.spacing.lg}</div>
              </div>
            </div>

            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="font-bold text-emerald-400 block">شعاع گوشه‌ها (Radius)</span>
              <div className="font-mono space-y-1 text-[var(--text-muted)]">
                <div>sm: {DESIGN_TOKENS.radius.sm}</div>
                <div>md: {DESIGN_TOKENS.radius.md}</div>
                <div>lg: {DESIGN_TOKENS.radius.lg}</div>
                <div className="text-[10px] text-emerald-300 pt-1 font-sans">{DESIGN_TOKENS.radius.nestedRule}</div>
              </div>
            </div>

            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-2">
              <span className="font-bold text-purple-400 block">سرعت انیمیشن‌ها</span>
              <div className="font-mono space-y-1 text-[var(--text-muted)]">
                <div>fast: {DESIGN_TOKENS.animations.fast}</div>
                <div>normal: {DESIGN_TOKENS.animations.normal}</div>
                <div>slow: {DESIGN_TOKENS.animations.slow}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Structured Logger */}
      {activeSection === 'logs' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base mb-0.5">لاگر ساختاریافته سیستم (Structured Logger)</h3>
              <p className="text-xs text-[var(--text-muted)]">ثبت زنده رویدادهای زیرساخت همراه با زمان، نقش کاربر، ماژول و نتیجه.</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs rounded-xl px-3 py-1.5 text-[var(--text-main)]"
              >
                <option value="ALL">همه سطوح لوگ</option>
                <option value="INFO">فقط INFO</option>
                <option value="WARN">فقط WARN</option>
                <option value="ERROR">فقط ERROR</option>
                <option value="CRITICAL">فقط CRITICAL</option>
              </select>

              <button
                onClick={() => {
                  logger.clearLogs();
                  addNotification('تمامی لوگ‌های زیرساخت پاکسازی شدند.', 'info');
                }}
                className="p-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-xl transition"
                title="پاکسازی لوگ‌ها"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden font-mono text-xs max-h-96 overflow-y-auto bg-[var(--bg-surface)] p-3 space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)] font-sans">هیچ لوگی ثبت نشده است.</div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-right space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span
                      className={`font-bold px-2 py-0.2 rounded ${
                        log.level === 'CRITICAL' || log.level === 'ERROR'
                          ? 'bg-rose-500/20 text-rose-400'
                          : log.level === 'WARN'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="text-[var(--text-muted)]">{new Date(log.timestamp).toLocaleTimeString('fa-IR')}</span>
                  </div>
                  <div className="font-sans font-bold text-[var(--text-main)]">
                    [{log.module}] {log.action}: {log.messageFA}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Section 5: Architecture Decision Records (ADRs) */}
      {activeSection === 'adrs' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-base mb-1">تصمیمات ثبت‌شده معماری (Architecture Decision Records)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
              <span className="font-mono font-bold text-purple-400 block">ADR 0001: Clean Architecture Layering</span>
              <p className="text-[var(--text-muted)]">جداسازی کامل ۴ لایه Presentation, Application, Domain, Infrastructure.</p>
            </div>
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
              <span className="font-mono font-bold text-purple-400 block">ADR 0002: Repository Pattern</span>
              <p className="text-[var(--text-muted)]">استفاده از BaseRepository جهت CRUD، اعتبار سنجی و کش محلی.</p>
            </div>
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
              <span className="font-mono font-bold text-purple-400 block">ADR 0003: Centralized Design Tokens</span>
              <p className="text-[var(--text-muted)]">موتور یکپارچه متغیرهای رنگ، خط، فاصله و انیمیشن.</p>
            </div>
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl space-y-1">
              <span className="font-mono font-bold text-purple-400 block">ADR 0004: Offline-First Foundation</span>
              <p className="text-[var(--text-muted)]">قرارداد صف آفلاین جهت عملکرد بدون قطع درمانگاه.</p>
            </div>
          </div>
        </div>
      )}

      {/* Section 6: Definition of Done Checklist */}
      {activeSection === 'dod' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-base mb-1">چک‌لیست تمامیت کیفیت (Definition of Done - DoD)</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>پیروی کامل از معماری Clean Layering</span>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>پشتیبانی کامل از فونت فارسی IRANYekanX و راست‌به‌چپ RTL</span>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>سازگاری ۱۰۰٪ با تمامی تم‌های سه‌گانه (اصلی، تاریک و رز لوکس)</span>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>عدم فراخوانی مستقیم دیتابیس در لایه UI</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
