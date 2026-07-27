/**
 * VikiMedic v2 - Pre-Launch System Readiness Validation Panel
 * Clean Architecture Layer: Presentation
 * Enterprise Patch 01
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  FileText,
  Download,
  ExternalLink,
  ShieldAlert,
  BarChart2,
  Cpu,
  Database,
  Printer,
  Users,
  Check,
} from 'lucide-react';
import { useClinic, AppModule } from '../../../application/ClinicContext';
import { SystemValidationService } from '../../../infrastructure/systemValidationService';
import { ReadinessReport, ValidationItemResult } from '../../../domain/validationTypes';

interface SystemValidationPanelProps {
  onNavigateTab?: (tabKey: string) => void;
}

export const SystemValidationPanel: React.FC<SystemValidationPanelProps> = ({ onNavigateTab }) => {
  const { activeClinic, staffList, shiftConfigs, activeUser, setActiveModule, addNotification } = useClinic();

  const isAdmin = activeUser.roleCode === 'ADMIN' || activeUser.roleCode === 'SYS_ADMIN';

  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PASSED' | 'WARNING' | 'FAILED'>('ALL');

  const handleRunValidation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const result = SystemValidationService.runValidation({
        activeClinic,
        staffList,
        shiftConfigs,
        activeUser,
      });
      setReport(result);
      setIsEvaluating(false);
      addNotification(`ارزیابی آمادگی سیستم انجام شد. امتیاز نهایی: ${result.readinessScore}%`, 'info');
    }, 400);
  };

  useEffect(() => {
    // Run initial check on load
    handleRunValidation();
  }, [activeClinic, staffList.length]);

  if (!isAdmin) {
    return (
      <div className="p-8 bg-[var(--bg-surface)] border border-rose-500/30 rounded-3xl text-center space-y-4 max-w-2xl mx-auto my-12 dir-rtl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-rose-500">محدودیت دسترسی - فقط مدیر ارشد سیستم</h2>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          ارزیابی آمادگی راه‌اندازی (Pre-Launch System Validation) نیازمند داشتن مجوز مدیر ارشد (Administrator) است.
          حساب جاری شما ({activeUser.fullName}) سطح دسترسی کافی ندارد.
        </p>
      </div>
    );
  }

  const handleOpenRelated = (item: ValidationItemResult) => {
    if (item.targetModule) {
      setActiveModule(item.targetModule as AppModule);
    }
    if (item.targetTab && onNavigateTab) {
      onNavigateTab(item.targetTab);
    }
  };

  const filteredItems = report?.items.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  return (
    <div className="space-y-6 dir-rtl animate-in fade-in duration-150">
      {/* Top Banner & Main Action Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-blue-500/30 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-right">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2.5 py-0.5 rounded-lg text-[10px] font-bold font-mono">
              Enterprise Patch 01
            </span>
            <span className="text-xs text-slate-300">ارزیابی آمادگی پیش از راه‌اندازی</span>
          </div>
          <h2 className="text-xl font-black text-white">سامانه ارزیابی آمادگی راه‌اندازی کلینیک (Pre-Launch Check)</h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            سنجش خودکار ۱۴ معیار حیاتی کلینیک شامل پروفایل، پرسنل موظف، شیفت‌ها، پایگاه داده محلی، بیمه‌ها و سخت‌افزار قبل از شروع نوبت‌دهی رسمی.
          </p>
        </div>

        {/* Large Action Button */}
        <button
          onClick={handleRunValidation}
          disabled={isEvaluating}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-600/30 border border-blue-400/40 flex items-center gap-3 text-sm shrink-0 transition active:scale-95"
        >
          <RefreshCw className={`w-5 h-5 ${isEvaluating ? 'animate-spin' : ''}`} />
          <span>{isEvaluating ? 'در حال بررسی ۱۴ معیار...' : 'اجرای ارزیابی آمادگی سیستم'}</span>
        </button>
      </div>

      {/* Score Overview Gauge & Statistics */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Readiness Score Card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-sm flex items-center justify-between col-span-1 md:col-span-1">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[var(--text-muted)]">امتیاز آمادگی سیستم</span>
              <div className="text-3xl font-black font-mono text-emerald-500">{report.readinessScore}%</div>
              <span className="text-[10px] text-[var(--text-muted)] block">
                {report.readinessScore >= 90
                  ? 'آماده راه‌اندازی عالی'
                  : report.readinessScore >= 70
                  ? 'نیازمند تکمیل هشدارها'
                  : 'نیازمند رفع خطاهای بحرانی'}
              </span>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-slate-700/20 border-t-emerald-500 animate-spin" />
              <ShieldCheck className="w-7 h-7 text-emerald-500 absolute" />
            </div>
          </div>

          {/* Checks Breakdown Cards */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[var(--text-muted)] font-bold">تست‌های قبول شده</span>
              <div className="text-lg font-bold text-emerald-500 font-mono">{report.passedCount} از {report.totalChecks}</div>
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[var(--text-muted)] font-bold">هشدارها (قابل بهبود)</span>
              <div className="text-lg font-bold text-amber-500 font-mono">{report.warningCount} مورد</div>
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 font-bold shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[var(--text-muted)] font-bold">خطاهای بحرانی</span>
              <div className="text-lg font-bold text-rose-500 font-mono">{report.failedCount} مورد</div>
            </div>
          </div>
        </div>
      )}

      {/* Export Toolbar & Status Filter Tabs */}
      {report && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterStatus === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              همه ({report.totalChecks})
            </button>
            <button
              onClick={() => setFilterStatus('PASSED')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterStatus === 'PASSED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              قبول شده ({report.passedCount})
            </button>
            <button
              onClick={() => setFilterStatus('WARNING')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterStatus === 'WARNING'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              هشدار ({report.warningCount})
            </button>
            <button
              onClick={() => setFilterStatus('FAILED')}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterStatus === 'FAILED'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              خطا ({report.failedCount})
            </button>
          </div>

          {/* Export Report Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => SystemValidationService.exportPrintablePDF(report)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>خروجی رسمی PDF / چاپ</span>
            </button>

            <button
              onClick={() => SystemValidationService.exportJSON(report)}
              className="bg-[var(--bg-app)] border border-[var(--border-subtle)] hover:bg-slate-800 text-[var(--text-main)] px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>خروجی JSON</span>
            </button>
          </div>
        </div>
      )}

      {/* Validation Checks Table / List */}
      <div className="space-y-3">
        {filteredItems?.map((item, idx) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border transition ${
              item.status === 'PASSED'
                ? 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-emerald-500/30'
                : item.status === 'WARNING'
                ? 'bg-amber-500/5 border-amber-500/30'
                : 'bg-rose-500/5 border-rose-500/30'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Left Title & Category */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.status === 'PASSED'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : item.status === 'WARNING'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}
                >
                  {item.status === 'PASSED' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : item.status === 'WARNING' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-[var(--text-main)]">{item.titleFa}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-mono">
                      {item.categoryFa}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.summaryFa}</p>
                </div>
              </div>

              {/* Status Badge & Related Action */}
              <div className="flex items-center gap-3 shrink-0 pr-12 md:pr-0">
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 ${
                    item.status === 'PASSED'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      : item.status === 'WARNING'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                  }`}
                >
                  {item.status === 'PASSED' && '✓ قبول'}
                  {item.status === 'WARNING' && '⚠️ هشدار قابل بهبود'}
                  {item.status === 'FAILED' && '❌ خطا'}
                </span>

                {(item.targetTab || item.targetModule) && item.status !== 'PASSED' && (
                  <button
                    onClick={() => handleOpenRelated(item)}
                    className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold px-3 py-1.5 rounded-xl transition text-xs flex items-center gap-1"
                  >
                    <span>انتقال به صفحه مربوطه</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Problem & Recommended Action Drawer for Failed/Warning */}
            {item.status !== 'PASSED' && (item.problemFa || item.actionFa) && (
              <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {item.problemFa && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-200">
                    <span className="font-bold block mb-0.5 text-[11px]">اشکال شناسایی‌شده:</span>
                    <span>{item.problemFa}</span>
                  </div>
                )}
                {item.actionFa && (
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-200">
                    <span className="font-bold block mb-0.5 text-[11px]">اقدام اصلاحی پیشنهادی:</span>
                    <span>{item.actionFa}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
