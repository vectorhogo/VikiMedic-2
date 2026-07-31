/**
 * VikiMedic v2 - Professional Executive Clinic Dashboard & Workspace
 * Clean Architecture Layer: Presentation
 * UI Patch 02: Minimal Executive Dashboard
 */

import React, { useState } from 'react';
import {
  Users,
  Clock,
  UserPlus,
  Calendar,
  Building2,
  Receipt,
  BarChart3,
  ShieldCheck,
  Bell,
  Lock,
  Sun,
  Moon,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  Activity,
  Layers,
  Leaf,
} from 'lucide-react';
import { useClinic } from '../../application/ClinicContext';
import { useAuth } from '../../application/AuthContext';
import { useTheme } from '../ThemeContext';
import { ROLE_TITLES_FA, hasPermission } from '../../domain/permissions';

export const DashboardModule: React.FC = () => {
  const {
    activeClinic,
    queue,
    activeUser,
    activeShiftConfig,
    staffList,
    setActiveModule,
    setIsNewPatientModalOpen,
    setIsNewAppointmentModalOpen,
    showContextMenu,
    setIsShiftControlCenterOpen,
  } = useClinic();

  const { lockScreen } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // State for System Announcements Expansion
  const [isAnnouncementsExpanded, setIsAnnouncementsExpanded] = useState(false);
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

  // Computed Clinic Metrics for the 4 Top Information Cards
  const todayPatientsCount = queue.length;
  const waitingQueueCount = queue.filter((q) => q.status === 'WAITING' || q.status === 'IN_CONSULTATION').length;
  const openReceptionsCount = queue.filter((q) => q.status === 'WAITING' || q.status === 'IN_CONSULTATION').length;
  const activeStaffCount = staffList.filter((s) => !s.isDisabled).length;
  const completedTodayCount = queue.filter((q) => q.status === 'COMPLETED').length;

  // System Notifications / Announcements (Max 5 Items)
  const systemAnnouncements = [
    {
      id: 'n1',
      type: 'TASK',
      title: 'تأیید فاکتورهای بیمه سرپایی',
      message: '۳ فاکتور بیمه تامین اجتماعی و خدمات درمان نیازمند برسی و تأیید نهایی مسئول صندوق است.',
      time: '۱۰ دقیقه قبل',
    },
    {
      id: 'n2',
      type: 'WARNING',
      title: 'هشدار آستانه موجودی سرم',
      message: 'موجودی سرم نرمال سالین ۰.۹٪ کمتر از حد آستانه (۵ عدد) می‌باشد. لطفاً نسبت به شارژ انبار اقدام فرمایید.',
      time: '۲۵ دقیقه قبل',
    },
    {
      id: 'n3',
      type: 'INFO',
      title: 'تحویل و شروع شیفت کاری جدید',
      message: 'شیفت کاری عصر کلینیک با موفقیت توسط پرسنل حاضر ثبت و فعال گردید.',
      time: '۴۵ دقیقه قبل',
    },
    {
      id: 'n4',
      type: 'SYSTEM',
      title: 'همگام‌سازی و پشتیبان‌گیری خودکار',
      message: 'پشتیبان‌گیری دوره‌ای اطلاعات و فایل‌های پرونده بیماران روی سرور محلی با موفقیت به پایان رسید.',
      time: '۱ ساعت قبل',
    },
    {
      id: 'n5',
      type: 'INFO',
      title: 'به‌روزرسانی تعرفه‌های بیمه‌ای سال جدید',
      message: 'جدول جدید ضریب K و خدمات عمومی طبق آخرین ابلاغیه وزارت بهداشت در سیستم اعمال گردید.',
      time: '۲ ساعت قبل',
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 text-[var(--text-main)] max-w-[1600px] mx-auto page-fade-in dir-rtl">
      {/* ============================================================ */}
      {/* 1. TOP EXECUTIVE HEADER BANNER */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden border border-slate-800/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          {/* User Welcome & Clinic Status */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-xl font-bold border border-blue-400/30 flex items-center gap-1.5 backdrop-blur-md">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{activeClinic.name}</span>
              </span>
              {activeShiftConfig && (
                <span
                  onClick={() => setIsShiftControlCenterOpen(true)}
                  className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 px-3 py-1 rounded-xl font-bold border border-emerald-400/30 flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition"
                  title="کلیک جهت مشاهده مرکز کنترل شیفت"
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    شیفت جاری: {activeShiftConfig.shiftNameFa} ({activeShiftConfig.startTime} الی {activeShiftConfig.endTime})
                  </span>
                </span>
              )}
              <span className="bg-slate-800/80 text-slate-300 px-3 py-1 rounded-xl border border-slate-700/80 font-mono tabular-nums text-xs">
                {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black text-xl shadow-lg border border-blue-400/30 shrink-0">
                {activeUser.fullName.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                  <span>خوش‌آمدید، {activeUser.fullName}</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-medium">
                    {ROLE_TITLES_FA[activeUser.role]}
                  </span>
                </h1>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  میز کار اجرایی کلینیک. خلاصه آمار عملکرد، صف انتظار سالن و دسترسی‌های سریع در دسترس شماست.
                </p>
              </div>
            </div>
          </div>

          {/* Header Controls: Theme & Quick Lock */}
          <div className="flex items-center gap-2 shrink-0">

            <button
              onClick={() => lockScreen()}
              className="bg-slate-800/90 hover:bg-slate-700 text-amber-400 hover:text-amber-300 px-3.5 py-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2 text-xs font-bold shadow-sm active:scale-95"
              title="قفل سریع صفحه (Ctrl+L)"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">قفل صفحه</span>
            </button>

            <button
              onClick={toggleTheme}
              className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 transition text-xs font-bold shadow-sm active:scale-95"
              title="تغییر حالت تم"
            >
              {theme === 'clinic-olive' ? (
                <Leaf className="w-4 h-4 text-[#A7AE8A]" />
              ) : theme === 'theme-dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : theme === 'theme-rose' ? (
                <Sparkles className="w-4 h-4 text-rose-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Ambient Glow Accent */}
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ============================================================ */}
      {/* 2. TOP INFORMATION CARDS (EXACTLY 4 CARDS) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Today's Patients */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-subtle)] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-blue-500 transition">بیماران امروز</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl md:text-4xl font-black font-mono tabular-nums text-blue-600 dark:text-blue-400">
              {todayPatientsCount}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{completedTodayCount} ویزیت خاتمه‌یافته</span>
            </div>
          </div>
        </div>

        {/* Card 2: Waiting Queue */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-subtle)] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-amber-500 transition">صف انتظار</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl md:text-4xl font-black font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {waitingQueueCount}
            </div>
            <div className="text-xs text-amber-600/90 dark:text-amber-400/90 font-bold mt-1.5 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              <span>حاضر در سالن پذیرش</span>
            </div>
          </div>
        </div>

        {/* Card 3: Open Receptions */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-subtle)] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-sky-500 transition">پذیرش‌های باز</span>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl md:text-4xl font-black font-mono tabular-nums text-sky-600 dark:text-sky-400">
              {openReceptionsCount}
            </div>
            <div className="text-xs text-sky-600/90 dark:text-sky-400/90 font-bold mt-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>پرونده‌های فعال امروز</span>
            </div>
          </div>
        </div>

        {/* Card 4: Active Users */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-subtle)] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)] group-hover:text-indigo-500 transition">کاربران فعال</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl md:text-4xl font-black font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
              {activeStaffCount}
            </div>
            <div className="text-xs text-indigo-600/90 dark:text-indigo-400/90 font-bold mt-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>پرسنل حاضر در شیفت</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. QUICK ACTIONS (2 x 2 GRID OF LARGE SQUARE BUTTONS) */}
      {/* ============================================================ */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[var(--text-main)]">دسترسی سریع به عملیات کلینیک</h2>
              <p className="text-[11px] text-[var(--text-muted)]">میانبرهای اصلی برای ثبت بیمار، پذیرش، فاکتور و گزارشات</p>
            </div>
          </div>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] px-3 py-1 rounded-xl font-medium border border-[var(--border-subtle)]">
            ۴ عملیات کلیدی
          </span>
        </div>

        {/* 2 x 2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action 1: New Patient */}
          <button
            id="qa-btn-new-patient"
            disabled={!hasPermission(activeUser.role, 'CREATE_PATIENTS')}
            onClick={() => setIsNewPatientModalOpen(true)}
            className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-blue-100/40 dark:from-blue-950/30 dark:to-blue-900/10 hover:from-blue-100 dark:hover:from-blue-900/40 border border-blue-200/80 dark:border-blue-800/40 text-right transition-all duration-200 hover:scale-[1.01] hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed group flex items-start gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition duration-200">
              <UserPlus className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-blue-900 dark:text-blue-200 flex items-center gap-2">
                <span>ثبت بیمار جدید</span>
                <span className="text-[10px] bg-blue-200/60 dark:bg-blue-800/60 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-mono">
                  Ctrl+N
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                تشکیل پرونده اولیه، ثبت مشخصات شناسنامه‌ای، بیمه و شماره تماس بیمار جدید کلینیک.
              </p>
            </div>
          </button>

          {/* Action 2: Reception */}
          <button
            id="qa-btn-new-reception"
            disabled={!hasPermission(activeUser.role, 'MANAGE_QUEUE')}
            onClick={() => setIsNewAppointmentModalOpen(true)}
            className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/40 dark:from-emerald-950/30 dark:to-emerald-900/10 hover:from-emerald-100 dark:hover:from-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/40 text-right transition-all duration-200 hover:scale-[1.01] hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed group flex items-start gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition duration-200">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <span>پذیرش و نوبت‌دهی</span>
                <span className="text-[10px] bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                  F2
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                پذیرش بیمار در صف سالن انتظار، تخصیص پزشک معالج و فراخوان شماره نوبت.
              </p>
            </div>
          </button>

          {/* Action 3: New Invoice */}
          <button
            id="qa-btn-new-invoice"
            disabled={!hasPermission(activeUser.role, 'CREATE_INVOICE')}
            onClick={() => setActiveModule('financials')}
            className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-amber-100/40 dark:from-amber-950/30 dark:to-amber-900/10 hover:from-amber-100 dark:hover:from-amber-900/40 border border-amber-200/80 dark:border-amber-800/40 text-right transition-all duration-200 hover:scale-[1.01] hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed group flex items-start gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition duration-200">
              <Receipt className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <span>صدور فاکتور و تسویه</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                ثبت خدمات بالینی، محاسبه سهم بیمه، دریافت وجه صندوق و صدور فاکتور رسمی.
              </p>
            </div>
          </button>

          {/* Action 4: Daily Reports */}
          <button
            id="qa-btn-daily-reports"
            disabled={!hasPermission(activeUser.role, 'VIEW_REPORTS')}
            onClick={() => setActiveModule('reports')}
            className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/80 to-purple-100/40 dark:from-purple-950/30 dark:to-purple-900/10 hover:from-purple-100 dark:hover:from-purple-900/40 border border-purple-200/80 dark:border-purple-800/40 text-right transition-all duration-200 hover:scale-[1.01] hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed group flex items-start gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition duration-200">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-purple-900 dark:text-purple-200 flex items-center gap-2">
                <span>گزارشات و تحلیل روزانه</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                مشاهده گزارشات جامع عملکرد، آمار پذیرش، درآمد صندوق و نمودارهای مدیریتی.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MAIN WORKSPACE: WAITING QUEUE STREAM & SYSTEM ANNOUNCEMENTS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waiting Room Queue Stream (2 Columns) */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-[var(--text-main)]">صف انتظار سالن پذیرش</h2>
                <p className="text-[11px] text-[var(--text-muted)]">وضعیت نوبت‌های فعال بیماران در کلینیک</p>
              </div>
            </div>

            <button
              onClick={() => setActiveModule('queue')}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <span>مدیریت کامل صف</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                  <th className="p-3 font-bold">شماره نوبت</th>
                  <th className="p-3 font-bold">نام بیمار</th>
                  <th className="p-3 font-bold">شماره پرونده</th>
                  <th className="p-3 font-bold">پزشک معالج</th>
                  <th className="p-3 font-bold">زمان حضور</th>
                  <th className="p-3 font-bold">وضعیت نوبت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      هیچ نوبتی برای امروز ثبت نشده است.
                    </td>
                  </tr>
                ) : (
                  queue.map((item) => (
                    <tr
                      key={item.id}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        showContextMenu(e.clientX, e.clientY, 'queue', item);
                      }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-context-menu"
                    >
                      <td className="p-3 font-bold font-mono text-blue-600 dark:text-blue-400">
                        #{item.queueNumber}
                      </td>
                      <td className="p-3 font-bold">{item.patientName}</td>
                      <td className="p-3 font-mono text-[var(--text-muted)]">{item.fileNumber}</td>
                      <td className="p-3">{item.doctorName}</td>
                      <td className="p-3 font-mono text-[var(--text-muted)]">{item.scheduledTime}</td>
                      <td className="p-3">
                        {item.status === 'IN_CONSULTATION' && (
                          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-bold text-[10px] animate-pulse flex items-center gap-1.5 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                            <span>در حال معاینه</span>
                          </span>
                        )}
                        {item.status === 'WAITING' && (
                          <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full font-bold text-[10px] w-fit block">
                            در انتظار
                          </span>
                        )}
                        {item.status === 'COMPLETED' && (
                          <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full font-bold text-[10px] w-fit block">
                            تکمیل شده
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Announcements & Latest Notifications (1 Column - Max 5 Items, Expandable) */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-[var(--text-main)]">اعلامیه‌ها و اعلانات سیستم</h2>
            </div>
            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full">
              ۵ پیام اخیر
            </span>
          </div>

          {/* List of Max 5 Items */}
          <div className="space-y-2.5">
            {systemAnnouncements.slice(0, 5).map((notice) => {
              const isExpanded = expandedNoticeId === notice.id;

              return (
                <div
                  key={notice.id}
                  onClick={() => setExpandedNoticeId(isExpanded ? null : notice.id)}
                  className="p-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-blue-500/40 transition cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <div className="flex items-center gap-1.5">
                      {notice.type === 'TASK' && <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />}
                      {notice.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                      {notice.type === 'INFO' && <Info className="w-4 h-4 text-emerald-500 shrink-0" />}
                      {notice.type === 'SYSTEM' && <Zap className="w-4 h-4 text-purple-500 shrink-0" />}
                      <span className="text-[var(--text-main)]">{notice.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-[var(--text-muted)] font-mono tabular-nums">{notice.time}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  <p
                    className={`text-xs text-[var(--text-muted)] leading-relaxed transition-all duration-200 ${
                      isExpanded ? 'line-clamp-none pt-1' : 'line-clamp-1'
                    }`}
                  >
                    {notice.message}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

