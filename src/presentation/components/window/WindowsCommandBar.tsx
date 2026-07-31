/**
 * VikiMedic v2 - Windows Desktop Top Command Menu Bar
 * Clean Architecture Layer: Presentation
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  UserPlus,
  Calendar,
  Printer,
  Download,
  RefreshCw,
  Sliders,
  HelpCircle,
  FolderOpen,
  DollarSign,
  PlusCircle,
  Clock,
  Users,
  ShieldCheck,
  Lock,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { useAuth } from '../../../application/AuthContext';
import { ExportService } from '../../../infrastructure/exportService';

interface WindowsCommandBarProps {
  onOpenAuthLogs?: () => void;
  onOpenChangePassword?: () => void;
}

export const WindowsCommandBar: React.FC<WindowsCommandBarProps> = ({
  onOpenAuthLogs,
  onOpenChangePassword,
}) => {
  const {
    setIsNewPatientModalOpen,
    setIsNewAppointmentModalOpen,
    patients,
    transactions,
    refreshData,
    setActiveModule,
    setIsSearchOpen,
    addNotification,
    activeShiftConfig,
    shiftConfigs,
    setActiveShiftConfigId,
  } = useClinic();

  const { lockScreen, logout } = useAuth();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Ctrl+L shortcut for Lock Screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        lockScreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lockScreen]);

  const toggleMenu = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const closeMenu = () => setActiveMenu(null);

  return (
    <div className="h-7 bg-[var(--header-bg)] border-b border-[var(--border-subtle)] text-[var(--text-main)] flex items-center justify-between px-2 text-xs select-none relative z-30 font-medium">
      <div className="flex items-center gap-1">
      {/* File Menu (فایل) */}
      <div className="relative">
        <button
          id="menu-file-btn"
          onClick={() => toggleMenu('file')}
          className={`px-2.5 py-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition ${
            activeMenu === 'file' ? 'bg-slate-200 dark:bg-slate-800 font-bold' : ''
          }`}
        >
          فایل (F)
        </button>

        {activeMenu === 'file' && (
          <div className="absolute right-0 mt-1 w-64 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-xl py-1 z-50 text-[var(--text-main)] text-xs">
            <button
              onClick={() => {
                setIsNewPatientModalOpen(true);
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5 text-blue-500" />
                <span>ثبت بیمار جدید</span>
              </div>
              <kbd className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded">Ctrl+N</kbd>
            </button>

            <button
              onClick={() => {
                setIsNewAppointmentModalOpen(true);
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>ثبت نوبت سریع</span>
              </div>
              <kbd className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded">F2</kbd>
            </button>

            <div className="my-1 border-t border-[var(--border-subtle)]" />

            <button
              onClick={() => {
                ExportService.printCurrentView();
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>چاپ صفحه فعلی</span>
              </div>
              <kbd className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded">Ctrl+P</kbd>
            </button>

            <button
              onClick={() => {
                ExportService.exportPatientsToCSV(patients);
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>خروجی لیست بیماران (Excel/CSV)</span>
            </button>

            <button
              onClick={() => {
                ExportService.exportTransactionsToCSV(transactions);
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>خروجی گزارشات مالی (CSV)</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Menu (ویرایش) */}
      <div className="relative">
        <button
          id="menu-edit-btn"
          onClick={() => toggleMenu('edit')}
          className={`px-2.5 py-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition ${
            activeMenu === 'edit' ? 'bg-slate-200 dark:bg-slate-800 font-bold' : ''
          }`}
        >
          ویرایش (E)
        </button>

        {activeMenu === 'edit' && (
          <div className="absolute right-0 mt-1 w-56 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-xl py-1 z-50 text-[var(--text-main)] text-xs">
            <button
              onClick={() => {
                setIsSearchOpen(true);
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-3.5 h-3.5 text-purple-500" />
                <span>جستجو در سیستم</span>
              </div>
              <kbd className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded">Ctrl+K</kbd>
            </button>
            <button
              onClick={() => {
                refreshData();
                addNotification('اطلاعات سیستم با موفقیت همگام‌سازی شد.', 'success');
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
              <span>بازخوانی داده‌ها (Refresh)</span>
            </button>
          </div>
        )}
      </div>

      {/* Modules Menu (نما / ماژول‌ها) */}
      <div className="relative">
        <button
          id="menu-view-btn"
          onClick={() => toggleMenu('view')}
          className={`px-2.5 py-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition ${
            activeMenu === 'view' ? 'bg-slate-200 dark:bg-slate-800 font-bold' : ''
          }`}
        >
          نما (V)
        </button>

        {activeMenu === 'view' && (
          <div className="absolute right-0 mt-1 w-52 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-xl py-1 z-50 text-[var(--text-main)] text-xs">
            <button
              onClick={() => {
                setActiveModule('dashboard');
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              داشبورد مدیریتی
            </button>
            <button
              onClick={() => {
                setActiveModule('patients');
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              دفتر پرونده بیماران
            </button>
            <button
              onClick={() => {
                setActiveModule('queue');
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              صف انتظار و پذیرش
            </button>
            <button
              onClick={() => {
                setActiveModule('doctor_emr');
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              میز کار پزشک و نسخه
            </button>
            <button
              onClick={() => {
                setActiveModule('financials');
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              حسابداری و فاکتورها
            </button>
          </div>
        )}
      </div>

      {/* Tools & Settings Menu (ابزارها) */}
      <div className="relative">
        <button
          id="menu-tools-btn"
          onClick={() => toggleMenu('tools')}
          className={`px-2.5 py-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition ${
            activeMenu === 'tools' ? 'bg-slate-200 dark:bg-slate-800 font-bold' : ''
          }`}
        >
          ابزارها (T)
        </button>

        {activeMenu === 'tools' && (
          <div className="absolute right-0 mt-1 w-56 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-xl py-1 z-50 text-[var(--text-main)] text-xs">
            <button
              onClick={() => {
                setActiveModule('pharmacy');
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>مدیریت داروخانه و انبار</span>
            </button>
            <button
              onClick={() => {
                setActiveModule('medical_staff_center');
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2 font-bold"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>مرکز کادر درمان (پزشکان)</span>
            </button>
            <button
              onClick={() => {
                setActiveModule('staff');
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-500" />
              <span>مدیریت پرسنل و دسترسی‌ها</span>
            </button>
            <button
              onClick={() => {
                setActiveModule('settings');
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>تنظیمات کلینیک و پایگاه‌داده</span>
            </button>
          </div>
        )}
      </div>

      {/* Security Menu (امنیت) */}
      <div className="relative">
        <button
          id="menu-security-btn"
          onClick={() => toggleMenu('security')}
          className={`px-2.5 py-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition ${
            activeMenu === 'security' ? 'bg-slate-200 dark:bg-slate-800 font-bold' : ''
          }`}
        >
          امنیت و حساب (S)
        </button>

        {activeMenu === 'security' && (
          <div className="absolute right-0 mt-1 w-60 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-xl py-1 z-50 text-[var(--text-main)] text-xs">
            <button
              onClick={() => {
                lockScreen();
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>قفل سریع صفحه (Lock Screen)</span>
              </div>
              <kbd className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded">Ctrl+L</kbd>
            </button>

            <button
              onClick={() => {
                onOpenAuthLogs?.();
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>سجل و سوابق امنیتی (Audit Logs)</span>
            </button>

            <button
              onClick={() => {
                onOpenChangePassword?.();
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-500" />
              <span>تغییر رمز عبور حساب کاربری</span>
            </button>

            <div className="my-1 border-t border-[var(--border-subtle)]" />

            <button
              onClick={() => {
                logout('MANUAL');
                closeMenu();
              }}
              className="w-full text-right px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج از سامانه (Logout)</span>
            </button>
          </div>
        )}
      </div>

      {/* Help Menu (راهنما) */}
      <div className="relative">
        <button
          id="menu-help-btn"
          onClick={() => toggleMenu('help')}
          className={`px-2.5 py-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition ${
            activeMenu === 'help' ? 'bg-slate-200 dark:bg-slate-800 font-bold' : ''
          }`}
        >
          راهنما (H)
        </button>

        {activeMenu === 'help' && (
          <div className="absolute right-0 mt-1 w-64 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-xl py-2 px-3 z-50 text-[var(--text-main)] text-xs">
            <div className="font-bold border-b border-[var(--border-subtle)] pb-1 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span>راهنمای کلیدهای میانبر ویکی‌مدیک</span>
            </div>
            <div className="space-y-1 text-[11px] text-[var(--text-muted)]">
              <div className="flex justify-between"><span>ثبت بیمار جدید:</span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Ctrl + N</kbd></div>
              <div className="flex justify-between"><span>ثبت نوبت سریع:</span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">F2</kbd></div>
              <div className="flex justify-between"><span>جستجوی هوشمند:</span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Ctrl + K</kbd></div>
              <div className="flex justify-between"><span>چاپ نسخه/فاکتور:</span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Ctrl + P</kbd></div>
              <div className="flex justify-between"><span>بستن پنجره‌ها:</span><kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">Esc</kbd></div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Active Shift Memory Badge */}
      {activeShiftConfig && (
        <div className="flex items-center gap-2 bg-blue-500/10 dark:bg-blue-900/30 border border-blue-500/20 dark:border-blue-700/40 px-2.5 py-0.5 rounded-full text-[11px] text-blue-700 dark:text-blue-300">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-bold">{activeShiftConfig.shiftNameFa}</span>
          <span className="font-mono text-[10px] dir-ltr text-blue-600/80 dark:text-blue-400/80">({activeShiftConfig.startTime}-{activeShiftConfig.endTime})</span>
          <span className="opacity-30">|</span>
          <span className="truncate max-w-[140px] text-[10px]">پزشک: {activeShiftConfig.assignedStaff.DOCTOR}</span>
          <span className="opacity-30 hidden md:inline">|</span>
          <span className="truncate max-w-[130px] text-[10px] hidden md:inline">پذیرش: {activeShiftConfig.assignedStaff.RECEPTIONIST}</span>
        </div>
      )}
    </div>
  );
};
