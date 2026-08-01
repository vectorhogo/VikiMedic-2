/**
 * VikiMedic v2 - Module Integrity Checker Panel (Phase 00.5)
 * Clean Architecture Layer: Presentation / Settings Components
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sliders,
  Trash2,
  Layers,
  Cpu,
  HardDrive,
  Clock,
  Info,
  Server,
  Terminal,
  ShieldX,
  Power,
} from 'lucide-react';
import { ModuleIntegrityService } from '../../../infrastructure/moduleIntegrityService';
import {
  ModuleMetadata,
  ModuleHealthStatus,
  ModuleIntegrityEvent,
  StartupIntegrityReport,
} from '../../../domain/moduleIntegrityTypes';

export const ModuleIntegrityPanel: React.FC = () => {
  const [modules, setModules] = useState<ModuleMetadata[]>([]);
  const [events, setEvents] = useState<ModuleIntegrityEvent[]>([]);
  const [report, setReport] = useState<StartupIntegrityReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ESSENTIAL' | 'ISSUES' | 'DISABLED'>('ALL');
  const [selectedModule, setSelectedModule] = useState<ModuleMetadata | null>(null);
  const [activeTab, setActiveTab] = useState<'MODULES' | 'LOGS' | 'DEPENDENCIES'>('MODULES');

  // Load state and subscribe to changes
  const refreshData = () => {
    const currentModules = ModuleIntegrityService.getModules();
    setModules(currentModules);
    setEvents(ModuleIntegrityService.getEventLogs());
  };

  useEffect(() => {
    refreshData();
    // Run initial startup check report
    const startupRep = ModuleIntegrityService.runStartupValidation();
    setReport(startupRep);
    setModules(startupRep.modules);

    const unsubscribe = ModuleIntegrityService.subscribe(() => {
      refreshData();
    });

    return () => unsubscribe();
  }, []);

  const handleRunFullCheck = () => {
    const rep = ModuleIntegrityService.runStartupValidation();
    setReport(rep);
    setModules(rep.modules);
    setEvents(ModuleIntegrityService.getEventLogs());
  };

  const handleExportDiagnostics = () => {
    ModuleIntegrityService.exportDiagnosticPackageJSON();
  };

  const handleRestartModule = (modId: string) => {
    ModuleIntegrityService.restartModule(modId);
    refreshData();
  };

  const handleReloadConfig = (modId: string) => {
    ModuleIntegrityService.reloadConfig(modId);
    refreshData();
  };

  const handleResetCache = (modId: string) => {
    ModuleIntegrityService.resetModuleCache(modId);
    refreshData();
  };

  const handleToggleModule = (modId: string) => {
    try {
      ModuleIntegrityService.toggleEnableModule(modId);
      refreshData();
    } catch (e: any) {
      alert(e.message || 'امکان غیرفعال‌سازی این ماژول وجود ندارد.');
    }
  };

  const handleSimulateError = (modId: string) => {
    ModuleIntegrityService.reportModuleError({
      moduleId: modId,
      errorType: 'SIMULATED_TEST_EXCEPTION',
      errorMessageFa: 'خطای شبیه‌سازی‌شده جهت بررسی خودترمیمی ماژول.',
    });
    refreshData();
  };

  // Filtered modules
  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      const matchesSearch =
        m.nameFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'ESSENTIAL') return m.isEssential;
      if (statusFilter === 'DISABLED') return m.status === 'Disabled';
      if (statusFilter === 'ISSUES')
        return m.status === 'Warning' || m.status === 'Degraded' || m.status === 'Failed' || m.status === 'Recovering';

      return true;
    });
  }, [modules, searchQuery, statusFilter]);

  // Overall statistics
  const totalCount = modules.length;
  const healthyCount = modules.filter((m) => m.status === 'Healthy').length;
  const degradedCount = modules.filter((m) => m.status === 'Degraded' || m.status === 'Warning').length;
  const failedCount = modules.filter((m) => m.status === 'Failed').length;
  const disabledCount = modules.filter((m) => m.status === 'Disabled').length;

  const avgHealthScore = useMemo(() => {
    if (modules.length === 0) return 100;
    const total = modules.reduce((acc, m) => acc + (m.status === 'Disabled' ? 100 : m.healthScore), 0);
    return Math.round(total / modules.length);
  }, [modules]);

  const totalMemory = useMemo(() => {
    return modules.reduce((acc, m) => acc + m.memoryUsageMb, 0).toFixed(1);
  }, [modules]);

  const getStatusBadge = (status: ModuleHealthStatus) => {
    switch (status) {
      case 'Healthy':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>سالم (Healthy)</span>
          </span>
        );
      case 'Warning':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>هشدار (Warning)</span>
          </span>
        );
      case 'Recovering':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1.5 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>در حال بازیابی (Recovering)</span>
          </span>
        );
      case 'Degraded':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>محدود (Degraded)</span>
          </span>
        );
      case 'Disabled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20 flex items-center gap-1.5">
            <Power className="w-3.5 h-3.5" />
            <span>غیرفعال (Disabled)</span>
          </span>
        );
      case 'Failed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            <span>خطا (Failed)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-emerald-900/90 via-[#283F24] to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-emerald-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white">
                  پایش پایداری و سلامت ماژول‌ها (Module Integrity Checker)
                </h2>
                <p className="text-xs text-emerald-100/80 font-medium">
                  سیستم خودکار پایش سلامت، عیب‌یابی خودکار، ایزوله‌سازی خطا و بازیابی ماژول‌های ۲۸ گانه نرم‌افزار
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch lg:self-auto justify-end">
            <button
              onClick={handleRunFullCheck}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/20 transition active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>سنجش کامل سلامت (Run Diagnostics)</span>
            </button>

            <button
              onClick={handleExportDiagnostics}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-md transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>خروجی بسته عیب‌یابی (Export Diagnostics)</span>
            </button>
          </div>
        </div>

        {/* Safe Mode Advisory Banner */}
        {report?.recommendSafeMode && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-100 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
            <span>
              <strong>هشدار پایداری:</strong> بیش از ۳ ماژول دارای خطای جدی هستند. فعال‌سازی حالت امن (Safe Mode) جهت حفظ داده‌های مالی و پزشکی پیشنهاد می‌شود.
            </span>
          </div>
        )}
      </div>

      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Overall Health Score */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-sm space-y-1">
          <div className="text-[11px] text-[var(--text-muted)] font-bold flex items-center justify-between">
            <span>امتیاز پایداری کل</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {avgHealthScore}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                avgHealthScore >= 90
                  ? 'bg-emerald-500'
                  : avgHealthScore >= 70
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${avgHealthScore}%` }}
            />
          </div>
        </div>

        {/* Total Registered Modules */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-sm space-y-1">
          <div className="text-[11px] text-[var(--text-muted)] font-bold flex items-center justify-between">
            <span>کل ماژول‌ها</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-[var(--text-main)] font-mono">{totalCount}</div>
          <div className="text-[10px] text-[var(--text-muted)]">۲۸ ماژول هسته ثبت‌شده</div>
        </div>

        {/* Healthy Modules */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-sm space-y-1">
          <div className="text-[11px] text-[var(--text-muted)] font-bold flex items-center justify-between">
            <span>ماژول‌های سالم</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {healthyCount}
          </div>
          <div className="text-[10px] text-emerald-600/80 font-bold">آماده خدمت‌رسانی</div>
        </div>

        {/* Degraded / Issues */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-sm space-y-1">
          <div className="text-[11px] text-[var(--text-muted)] font-bold flex items-center justify-between">
            <span>دارای هشدار/محدود</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {degradedCount}
          </div>
          <div className="text-[10px] text-amber-600/80 font-bold">عملکرد در حالت محدود</div>
        </div>

        {/* Failed Modules */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-sm space-y-1">
          <div className="text-[11px] text-[var(--text-muted)] font-bold flex items-center justify-between">
            <span>ناموفق (Failed)</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {failedCount}
          </div>
          <div className="text-[10px] text-rose-600/80 font-bold">نیازمند بازیابی دستی</div>
        </div>

        {/* Total Memory Allocation */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-sm space-y-1">
          <div className="text-[11px] text-[var(--text-muted)] font-bold flex items-center justify-between">
            <span>مصرف حافظه رم</span>
            <HardDrive className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-[var(--text-main)] font-mono">{totalMemory} MB</div>
          <div className="text-[10px] text-[var(--text-muted)]">تخصیص موقت در مرورگر</div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
        <button
          onClick={() => setActiveTab('MODULES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'MODULES'
              ? 'bg-[#283F24] text-white shadow-md'
              : 'bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>شناسنامه و وضعیت ماژول‌ها ({modules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'LOGS'
              ? 'bg-[#283F24] text-white shadow-md'
              : 'bg-[var(--bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>سوابق و وقایع سیستم ({events.length})</span>
        </button>
      </div>

      {/* TAB 1: MODULES GRID / LIST */}
      {activeTab === 'MODULES' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در نام ماژول، شناسه یا وابسته..."
                className="w-full pr-9 pl-3 py-1.5 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#283F24]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === 'ALL'
                    ? 'bg-[#283F24] text-white'
                    : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                همه ({modules.length})
              </button>

              <button
                onClick={() => setStatusFilter('ESSENTIAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === 'ESSENTIAL'
                    ? 'bg-[#283F24] text-white'
                    : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                ضروری و حیاتی ({modules.filter((m) => m.isEssential).length})
              </button>

              <button
                onClick={() => setStatusFilter('ISSUES')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === 'ISSUES'
                    ? 'bg-amber-600 text-white'
                    : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                دارای هشدار / خطا ({modules.filter((m) => m.status !== 'Healthy' && m.status !== 'Disabled').length})
              </button>

              <button
                onClick={() => setStatusFilter('DISABLED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === 'DISABLED'
                    ? 'bg-slate-700 text-white'
                    : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                غیرفعال ({modules.filter((m) => m.status === 'Disabled').length})
              </button>
            </div>
          </div>

          {/* MODULES TABLE */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-[var(--bg-app)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-bold">
                  <tr>
                    <th className="p-3">عنوان و شناسه ماژول</th>
                    <th className="p-3 text-center">نوع</th>
                    <th className="p-3 text-center">وضعیت سلامت</th>
                    <th className="p-3 text-center">امتیاز (Health)</th>
                    <th className="p-3 text-center">زمان پاسخ / رم</th>
                    <th className="p-3">وابستگی‌ها (Dependencies)</th>
                    <th className="p-3 text-center">عملیات مدیریت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredModules.map((mod) => (
                    <tr key={mod.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/40 transition">
                      <td className="p-3">
                        <div className="font-bold text-[var(--text-main)]">{mod.nameFa}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono">
                          {mod.id} • v{mod.version}
                        </div>
                        {mod.lastError && (
                          <div className="mt-1 text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                            اشکال: {mod.lastError}
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        {mod.isEssential ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
                            حیاتی (Essential)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-500/10 text-slate-500 border border-slate-500/20">
                            جانبی (Standard)
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-center">{getStatusBadge(mod.status)}</td>

                      <td className="p-3 text-center">
                        <div className="font-mono font-bold">{mod.healthScore}%</div>
                        {mod.recoveryAttempts > 0 && (
                          <div className="text-[9px] text-amber-600 font-bold">
                            تلاش بازیابی: {mod.recoveryAttempts}
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-center font-mono text-[11px] text-[var(--text-muted)]">
                        <div>{mod.responseTimeMs} ms</div>
                        <div>{mod.memoryUsageMb} MB</div>
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {mod.dependencies.length > 0 ? (
                            mod.dependencies.map((depId) => {
                              const depMod = modules.find((m) => m.id === depId);
                              const isDepOk = depMod && depMod.status !== 'Failed' && depMod.status !== 'Disabled';
                              return (
                                <span
                                  key={depId}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                                    isDepOk
                                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                      : 'bg-rose-500/20 text-rose-600 border-rose-500/30 font-bold'
                                  }`}
                                  title={depMod?.nameFa || depId}
                                >
                                  {depId}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-[10px] text-[var(--text-muted)]">بدون وابستگی</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleRestartModule(mod.id)}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition"
                            title="راه‌اندازی مجدد (Restart)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleReloadConfig(mod.id)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition"
                            title="بازخوانی تنظیمات (Reload Config)"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleResetCache(mod.id)}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition"
                            title="تخلیه کش (Reset Cache)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleSimulateError(mod.id)}
                            className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 transition"
                            title="شبیه‌سازی خطای آزمایشی"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>

                          {!mod.isEssential && (
                            <button
                              onClick={() => handleToggleModule(mod.id)}
                              className={`p-1.5 rounded-lg transition ${
                                mod.status === 'Disabled'
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600'
                                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600'
                              }`}
                              title={mod.status === 'Disabled' ? 'فعال‌سازی ماژول' : 'غیرفعال‌سازی ماژول'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM EVENT LOGS */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[var(--text-main)]">
              لیست وقایع ثبت‌شده پایش سلامت سیستم ({events.length} مورد)
            </div>
            <button
              onClick={() => ModuleIntegrityService.clearLogs()}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>پاکسازی لیست سوابق</span>
            </button>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden shadow-sm">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-[var(--bg-app)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-bold sticky top-0">
                  <tr>
                    <th className="p-3">زمان ثبت</th>
                    <th className="p-3">ماژول</th>
                    <th className="p-3 text-center">سطح</th>
                    <th className="p-3">نوع رخداد / شرح</th>
                    <th className="p-3">نتیجه بازیابی خودکار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[var(--text-muted)]">
                        هیچ رویداد خطایی در سوابق سیستم ثبت نشده است.
                      </td>
                    </tr>
                  ) : (
                    events.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/40">
                        <td className="p-3 font-mono text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                          {evt.timestamp}
                        </td>
                        <td className="p-3 font-bold text-[var(--text-main)] whitespace-nowrap">
                          {evt.moduleNameFa}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          {evt.severity === 'CRITICAL' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500 text-white font-bold">
                              CRITICAL
                            </span>
                          ) : evt.severity === 'ERROR' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-600 font-bold border border-rose-500/20">
                              ERROR
                            </span>
                          ) : evt.severity === 'WARNING' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">
                              WARNING
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-600 font-bold">
                              INFO
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            [{evt.errorType}]
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">{evt.messageFa}</div>
                        </td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">
                          {evt.recoveryResult || 'ارزیابی خودکار انجام گردید.'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
