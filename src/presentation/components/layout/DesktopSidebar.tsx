/**
 * VikiMedic v2 - Desktop Navigation Sidebar
 * Clean Architecture Layer: Presentation
 * UI Patch 01: Smart Navigation Sidebar
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  Stethoscope,
  Receipt,
  Pill,
  BarChart3,
  ShieldCheck,
  Settings,
  PlusCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Palette,
  Boxes,
  Bot,
  Award,
  FolderTree,
  Code,
  Database,
  Lock,
  LogOut,
  Layers,
  UserCheck,
} from 'lucide-react';
import { useClinic, AppModule } from '../../../application/ClinicContext';
import { useAuth } from '../../../application/AuthContext';
import { hasPermission } from '../../../domain/permissions';

const SIDEBAR_COLLAPSED_KEY = 'vikimedic_v2_sidebar_collapsed';
const MORE_MODULES_EXPANDED_KEY = 'vikimedic_v2_more_modules_expanded';

interface NavItemConfig {
  id: AppModule;
  labelFA: string;
  icon: React.ReactNode;
  badge?: number | string;
  permissionReq?: any;
}

export const DesktopSidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    activeUser,
    queue,
    patients,
    activeClinic,
    setIsNewPatientModalOpen,
    setIsNewAppointmentModalOpen,
  } = useClinic();

  const { lockScreen, logout } = useAuth();

  // 1. Sidebar Collapsed State
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  // 2. Secondary "More Modules" Collapsible State
  const secondaryModuleIds: AppModule[] = [
    'design_system',
    'architecture',
    'ai_rules',
    'quality_assurance',
    'app_bootstrap',
    'dev_environment',
    'shared_infrastructure',
    'database_architecture',
  ];

  const isSecondaryActive = secondaryModuleIds.includes(activeModule);

  const [isMoreExpanded, setIsMoreExpanded] = useState<boolean>(() => {
    const stored = localStorage.getItem(MORE_MODULES_EXPANDED_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
    return false; // Collapsed by default
  });

  // Auto-expand if active module is inside "More Modules"
  useEffect(() => {
    if (isSecondaryActive && !isMoreExpanded) {
      setIsMoreExpanded(true);
    }
  }, [isSecondaryActive]);

  useEffect(() => {
    localStorage.setItem(MORE_MODULES_EXPANDED_KEY, String(isMoreExpanded));
  }, [isMoreExpanded]);

  const waitingCount = queue.filter((q) => q.status === 'WAITING' || q.status === 'IN_CONSULTATION').length;

  // Primary Navigation Items (Always visible)
  const primaryNavItems: NavItemConfig[] = [
    {
      id: 'dashboard',
      labelFA: 'داشبورد اصلی',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'queue',
      labelFA: 'پذیرش و صف انتظار',
      icon: <Clock className="w-5 h-5 text-indigo-400" />,
      badge: waitingCount > 0 ? `${waitingCount} نفر` : undefined,
      permissionReq: 'VIEW_QUEUE',
    },
    {
      id: 'patients',
      labelFA: 'دفتر پرونده بیماران',
      icon: <Users className="w-5 h-5 text-blue-400" />,
      badge: patients.length,
      permissionReq: 'VIEW_PATIENTS',
    },
    {
      id: 'doctor_emr',
      labelFA: 'پزشکان و پرونده بالینی (EMR)',
      icon: <Stethoscope className="w-5 h-5 text-sky-400" />,
      permissionReq: 'DOCTOR_EMR',
    },
    {
      id: 'financials',
      labelFA: 'سفارشات، صندوق و فاکتورها',
      icon: <Receipt className="w-5 h-5 text-emerald-400" />,
      permissionReq: 'VIEW_FINANCIALS',
    },
    {
      id: 'pharmacy',
      labelFA: 'داروخانه و تجهیزات پزشکی',
      icon: <Pill className="w-5 h-5 text-indigo-400" />,
      permissionReq: 'ACCESS_PHARMACY',
    },
    {
      id: 'medical_staff_center',
      labelFA: 'مرکز کادر درمان',
      icon: <UserCheck className="w-5 h-5 text-emerald-500" />,
      permissionReq: 'MANAGE_STAFF',
    },
    {
      id: 'reports',
      labelFA: 'گزارشات مدیریتی',
      icon: <BarChart3 className="w-5 h-5 text-amber-400" />,
      permissionReq: 'VIEW_REPORTS',
    },
    {
      id: 'staff',
      labelFA: 'مدیریت شیفت‌ها و پرسنل',
      icon: <ShieldCheck className="w-5 h-5 text-blue-400" />,
      permissionReq: 'MANAGE_STAFF',
    },
    {
      id: 'settings',
      labelFA: 'تنظیمات سامانه',
      icon: <Settings className="w-5 h-5 text-slate-400" />,
      permissionReq: 'MANAGE_CLINIC_SETTINGS',
    },
  ];

  // Secondary Navigation Items (Inside "More Modules" Collapsible)
  const secondaryNavItems: NavItemConfig[] = [
    {
      id: 'design_system',
      labelFA: 'سیستم طراحی (Design System)',
      icon: <Palette className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'architecture',
      labelFA: 'معماری و استانداردها',
      icon: <Boxes className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'ai_rules',
      labelFA: 'قوانین دستیار AI',
      icon: <Bot className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'quality_assurance',
      labelFA: 'تضمین کیفیت و حسابرسی (QA)',
      icon: <Award className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'app_bootstrap',
      labelFA: 'پیکربندی زیرساخت (Bootstrap)',
      icon: <FolderTree className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'dev_environment',
      labelFA: 'محیط توسعه و عیب‌یابی',
      icon: <Code className="w-4 h-4 text-sky-400" />,
    },
    {
      id: 'shared_infrastructure',
      labelFA: 'زیرساخت مشترک (Shared Infra)',
      icon: <Boxes className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'database_architecture',
      labelFA: 'معماری دیتابیس (Supabase / Postgres)',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
    },
  ];

  const renderNavItem = (item: NavItemConfig, isSecondary = false) => {
    const isAllowed = !item.permissionReq || hasPermission(activeUser.role, item.permissionReq);
    const isActive = activeModule === item.id;

    return (
      <button
        key={item.id}
        id={`sidebar-nav-${item.id}`}
        disabled={!isAllowed}
        onClick={() => isAllowed && setActiveModule(item.id)}
        title={isCollapsed ? item.labelFA : undefined}
        className={`w-full text-right ${
          isCollapsed
            ? 'px-0 py-2.5 justify-center'
            : isSecondary
            ? 'px-3 py-2 justify-between pr-4'
            : 'px-3 py-2.5 justify-between'
        } rounded-xl text-[13px] font-medium flex items-center transition-all duration-150 hover:translate-x-[-2px] sidebar-item ${
          isActive
            ? 'bg-blue-600 text-white font-bold shadow-md active'
            : isAllowed
            ? 'hover:bg-[var(--bg-sidebar-hover)] text-slate-300 hover:text-white'
            : 'opacity-40 cursor-not-allowed text-slate-500'
        }`}
      >
        <div className="flex items-center gap-3 truncate">
          <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}>{item.icon}</span>
          {!isCollapsed && <span className="truncate">{item.labelFA}</span>}
        </div>

        {!isCollapsed && item.badge !== undefined && (
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
              isActive ? 'bg-white text-blue-700' : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-[var(--bg-sidebar)] text-slate-300 flex flex-col justify-between border-l border-slate-800 shrink-0 select-none no-print transition-all duration-200 relative group/sidebar`}
    >
      {/* Sidebar Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3.5 top-3.5 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white p-1 rounded-full shadow-md z-20 transition hover:scale-110"
        title={isCollapsed ? 'باز کردن منو' : 'جمع کردن منو'}
        aria-label="تغییر وضعیت منوی کناری"
      >
        {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Top Section: Quick Actions & Navigation Groups */}
      <div className="p-2.5 space-y-4 overflow-y-auto max-h-[calc(100vh-80px)] custom-scrollbar">
        {/* Quick Action Buttons */}
        {!isCollapsed ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              id="sidebar-new-patient-btn"
              onClick={() => setIsNewPatientModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>بیمار جدید</span>
            </button>
            <button
              id="sidebar-new-appointment-btn"
              onClick={() => setIsNewAppointmentModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
            >
              <Clock className="w-4 h-4" />
              <span>نوبت سریع</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pt-1">
            <button
              onClick={() => setIsNewPatientModalOpen(true)}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition shadow-sm active:scale-95"
              title="ثبت بیمار جدید (Ctrl+N)"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsNewAppointmentModalOpen(true)}
              className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center transition shadow-sm active:scale-95"
              title="ثبت نوبت سریع (F2)"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PRIMARY NAVIGATION SECTION */}
        <div className="space-y-1.5">
          {!isCollapsed && (
            <div className="px-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>ماژول‌های اصلی</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            </div>
          )}

          {primaryNavItems.map((item) => renderNavItem(item, false))}
        </div>

        {/* SECONDARY NAVIGATION: "MORE MODULES" COLLAPSIBLE */}
        <div className="pt-2 border-t border-slate-800/80">
          {!isCollapsed ? (
            <div className="space-y-1">
              {/* Accordion Toggle Header */}
              <button
                type="button"
                onClick={() => setIsMoreExpanded(!isMoreExpanded)}
                aria-expanded={isMoreExpanded}
                aria-controls="more-modules-section"
                className={`w-full px-3 py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-between transition-all duration-150 ${
                  isSecondaryActive
                    ? 'bg-slate-800/80 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-[var(--bg-sidebar-hover)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className={`w-4 h-4 ${isSecondaryActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>سایر ماژول‌ها (More Modules)</span>
                  {isSecondaryActive && (
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isMoreExpanded ? 'rotate-180 text-blue-400' : 'text-slate-500'
                  }`}
                />
              </button>

              {/* Collapsible Items Container */}
              {isMoreExpanded && (
                <div
                  id="more-modules-section"
                  className="space-y-1 pt-1 pr-2 border-r-2 border-slate-800 mr-3 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  {secondaryNavItems.map((item) => renderNavItem(item, true))}
                </div>
              )}
            </div>
          ) : (
            /* When Sidebar is Collapsed to Icons Only */
            <div className="space-y-1 pt-1">
              {secondaryNavItems.map((item) => renderNavItem(item, true))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Active Clinic Card & User Profile Badge */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950/60 space-y-2">
        {!isCollapsed ? (
          <>
            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-900/60 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-700/40 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="truncate flex-1">
                <div className="text-[11px] font-bold text-slate-200 truncate">{activeClinic.name}</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>پروانه: {activeClinic.licenseNumber}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-0.5">
              <div className="flex items-center gap-1.5 truncate">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="text-slate-300 font-medium truncate">{activeUser.fullName}</span>
              </div>

              {/* Security Action Icons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => lockScreen()}
                  className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 transition"
                  title="قفل سریع صفحه (Lock Screen)"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => logout('MANUAL')}
                  className="p-1 rounded-lg bg-slate-900 hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-slate-800 transition"
                  title="خروج از سامانه"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-1 gap-2">
            <div
              className="w-8 h-8 rounded-xl bg-blue-900/60 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-700/40"
              title={activeClinic.name}
            >
              <Building2 className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
