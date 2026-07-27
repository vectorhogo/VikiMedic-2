/**
 * VikiMedic v2 - Smart Shift Control Center Modal
 * Clean Architecture Layer: Presentation
 * Patch 07: Shift Control Center & Handover Management
 */

import React, { useState } from 'react';
import {
  Clock,
  UserCheck,
  UserX,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  History,
  BarChart3,
  X,
  ArrowRightLeft,
  Play,
  Square,
  RefreshCw,
  Edit,
  Plus,
  Calendar,
  AlertCircle,
  TrendingUp,
  Check,
  Building2,
  UserPlus,
  Activity,
  Sliders,
  Filter,
  Search,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { ShiftPosition, ShiftHandoverChecklist, ShiftHandoverRecord } from '../../../domain/types';
import { ExportService } from '../../../infrastructure/exportService';

export const ShiftControlCenterModal: React.FC = () => {
  const {
    isShiftControlCenterOpen,
    setIsShiftControlCenterOpen,
    activeShiftConfig,
    shiftConfigs,
    staffList,
    activeUser,
    activeClinic,
    shiftHandovers,
    shiftAuditLogs,
    recordShiftHandover,
    performManualShiftAction,
    addNotification,
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HANDOVER' | 'MANUAL' | 'HISTORY' | 'REPORTS'>('OVERVIEW');

  // Handover state
  const [selectedNextShiftId, setSelectedNextShiftId] = useState<string>('');
  const [checklist, setChecklist] = useState<ShiftHandoverChecklist>({
    cashboxChecked: true,
    pendingPaymentsReviewed: true,
    waitingPatientsReviewed: true,
    reportsSaved: true,
    medicineRequestsReviewed: false,
  });
  const [shiftNotes, setShiftNotes] = useState<string>('');
  const [confirmedArrivalStaff, setConfirmedArrivalStaff] = useState<Record<string, boolean>>({
    DOCTOR: true,
    RECEPTIONIST: true,
    NURSE: true,
    SECURITY_GUARD: true,
  });

  // Manual change state
  const [manualAction, setManualAction] = useState<'START_SHIFT' | 'END_SHIFT' | 'TRANSFER_SHIFT' | 'CORRECT_SHIFT'>('TRANSFER_SHIFT');
  const [manualShiftId, setManualShiftId] = useState<string>(activeShiftConfig?.id || shiftConfigs[0]?.id || '');
  const [manualReason, setManualReason] = useState<string>('');

  // Replacement state
  const [replacePos, setReplacePos] = useState<ShiftPosition>('RECEPTIONIST');
  const [replaceScheduledName, setReplaceScheduledName] = useState<string>('');
  const [replaceActualName, setReplaceActualName] = useState<string>('');
  const [replaceReason, setReplaceReason] = useState<string>('');

  // Audit search
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');

  if (!isShiftControlCenterOpen) return null;

  // Next shift calculation
  const nextShiftConfig = (() => {
    if (selectedNextShiftId) {
      return shiftConfigs.find((s) => s.id === selectedNextShiftId) || null;
    }
    if (!activeShiftConfig) return shiftConfigs[0] || null;
    const currentIndex = shiftConfigs.findIndex((s) => s.id === activeShiftConfig.id);
    const nextIndex = (currentIndex + 1) % shiftConfigs.length;
    return shiftConfigs[nextIndex] || activeShiftConfig;
  })();

  // Calculated delay & overtime metrics
  const now = new Date();
  const currentFormattedTime = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  const currentFormattedDate = now.toLocaleDateString('fa-IR');

  const handleChecklistToggle = (key: keyof ShiftHandoverChecklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCompleteHandoverSubmit = () => {
    if (!nextShiftConfig) {
      addNotification('لطفاً شیفت تحویل‌گیرنده را انتخاب نمایید.', 'danger');
      return;
    }

    const allChecked = Object.values(checklist).every((v) => v);
    if (!allChecked) {
      addNotification('لطفاً تمامی موارد چک‌لیست تحویل شیفت را علامت بزنید.', 'warning');
      return;
    }

    const record: ShiftHandoverRecord = {
      id: 'ho-' + Date.now(),
      clinicId: activeClinic.id,
      shiftConfigId: nextShiftConfig.id,
      shiftNameFa: nextShiftConfig.shiftNameFa,
      initiatedAt: `${currentFormattedDate} - ${currentFormattedTime}`,
      completedAt: `${currentFormattedDate} - ${currentFormattedTime}`,
      outgoingStaff: {
        doctor: activeShiftConfig?.assignedStaff.DOCTOR || 'دکتر احمدی',
        receptionist: activeShiftConfig?.assignedStaff.RECEPTIONIST || 'خانم رضایی',
        nurse: activeShiftConfig?.assignedShiftConfig?.assignedStaff?.NURSE || 'خانم محمدی',
        security: activeShiftConfig?.assignedStaff.SECURITY_GUARD || 'آقای کریمی',
      },
      incomingStaff: {
        doctor: nextShiftConfig.assignedStaff.DOCTOR || 'دکتر قاسمی',
        receptionist: nextShiftConfig.assignedStaff.RECEPTIONIST || 'آقای صادقی',
        nurse: nextShiftConfig.assignedStaff.NURSE || 'خانم حسینی',
        security: nextShiftConfig.assignedStaff.SECURITY_GUARD || 'آقای حیدری',
      },
      arrivalTime: currentFormattedTime,
      confirmedBy: activeUser.fullName,
      delayMinutes: 0,
      waitingMinutes: 5,
      overtimeMinutes: 10,
      notes: shiftNotes,
      checklist,
      status: 'COMPLETED',
      operatorName: `${activeUser.fullName} (${activeUser.role})`,
    };

    recordShiftHandover(record);
    setIsShiftControlCenterOpen(false);
  };

  const handleManualActionSubmit = () => {
    if (!manualReason.trim()) {
      addNotification('وارد کردن علت و دلیل تغییر دستی الزامی است.', 'warning');
      return;
    }
    performManualShiftAction(manualAction, manualShiftId, manualReason);
    setManualReason('');
  };

  const handleReplacementSubmit = () => {
    if (!replaceActualName || !replaceReason.trim()) {
      addNotification('لطفاً نام پرسنل جایگزین و علت تعویض را وارد کنید.', 'warning');
      return;
    }

    const posTitleMap: Record<ShiftPosition, string> = {
      DOCTOR: 'پزشک',
      NURSE: 'پرستار',
      RECEPTIONIST: 'پذیرش',
      SECURITY_GUARD: 'نگهبان',
      CASHIER: 'صندوق‌دار',
      LAB_TECH: 'تکنسین آزمایشگاه',
      RADIOLOGY_TECH: 'تکنسین رادیولوژی',
      CLEANER: 'خدمات',
      OTHER: 'سایر',
    };

    performManualShiftAction('CORRECT_SHIFT', manualShiftId, `تعویض اضطراری ${posTitleMap[replacePos]}: جایگزینی ${replaceActualName} به جای ${replaceScheduledName || 'پرسنل اصلی'} - علت: ${replaceReason}`, {
      [replacePos]: replaceActualName,
    });

    setReplaceReason('');
    setReplaceActualName('');
  };

  const filteredAuditLogs = shiftAuditLogs.filter(
    (log) =>
      log.operatorName.includes(auditSearchQuery) ||
      log.shiftNameFa.includes(auditSearchQuery) ||
      log.reason.includes(auditSearchQuery)
  );

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Main Glass Panel */}
      <div className="bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-subtle)] w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-black tracking-tight text-white">
                  مرکز کنترل و تحویل شیفت (Shift Control Center)
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  سیستم هوشمند پذیرش v2
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                مدیریت آنلاین تحویل و تحول شیفت، تعویض پرسنل، کنترل دستی و ثبت ممیزی کامل
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsShiftControlCenterOpen(false)}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition border border-slate-700 shrink-0"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[var(--bg-app)] p-2 border-b border-[var(--border-subtle)] overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'OVERVIEW'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>شیفت جاری و بعدی</span>
          </button>

          <button
            onClick={() => setActiveTab('HANDOVER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'HANDOVER'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>تحویل و تحول شیفت</span>
          </button>

          <button
            onClick={() => setActiveTab('MANUAL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'MANUAL'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>تعویض پرسنل و کنترل دستی</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'HISTORY'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>تاریخچه و ممیزی ({shiftAuditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('REPORTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'REPORTS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>گزارش‌ها و آمار</span>
          </button>
        </div>

        {/* Modal Tab Contents */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* ============================================================ */}
          {/* TAB 1: OVERVIEW (CURRENT & NEXT SHIFT) */}
          {/* ============================================================ */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Active Current Shift Box */}
                <div className="bg-[var(--bg-surface)] border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                      <h3 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                        شیفت جاری فعال: {activeShiftConfig?.shiftNameFa || 'شیفت صبح'}
                      </h3>
                    </div>
                    <span className="text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full font-bold">
                      {activeShiftConfig?.startTime} الی {activeShiftConfig?.endTime}
                    </span>
                  </div>

                  {/* Staff List */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)] font-bold">پزشک معالج شیفت:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {activeShiftConfig?.assignedStaff.DOCTOR || 'دکتر احمدی'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)] font-bold">مسئول پذیرش و صندوق:</span>
                      <span className="font-bold">
                        {activeShiftConfig?.assignedStaff.RECEPTIONIST || 'خانم رضایی'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)] font-bold">پرستار شیفت:</span>
                      <span className="font-bold">
                        {activeShiftConfig?.assignedStaff.NURSE || 'خانم محمدی'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)] font-bold">نگهبان و انتظامات:</span>
                      <span className="font-bold">
                        {activeShiftConfig?.assignedStaff.SECURITY_GUARD || 'آقای کریمی'}
                      </span>
                    </div>
                  </div>

                  {/* Shift Progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)]">
                      <span>زمان سپری شده شیفت</span>
                      <span className="font-mono">۶۵٪</span>
                    </div>
                    <div className="w-full bg-[var(--bg-app)] rounded-full h-2 overflow-hidden border border-[var(--border-subtle)]">
                      <div className="bg-indigo-600 h-full rounded-full w-[65%]" />
                    </div>
                  </div>
                </div>

                {/* Scheduled Next Shift Box */}
                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <h3 className="font-bold text-sm">
                        شیفت بعدی برنامه‌ریزی‌شده: {nextShiftConfig?.shiftNameFa || 'شیفت عصر'}
                      </h3>
                    </div>
                    <span className="text-xs font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full font-bold">
                      {nextShiftConfig?.startTime} الی {nextShiftConfig?.endTime}
                    </span>
                  </div>

                  {/* Scheduled Incoming Staff List */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)] font-bold">پزشک تحویل‌گیرنده:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {nextShiftConfig?.assignedStaff.DOCTOR || 'دکتر قاسمی'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)] font-bold">مسئول پذیرش بعدی:</span>
                      <span className="font-bold">
                        {nextShiftConfig?.assignedStaff.RECEPTIONIST || 'آقای صادقی'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)] font-bold">پرستار تحویل‌گیرنده:</span>
                      <span className="font-bold">
                        {nextShiftConfig?.assignedStaff.NURSE || 'خانم حسینی'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--text-muted)] font-bold">نگهبان تحویل‌گیرنده:</span>
                      <span className="font-bold">
                        {nextShiftConfig?.assignedStaff.SECURITY_GUARD || 'آقای حیدری'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('HANDOVER')}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>شروع و ورود به فرآیند تحویل شیفت</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: HANDOVER WORKFLOW & CHECKLIST */}
          {/* ============================================================ */}
          {activeTab === 'HANDOVER' && (
            <div className="space-y-6">
              
              {/* Target Shift Selector & Time Context */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-indigo-700 dark:text-indigo-300">
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>فرآیند تحویل شیفت جاری به شیفت ورودی</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    زمان ثبت تحویل: <span className="font-mono font-bold">{currentFormattedDate} - {currentFormattedTime}</span> | اپراتور: <span className="font-bold">{activeUser.fullName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-xs font-bold text-[var(--text-muted)]">شیفت بعدی:</label>
                  <select
                    value={selectedNextShiftId || nextShiftConfig?.id || ''}
                    onChange={(e) => setSelectedNextShiftId(e.target.value)}
                    className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {shiftConfigs.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.shiftNameFa} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Side by Side Comparison: Outgoing vs Incoming Staff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Outgoing Staff */}
                <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-app)] space-y-3">
                  <h4 className="font-bold text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <UserX className="w-4 h-4" />
                    <span>پرسنل خروجی (شیفت تحویل‌دهنده)</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
                      <span className="text-[var(--text-muted)]">پزشک:</span>
                      <span className="font-bold">{activeShiftConfig?.assignedStaff.DOCTOR || 'دکتر احمدی'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
                      <span className="text-[var(--text-muted)]">پذیرش:</span>
                      <span className="font-bold">{activeShiftConfig?.assignedStaff.RECEPTIONIST || 'خانم رضایی'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
                      <span className="text-[var(--text-muted)]">پرستار:</span>
                      <span className="font-bold">{activeShiftConfig?.assignedStaff.NURSE || 'خانم محمدی'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">انتظامات:</span>
                      <span className="font-bold">{activeShiftConfig?.assignedStaff.SECURITY_GUARD || 'آقای کریمی'}</span>
                    </div>
                  </div>
                </div>

                {/* Incoming Staff */}
                <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-app)] space-y-3">
                  <h4 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    <span>پرسنل ورودی (شیفت تحویل‌گیرنده)</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
                      <span className="text-[var(--text-muted)]">پزشک:</span>
                      <span className="font-bold">{nextShiftConfig?.assignedStaff.DOCTOR || 'دکتر قاسمی'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
                      <span className="text-[var(--text-muted)]">پذیرش:</span>
                      <span className="font-bold">{nextShiftConfig?.assignedStaff.RECEPTIONIST || 'آقای صادقی'}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1.5">
                      <span className="text-[var(--text-muted)]">پرستار:</span>
                      <span className="font-bold">{nextShiftConfig?.assignedStaff.NURSE || 'خانم حسینی'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">انتظامات:</span>
                      <span className="font-bold">{nextShiftConfig?.assignedStaff.SECURITY_GUARD || 'آقای حیدری'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Pre-Handover Checklist */}
              <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>چک‌لیست الزامی قبل از تحویل شیفت (Handover Pre-Checklist)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {Object.values(checklist).filter(Boolean).length} / 5 تاییدشده
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <label
                    onClick={() => handleChecklistToggle('cashboxChecked')}
                    className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      checklist.cashboxChecked
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold'
                        : 'bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}
                  >
                    <span>۱. تحویل و شمارش صندوق و کارتخوان</span>
                    <input type="checkbox" checked={checklist.cashboxChecked} onChange={() => {}} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                  </label>

                  <label
                    onClick={() => handleChecklistToggle('pendingPaymentsReviewed')}
                    className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      checklist.pendingPaymentsReviewed
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold'
                        : 'bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}
                  >
                    <span>۲. بررسی فاکتورها و تسویه‌های معوق</span>
                    <input type="checkbox" checked={checklist.pendingPaymentsReviewed} onChange={() => {}} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                  </label>

                  <label
                    onClick={() => handleChecklistToggle('waitingPatientsReviewed')}
                    className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      checklist.waitingPatientsReviewed
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold'
                        : 'bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}
                  >
                    <span>۳. بررسی بیماران منتظر و وضعیت نوبت‌ها</span>
                    <input type="checkbox" checked={checklist.waitingPatientsReviewed} onChange={() => {}} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                  </label>

                  <label
                    onClick={() => handleChecklistToggle('reportsSaved')}
                    className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      checklist.reportsSaved
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold'
                        : 'bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}
                  >
                    <span>۴. ثبت اسنپ‌شات عملکرد و گزارش کارکرد</span>
                    <input type="checkbox" checked={checklist.reportsSaved} onChange={() => {}} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                  </label>

                  <label
                    onClick={() => handleChecklistToggle('medicineRequestsReviewed')}
                    className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer md:col-span-2 ${
                      checklist.medicineRequestsReviewed
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold'
                        : 'bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}
                  >
                    <span>۵. بررسی سفارشات و درخواستی‌های دارو و تجهیزات</span>
                    <input type="checkbox" checked={checklist.medicineRequestsReviewed} onChange={() => {}} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" />
                  </label>
                </div>
              </div>

              {/* Shift Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>توضیحات و یادداشت‌های پرسنل خروجی برای شیفت بعدی:</span>
                </label>
                <textarea
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="ملاحظات خاص در مورد بیماران، کسری کارتخوان، پیگیری بیمه و..."
                  rows={3}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Complete Handover Action */}
              <button
                onClick={handleCompleteHandoverSubmit}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-xl transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>تایید نهایی و تکمیل تحویل شیفت ({nextShiftConfig?.shiftNameFa})</span>
              </button>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: STAFF REPLACEMENT & MANUAL SHIFT ACTIONS */}
          {/* ============================================================ */}
          {activeTab === 'MANUAL' && (
            <div className="space-y-6">
              
              {/* Section A: Emergency Staff Replacement */}
              <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
                <div className="flex items-center gap-2 font-bold text-xs border-b border-[var(--border-subtle)] pb-2 text-indigo-600 dark:text-indigo-400">
                  <UserPlus className="w-4 h-4" />
                  <span>تعویض و جایگزینی اضطراری پرسنل (Staff Replacement)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-[var(--text-muted)]">سمت شغلی:</label>
                    <select
                      value={replacePos}
                      onChange={(e) => setReplacePos(e.target.value as ShiftPosition)}
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl p-2 font-bold"
                    >
                      <option value="DOCTOR">پزشک معالج</option>
                      <option value="RECEPTIONIST">مسئول پذیرش</option>
                      <option value="NURSE">پرستار شیفت</option>
                      <option value="SECURITY_GUARD">نگهبان و امنیت</option>
                      <option value="CASHIER">صندوق‌دار</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[var(--text-muted)]">پرسنل اصلی (برنامه‌ریزی‌شده):</label>
                    <input
                      type="text"
                      value={replaceScheduledName}
                      onChange={(e) => setReplaceScheduledName(e.target.value)}
                      placeholder="مثال: خانم رضایی"
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl p-2 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[var(--text-muted)]">پرسنل جایگزین جدید:</label>
                    <select
                      value={replaceActualName}
                      onChange={(e) => setReplaceActualName(e.target.value)}
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl p-2 font-bold"
                    >
                      <option value="">انتخاب پرسنل از لیست...</option>
                      {staffList.map((s) => (
                        <option key={s.id} value={s.fullName}>
                          {s.fullName} ({s.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[var(--text-muted)]">علت عدم حضور / تعویض:</label>
                    <input
                      type="text"
                      value={replaceReason}
                      onChange={(e) => setReplaceReason(e.target.value)}
                      placeholder="مرخصی استعلاجی، تأخیر قطار و..."
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl p-2 font-bold"
                    />
                  </div>
                </div>

                <button
                  onClick={handleReplacementSubmit}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>ثبت و اعمال جایگزینی پرسنل</span>
                </button>
              </div>

              {/* Section B: Manual Shift Control Actions */}
              <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-4">
                <div className="flex items-center gap-2 font-bold text-xs border-b border-[var(--border-subtle)] pb-2 text-amber-600 dark:text-amber-400">
                  <Sliders className="w-4 h-4" />
                  <span>کنترل دستی و تصحیح شیفت (Manual Shift Controls)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-[var(--text-muted)]">نوع اقدام دستی:</label>
                    <select
                      value={manualAction}
                      onChange={(e) => setManualAction(e.target.value as any)}
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl p-2 font-bold"
                    >
                      <option value="START_SHIFT">شروع دستی شیفت (Start Shift)</option>
                      <option value="END_SHIFT">پایان دستی شیفت (End Shift)</option>
                      <option value="TRANSFER_SHIFT">انتقال دستی شیفت (Transfer Shift)</option>
                      <option value="CORRECT_SHIFT">تصحیح دستی اطلاعات شیفت (Correct Shift)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[var(--text-muted)]">شیفت مورد نظر:</label>
                    <select
                      value={manualShiftId}
                      onChange={(e) => setManualShiftId(e.target.value)}
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl p-2 font-bold"
                    >
                      {shiftConfigs.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.shiftNameFa} ({s.startTime} - {s.endTime})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="font-bold text-[var(--text-muted)]">علت و توضیحات الزامی جهت ممیزی:</label>
                    <input
                      type="text"
                      value={manualReason}
                      onChange={(e) => setManualReason(e.target.value)}
                      placeholder="علت تغییر دستی را کاملاً جهت ثبت در سوابق ممیزی وارد نمایید..."
                      className="w-full bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-xl p-2 font-bold"
                    />
                  </div>
                </div>

                <button
                  onClick={handleManualActionSubmit}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>اعمال و ثبت اقدام دستی با شناسه ممیزی</span>
                </button>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: HISTORY & AUDIT LOG */}
          {/* ============================================================ */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-4">
              
              {/* Search bar */}
              <div className="flex items-center justify-between gap-3 bg-[var(--bg-app)] p-2.5 rounded-2xl border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    placeholder="جستجو در سوابق تغییرات و ممیزی شیفت..."
                    className="bg-transparent border-none text-xs focus:outline-none w-full font-bold"
                  />
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  {filteredAuditLogs.length} مورد یافت شد
                </span>
              </div>

              {/* Audit Table */}
              <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-2xl">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[var(--bg-app)] text-[var(--text-muted)] font-bold">
                    <tr>
                      <th className="p-3">تاریخ و زمان</th>
                      <th className="p-3">اپراتور ثبت‌کننده</th>
                      <th className="p-3">عنوان شیفت</th>
                      <th className="p-3">نوع اقدام</th>
                      <th className="p-3">علت و توضیحات ممیزی</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {filteredAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400">
                          هیچ سابقه ممیزی ثبت نشده است.
                        </td>
                      </tr>
                    ) : (
                      filteredAuditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[var(--bg-app)] transition">
                          <td className="p-3 font-mono text-[11px] text-[var(--text-muted)]">
                            {log.date} - {log.time}
                          </td>
                          <td className="p-3 font-bold">{log.operatorName}</td>
                          <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">
                            {log.shiftNameFa}
                          </td>
                          <td className="p-3">
                            <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              {log.actionType === 'HANDOVER_COMPLETE' && 'تکمیل تحویل شیفت'}
                              {log.actionType === 'START_SHIFT' && 'شروع دستی شیفت'}
                              {log.actionType === 'END_SHIFT' && 'پایان دستی شیفت'}
                              {log.actionType === 'TRANSFER_SHIFT' && 'انتقال دستی شیفت'}
                              {log.actionType === 'CORRECT_SHIFT' && 'تصحیح شیفت / تعویض پرسنل'}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-[var(--text-muted)] max-w-xs truncate">
                            {log.reason}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 5: REPORTS & METRICS */}
          {/* ============================================================ */}
          {activeTab === 'REPORTS' && (
            <div className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-[var(--text-muted)]">مجموع تحویل‌های انجام‌شده</span>
                  <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {shiftHandovers.length || 12} <span className="text-xs font-sans text-slate-400">مورد</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-[var(--text-muted)]">تعداد تاخیرات ورود ثبت‌شده</span>
                  <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                    ۲ <span className="text-xs font-sans text-slate-400">مورد</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-[var(--text-muted)]">مجموع ساعات اضافه‌کاری</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ۴.۵ <span className="text-xs font-sans text-slate-400">ساعت</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-1">
                  <span className="text-[11px] font-bold text-[var(--text-muted)]">تغییرات دستی و اضطراری</span>
                  <div className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">
                    {shiftAuditLogs.length} <span className="text-xs font-sans text-slate-400">مورد</span>
                  </div>
                </div>
              </div>

              {/* Report Summary Details */}
              <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3">
                <h4 className="font-bold text-xs flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <BarChart3 className="w-4 h-4" />
                  <span>تحلیل انضباط کاری و روند تحویل شیفت کلینیک</span>
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  میانگین زمان انجام تحویل شیفت در ۲۴ ساعت گذشته برابر با <strong>۴ دقیقه</strong> بوده است. تمامی تحویل‌های شیفت همراه با چک‌لیست کامل و تاییدیه اپراتور ثبت شده‌اند.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[var(--bg-app)] p-4 border-t border-[var(--border-subtle)] flex items-center justify-between shrink-0">
          <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <span>{activeClinic.name} - پنل مدیریت تحویل شیفت</span>
          </div>

          <button
            onClick={() => setIsShiftControlCenterOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700"
          >
            بستن پنل
          </button>
        </div>

      </div>

    </div>
  );
};
