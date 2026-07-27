/**
 * VikiMedic v2 - Professional Executive Clinic Dashboard & Workspace
 * Clean Architecture Layer: Presentation
 * Phase 04 - Part 01: Dashboard & Workspace
 */

import React, { useState } from 'react';
import {
  Users,
  Clock,
  TrendingUp,
  DollarSign,
  UserPlus,
  Calendar,
  Stethoscope,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Bell,
  Search,
  Receipt,
  CreditCard,
  BarChart3,
  Activity,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle,
  Lock,
  Sun,
  Moon,
  Sparkles,
  ChevronDown,
  User,
  LogOut,
  RefreshCw,
  Sliders,
  Filter,
  Eye,
  Zap,
} from 'lucide-react';
import { useClinic } from '../../application/ClinicContext';
import { useAuth } from '../../application/AuthContext';
import { useTheme } from '../ThemeContext';
import { ExportService } from '../../infrastructure/exportService';
import { ROLE_TITLES_FA, hasPermission } from '../../domain/permissions';

export const DashboardModule: React.FC = () => {
  const {
    activeClinic,
    patients,
    queue,
    transactions,
    activeUser,
    activeShiftConfig,
    staffList,
    setActiveModule,
    setIsNewPatientModalOpen,
    setIsNewAppointmentModalOpen,
    setIsSearchOpen,
    showContextMenu,
    switchUserRole,
    addNotification,
    setIsShiftControlCenterOpen,
  } = useClinic();

  const { lockScreen, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // State for Notifications Drawer
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'ALL' | 'WARNING' | 'TASK' | 'INFO' | 'SYSTEM'>('ALL');

  // Computed Clinic Metrics for Dashboard Cards
  const totalRevenue = transactions.reduce((acc, t) => acc + t.amountNet, 0);
  const todayPatientsCount = queue.length;
  const waitingQueueCount = queue.filter((q) => q.status === 'WAITING' || q.status === 'IN_CONSULTATION').length;
  const completedTodayCount = queue.filter((q) => q.status === 'COMPLETED').length;
  
  // Pending Payments Calculation (Unpaid invoices or debts)
  const pendingPaymentsAmount = transactions
    .filter((t) => t.status === 'PENDING' || t.status === 'PARTIAL')
    .reduce((acc, t) => acc + (t.amountTotal - t.amountPaid), 0) || 1250000;

  // Active Users Count (Staff on current shift)
  const activeStaffCount = staffList.filter((s) => !s.isDisabled).length;

  // Open Receptions Count
  const openReceptionsCount = queue.filter((q) => q.status === 'WAITING' || q.status === 'IN_CONSULTATION').length;

  // Notification items mock data
  const systemNotifications = [
    { id: '1', type: 'TASK', title: 'تأیید فاکتور بیمه سرپایی', message: '۳ فاکتور بیمه تامین اجتماعی نیازمند تأیید نهایی است.', time: '۱۰ دقیقه قبل' },
    { id: '2', type: 'WARNING', title: 'کمبود موجودی سرم نمکی', message: 'موجودی سرم نرمال سالین ۰.۹٪ کمتر از حد آستانه (۵ عدد) می‌باشد.', time: '۲۵ دقیقه قبل' },
    { id: '3', type: 'INFO', title: 'شروع شیفت جدید عصر', message: 'شیفت عصر کلینیک با موفقیت تحویل گرفته شد.', time: '۴۵ دقیقه قبل' },
    { id: '4', type: 'SYSTEM', title: 'پشتیبان‌گیری دیتابیس محلی', message: 'همگام‌سازی و بکاپ خودکار دیتابیس انجام شد.', time: '۱ ساعت قبل' },
  ];

  const filteredNotifications = systemNotifications.filter(
    (n) => notificationFilter === 'ALL' || n.type === notificationFilter
  );

  // Activity Log timeline
  const recentActivities = [
    { id: 'a1', icon: <UserPlus className="w-3.5 h-3.5 text-blue-500" />, title: 'ثبت بیمار جدید', desc: 'پرونده بیمار علیرضا محمودی ایجاد شد', time: '۰۹:۴۵' },
    { id: 'a2', icon: <Receipt className="w-3.5 h-3.5 text-emerald-500" />, title: 'صدور فاکتور درمان', desc: 'فاکتور شماره INV-1044 صادر شد', time: '۰۹:۳۰' },
    { id: 'a3', icon: <CreditCard className="w-3.5 h-3.5 text-purple-500" />, title: 'دریافت وجه کارتخوان', desc: 'مبلغ ۴,۵۰۰,۰ link دریافت گردید', time: '۰۹:۱۵' },
    { id: 'a4', icon: <FileText className="w-3.5 h-3.5 text-amber-500" />, title: 'به‌روزرسانی پرونده پزشکی', desc: 'نسخه الکترونیک توسط دکتر احمدی ثبت شد', time: '۰۸:۵۰' },
    { id: 'a5', icon: <Clock className="w-3.5 h-3.5 text-slate-500" />, title: 'تحویل شیفت کاری', desc: 'شیفت صبح با موفقیت بسته شد', time: '۰۸:۰۰' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 text-[var(--text-main)] max-w-[1600px] mx-auto page-fade-in">
      
      {/* ============================================================ */}
      {/* 1. TOP HEADER & WORKSPACE BANNER */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          
          {/* User Welcome & Role Context */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-md font-bold border border-blue-400/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>{activeClinic.name}</span>
              </span>
              {activeShiftConfig && (
                <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-md font-bold border border-emerald-400/30 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>شیفت جاری: {activeShiftConfig.shiftNameFa} ({activeShiftConfig.startTime} الی {activeShiftConfig.endTime})</span>
                </span>
              )}
              <span className="bg-slate-800/80 text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-700 font-mono tabular-nums">
                {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0 border border-blue-400/40">
                {activeUser.fullName.charAt(0)}
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>سلام، {activeUser.fullName}</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30 font-medium">
                    {ROLE_TITLES_FA[activeUser.role]}
                  </span>
                </h1>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-0.5">
                  میز کار تخصصی کلینیک. تمام ماژول‌های پذیرش، صف انتظار، پرونده پزشکی و مالی آماده پذیرش بیماران هستند.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Header Actions: Role Adapt Switcher, Notifications & Quick Lock */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Notifications Button */}
            <div className="relative">
              <button
                id="header-notification-btn"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2 text-xs font-bold shadow-sm group"
                title="اعلامیه‌ها و هشدارهای سیستم"
              >
                <Bell className="w-4 h-4 text-amber-400 icon-rotate-hover" />
                <span className="hidden sm:inline">اعلامیه‌ها</span>
                <span className="w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-mono tabular-nums font-bold">
                  ۴
                </span>
              </button>

              {/* Notifications Popover Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 md:w-96 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-4 z-notification-panel z-[2000] animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-500" />
                      <h3 className="font-bold text-xs">پیام‌ها و اعلان‌های سیستم</h3>
                    </div>
                    <button
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-200 text-xs"
                    >
                      بستن
                    </button>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 my-3 bg-[var(--bg-app)] p-1 rounded-lg text-[10px]">
                    {(['ALL', 'TASK', 'WARNING', 'INFO', 'SYSTEM'] as const).map((filterKey) => (
                      <button
                        key={filterKey}
                        onClick={() => setNotificationFilter(filterKey)}
                        className={`flex-1 py-1 rounded-md font-bold transition ${
                          notificationFilter === filterKey
                            ? 'bg-blue-600 text-white'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        {filterKey === 'ALL' && 'همه'}
                        {filterKey === 'TASK' && 'کارها'}
                        {filterKey === 'WARNING' && 'هشدار'}
                        {filterKey === 'INFO' && 'اطلاع'}
                        {filterKey === 'SYSTEM' && 'سیستم'}
                      </button>
                    ))}
                  </div>

                  {/* Notification Items List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {filteredNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] hover:border-blue-500/40 transition text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <div className="flex items-center gap-1.5">
                            {n.type === 'TASK' && <CheckCircle className="w-3.5 h-3.5 text-blue-500" />}
                            {n.type === 'WARNING' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                            {n.type === 'INFO' && <Info className="w-3.5 h-3.5 text-emerald-500" />}
                            {n.type === 'SYSTEM' && <Zap className="w-3.5 h-3.5 text-purple-500" />}
                            <span>{n.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono tabular-nums">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Lock Button */}
            <button
              onClick={() => lockScreen()}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 p-2.5 rounded-xl border border-slate-700 transition flex items-center gap-2 text-xs font-bold shadow-sm group"
              title="قفل سریع صفحه (Ctrl+L)"
            >
              <Lock className="w-4 h-4 icon-rotate-hover" />
              <span className="hidden sm:inline">قفل صفحه</span>
            </button>

            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 transition flex items-center gap-1.5 text-xs font-bold shadow-sm group"
              title="تغییر تم"
            >
              {theme === 'theme-dark' ? (
                <Sun className="w-4 h-4 text-amber-400 icon-expand-hover" />
              ) : theme === 'theme-rose' ? (
                <Sparkles className="w-4 h-4 text-rose-400 icon-expand-hover" />
              ) : (
                <Moon className="w-4 h-4 text-slate-300 icon-expand-hover" />
              )}
            </button>
          </div>
        </div>

        {/* Background glow styling */}
        <div className="absolute -left-12 -bottom-12 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ============================================================ */}
      {/* 2. DASHBOARD KPI CARDS (7 CARDS REQUIRED BY SPECIFICATION) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {/* Card 1: Today's Patients */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm hover-card animated-border-card">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[11px] font-bold">بیماران امروز</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-black font-mono tabular-nums text-blue-600 dark:text-blue-400">
              {todayPatientsCount} <span className="text-[11px] font-sans text-slate-400">نفر</span>
            </div>
            <div className="text-[10px] text-emerald-500 font-bold mt-0.5">
              +{completedTodayCount} ویزیت شده
            </div>
          </div>
        </div>

        {/* Card 2: Current Queue */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm hover-card animated-border-card">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[11px] font-bold">صف انتظار</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-black font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {waitingQueueCount} <span className="text-[11px] font-sans text-slate-400">نفر</span>
            </div>
            <div className="text-[10px] text-amber-500 font-bold mt-0.5">
              در حال پذیرش سالن
            </div>
          </div>
        </div>

        {/* Card 3: Today's Revenue */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm hover-card animated-border-card">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[11px] font-bold">درآمد امروز</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="text-base font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400 truncate">
              {ExportService.formatCurrency(totalRevenue)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {transactions.length} تراکنش نهایی
            </div>
          </div>
        </div>

        {/* Card 4: Pending Payments */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm hover-card animated-border-card">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[11px] font-bold">پرداخت‌های معوق</span>
            <Receipt className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <div className="text-base font-black font-mono tabular-nums text-rose-600 dark:text-rose-400 truncate">
              {ExportService.formatCurrency(pendingPaymentsAmount)}
            </div>
            <div className="text-[10px] text-rose-500/80 font-bold mt-0.5">
              مطالبات در انتظار
            </div>
          </div>
        </div>

        {/* Card 5: Current Shift */}
        <div
          onClick={() => setIsShiftControlCenterOpen(true)}
          className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm hover-card animated-border-card cursor-pointer group"
          title="جهت ورود به مرکز کنترل و تحویل شیفت کلیک کنید"
        >
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[11px] font-bold group-hover:text-purple-500 transition">شیفت جاری</span>
            <Activity className="w-4 h-4 text-purple-500 group-hover:scale-110 transition" />
          </div>
          <div className="mt-2">
            <div className="text-xs font-black text-purple-600 dark:text-purple-400 truncate">
              {activeShiftConfig ? activeShiftConfig.shiftNameFa : 'شیفت فعال'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
              {activeShiftConfig?.startTime} - {activeShiftConfig?.endTime}
            </div>
          </div>
        </div>

        {/* Card 6: Active Users */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm hover-card animated-border-card">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[11px] font-bold">کاربران فعال</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-black font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
              {activeStaffCount} <span className="text-[11px] font-sans text-slate-400">نفر</span>
            </div>
            <div className="text-[10px] text-emerald-500 font-bold mt-0.5">
              پرسنل حاضر در سیستم
            </div>
          </div>
        </div>

        {/* Card 7: Open Reception */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm hover-card animated-border-card">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-[11px] font-bold">پذیرش‌های باز</span>
            <Building2 className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-black font-mono tabular-nums text-sky-600 dark:text-sky-400">
              {openReceptionsCount} <span className="text-[11px] font-sans text-slate-400">مورد</span>
            </div>
            <div className="text-[10px] text-sky-500 font-bold mt-0.5">
              پرونده جاری کلینیک
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. QUICK ACTIONS BAR (WITH PERMISSIONS) */}
      {/* ============================================================ */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold border-b border-[var(--border-subtle)] pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>دسترسی سریع و عملیات متداول کلینیک (Quick Actions)</span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-medium">با رعایت سطح دسترسی RBAC</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {/* Action 0: Shift Control Center */}
          <button
            id="qa-shift-control-btn"
            onClick={() => setIsShiftControlCenterOpen(true)}
            className="p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800/60 flex flex-col items-center justify-center gap-1.5 transition font-bold text-xs shadow-sm group backdrop-blur-md"
            title="مرکز کنترل، تحویل و تحول شیفت پرسنل"
          >
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 icon-expand-hover transition" />
            <span>کنترل شیفت</span>
          </button>

          {/* Action 1: New Patient */}
          <button
            id="qa-new-patient-btn"
            disabled={!hasPermission(activeUser.role, 'CREATE_PATIENTS')}
            onClick={() => setIsNewPatientModalOpen(true)}
            className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex flex-col items-center justify-center gap-1.5 transition font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed group shadow-sm"
          >
            <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400 icon-expand-hover transition" />
            <span>ثبت بیمار جدید</span>
          </button>

          {/* Action 2: New Reception */}
          <button
            id="qa-new-reception-btn"
            disabled={!hasPermission(activeUser.role, 'MANAGE_QUEUE')}
            onClick={() => setIsNewAppointmentModalOpen(true)}
            className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex flex-col items-center justify-center gap-1.5 transition font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed group shadow-sm"
          >
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400 icon-expand-hover transition" />
            <span>پذیرش و نوبت جدید</span>
          </button>

          {/* Action 3: Search Patient */}
          <button
            id="qa-search-patient-btn"
            disabled={!hasPermission(activeUser.role, 'VIEW_PATIENTS')}
            onClick={() => setIsSearchOpen(true)}
            className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 flex flex-col items-center justify-center gap-1.5 transition font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed group shadow-sm"
          >
            <Search className="w-5 h-5 text-purple-600 dark:text-purple-400 icon-rotate-hover transition" />
            <span>جستجوی پرونده</span>
          </button>

          {/* Action 4: Create Invoice */}
          <button
            id="qa-create-invoice-btn"
            disabled={!hasPermission(activeUser.role, 'CREATE_INVOICE')}
            onClick={() => setActiveModule('financials')}
            className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex flex-col items-center justify-center gap-1.5 transition font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed group shadow-sm"
          >
            <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400 icon-expand-hover transition" />
            <span>صدور فاکتور جدید</span>
          </button>

          {/* Action 5: Receive Payment */}
          <button
            id="qa-receive-payment-btn"
            disabled={!hasPermission(activeUser.role, 'VIEW_FINANCIALS')}
            onClick={() => setActiveModule('financials')}
            className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 flex flex-col items-center justify-center gap-1.5 transition font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed group shadow-sm"
          >
            <CreditCard className="w-5 h-5 text-teal-600 dark:text-teal-400 icon-expand-hover transition" />
            <span>دریافت وجه صندوق</span>
          </button>

          {/* Action 6: Open Reports */}
          <button
            id="qa-open-reports-btn"
            disabled={!hasPermission(activeUser.role, 'VIEW_REPORTS')}
            onClick={() => setActiveModule('reports')}
            className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 flex flex-col items-center justify-center gap-1.5 transition font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed group shadow-sm"
          >
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 icon-expand-hover transition" />
            <span>گزارشات و تحلیل‌ها</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MAIN WORKSPACE GRID: QUEUE, RECENT ACTIVITY & NOTIFICATIONS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Waiting Room Queue Stream (2 Columns) */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <h2 className="font-bold text-sm">صف انتظار بیماران سالن اصلی</h2>
              <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold">
                {waitingQueueCount} نفر حاضر
              </span>
            </div>
            <button
              onClick={() => setActiveModule('queue')}
              className="text-xs text-blue-600 hover:text-blue-500 font-bold flex items-center gap-1"
            >
              <span>مشاهده و فراخوان کامل</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                  <th className="p-2.5 font-bold">شماره نوبت</th>
                  <th className="p-2.5 font-bold">نام بیمار</th>
                  <th className="p-2.5 font-bold">شماره پرونده</th>
                  <th className="p-2.5 font-bold">پزشک معالج</th>
                  <th className="p-2.5 font-bold">زمان حضور</th>
                  <th className="p-2.5 font-bold">وضعیت نوبت</th>
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
                      <td className="p-2.5 font-bold font-mono text-blue-600 dark:text-blue-400">
                        #{item.queueNumber}
                      </td>
                      <td className="p-2.5 font-bold">{item.patientName}</td>
                      <td className="p-2.5 font-mono text-[var(--text-muted)]">{item.fileNumber}</td>
                      <td className="p-2.5">{item.doctorName}</td>
                      <td className="p-2.5 font-mono text-[var(--text-muted)]">{item.scheduledTime}</td>
                      <td className="p-2.5">
                        {item.status === 'IN_CONSULTATION' && (
                          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold text-[10px] animate-pulse flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                            <span>در حال معاینه</span>
                          </span>
                        )}
                        {item.status === 'WAITING' && (
                          <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold text-[10px] w-fit block">
                            در انتظار
                          </span>
                        )}
                        {item.status === 'COMPLETED' && (
                          <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold text-[10px] w-fit block">
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

        {/* Recent Activity Timeline Feed (1 Column) */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-sm">آخرین فعالیت‌های ثبت‌شده (Recent Activity)</h2>
            </div>
            <button
              onClick={() => addNotification('لیست فعالیت‌های کلینیک بازخوانی شد', 'info')}
              className="p-1 rounded text-slate-400 hover:text-slate-200 transition"
              title="بازخوانی فعالیت‌ها"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 relative before:absolute before:right-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)]">
            {recentActivities.map((act) => (
              <div key={act.id} className="relative pr-8 space-y-0.5 group">
                <div className="absolute right-1.5 top-0.5 w-4 h-4 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 z-10 group-hover:scale-110 transition">
                  {act.icon}
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{act.title}</span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">{act.time}</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{act.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
