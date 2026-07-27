/**
 * VikiMedic v2 - Desktop Navigation Sidebar
 * Clean Architecture Layer: Presentation
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
  Palette,
  Boxes,
  Bot,
  Award,
  FolderTree,
  Code,
  Database,
  Lock,
  LogOut,
} from 'lucide-react';
import { useClinic, AppModule } from '../../../application/ClinicContext';
import { useAuth } from '../../../application/AuthContext';
import { hasPermission } from '../../../domain/permissions';

const SIDEBAR_COLLAPSED_KEY = 'vikimedic_v2_sidebar_collapsed';

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

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const waitingCount = queue.filter((q) => q.status === 'WAITING' || q.status === 'IN_CONSULTATION').length;

  const navItems: {
    id: AppModule;
    labelFA: string;
    icon: React.ReactNode;
    badge?: number | string;
    permissionReq?: any;
  }[] = [
    {
      id: 'dashboard',
      labelFA: 'داشبورد اصلی',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'queue',
      labelFA: 'پذیرش و صف انتظار',
      icon: <Clock className="w-4 h-4" />,
      badge: waitingCount > 0 ? `${waitingCount} نفر` : undefined,
      permissionReq: 'VIEW_QUEUE',
    },
    {
      id: 'patients',
      labelFA: 'دفتر پرونده بیماران',
      icon: <Users className="w-4 h-4" />,
      badge: patients.length,
      permissionReq: 'VIEW_PATIENTS',
    },
    {
      id: 'doctor_emr',
      labelFA: 'پزشکان و EMR',
      icon: <Stethoscope className="w-4 h-4 text-sky-400" />,
      permissionReq: 'DOCTOR_EMR',
    },
    {
      id: 'financials',
      labelFA: 'سفارشات، حسابداری و فاکتورها',
      icon: <Receipt className="w-4 h-4 text-emerald-400" />,
      permissionReq: 'VIEW_FINANCIALS',
    },
    {
      id: 'pharmacy',
      labelFA: 'داروخانه و تجهیزات پزشکی',
      icon: <Pill className="w-4 h-4 text-indigo-400" />,
      permissionReq: 'ACCESS_PHARMACY',
    },
    {
      id: 'reports',
      labelFA: 'گزارشات مدیریتی',
      icon: <BarChart3 className="w-4 h-4 text-amber-400" />,
      permissionReq: 'VIEW_REPORTS',
    },
    {
      id: 'staff',
      labelFA: 'مدیریت شیفت‌ها و پرسنل',
      icon: <ShieldCheck className="w-4 h-4 text-blue-400" />,
      permissionReq: 'MANAGE_STAFF',
    },
    {
      id: 'settings',
      labelFA: 'تنظیمات سامانه',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
      permissionReq: 'MANAGE_CLINIC_SETTINGS',
    },
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
      labelFA: 'تضمین کیفیت (QA)',
      icon: <Award className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'app_bootstrap',
      labelFA: 'پیکربندی زیرساخت (Bootstrap)',
      icon: <FolderTree className="w-4 h-4 text-indigo-400" />,
    },
    {
      id: 'dev_environment',
      labelFA: 'محیط توسعه و ابزارها (Dev Environment)',
      icon: <Code className="w-4 h-4 text-sky-400" />,
    },
    {
      id: 'shared_infrastructure',
      labelFA: 'زیرساخت مشترک (Shared Infrastructure)',
      icon: <Boxes className="w-4 h-4 text-purple-400" />,
    },
    {
      id: 'database_architecture',
      labelFA: 'معماری دیتابیس (Supabase / Postgres)',
      icon: <Database className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-60'
      } bg-[var(--bg-sidebar)] text-slate-300 flex flex-col justify-between border-l border-slate-800 shrink-0 select-none no-print transition-all duration-200 relative group/sidebar`}
    >
      {/* Sidebar Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-3 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white p-1 rounded-full shadow-md z-20 transition"
        title={isCollapsed ? 'باز کردن منو' : 'جمع کردن منو'}
      >
        {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {/* Top Section: Quick Action Buttons & Menu Items */}
      <div className="p-2 space-y-4">
        {/* Quick Action Buttons */}
        {!isCollapsed ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              id="sidebar-new-patient-btn"
              onClick={() => setIsNewPatientModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>بیمار جدید</span>
            </button>
            <button
              id="sidebar-new-appointment-btn"
              onClick={() => setIsNewAppointmentModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>نوبت سریع</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pt-1">
            <button
              onClick={() => setIsNewPatientModalOpen(true)}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition shadow-sm"
              title="ثبت بیمار جدید (Ctrl+N)"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsNewAppointmentModalOpen(true)}
              className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center transition shadow-sm"
              title="ثبت نوبت سریع (F2)"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              منوی اصلی نرم‌افزار
            </div>
          )}

          {navItems.map((item) => {
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
                  isCollapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5 justify-between'
                } rounded-lg text-xs font-medium flex items-center transition sidebar-item ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md active'
                    : isAllowed
                    ? 'hover:bg-[var(--bg-sidebar-hover)] text-slate-300 hover:text-white'
                    : 'opacity-40 cursor-not-allowed text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  {!isCollapsed && <span>{item.labelFA}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white text-blue-700'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Active Clinic Card & User Profile Badge */}
      <div className="p-2 border-t border-slate-800 bg-slate-950/40 space-y-2">
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
                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 transition"
                  title="قفل سریع صفحه (Lock Screen)"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => logout('MANUAL')}
                  className="p-1 rounded bg-slate-900 hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-slate-800 transition"
                  title="خروج از سامانه"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-1">
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
