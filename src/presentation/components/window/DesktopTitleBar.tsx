/**
 * VikiMedic v2 - Windows Desktop Native Title Bar
 * Clean Architecture Layer: Presentation
 */

import React, { useState, useRef } from 'react';
import {
  Building2,
  ChevronDown,
  Moon,
  Sun,
  Minimize2,
  Square,
  X,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Leaf,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { useTheme } from '../../ThemeContext';
import { ROLE_TITLES_FA } from '../../../domain/permissions';
import { SmartNotificationBell } from '../notification/SmartNotificationBell';

export const DesktopTitleBar: React.FC = () => {
  const {
    activeClinic,
    clinics,
    switchClinic,
    activeUser,
    staffList,
    switchUserRole,
  } = useClinic();

  const { theme, toggleTheme, setIsPinModalOpen, isRoseUnlocked } = useTheme();

  // 5-second logo hold timer state
  const [holdProgress, setHoldProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    setHoldProgress(0);
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / 5000) * 100, 100);
      setHoldProgress(progress);

      if (elapsed >= 5000) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setHoldProgress(0);
        setIsPinModalOpen(true);
      }
    }, 50);
  };

  const cancelHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setHoldProgress(0);
  };

  return (
    <div className="h-9 bg-slate-900 text-slate-300 flex items-center justify-between px-3 select-none border-b border-slate-800 text-xs font-sans z-40">
      {/* Right Side: App Brand, Smart Notification Bell & Multi-Clinic Switcher */}
      <div className="flex items-center gap-2">
        {/* VikiMedic Logo with 5-Second Secret Hold Trigger */}
        <div
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          onClick={() => {
            // Quick click helper hint
            if (holdProgress === 0) {
              // Clicking logo triggers minor pulse or status
            }
          }}
          className="flex items-center gap-2 font-bold text-white tracking-wide cursor-pointer group relative py-1 px-1.5 rounded-md hover:bg-slate-800/80 transition"
          title="نگه‌داشتن لوگو به مدت ۵ ثانیه جهت فعال‌سازی تم رز لوکس (PIN: 8585)"
        >
          <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-sm relative overflow-hidden">
            <Stethoscope className="w-3.5 h-3.5 z-10" />
            {holdProgress > 0 && (
              <div
                className="absolute inset-0 bg-rose-500 transition-all duration-75"
                style={{ height: `${holdProgress}%` }}
              />
            )}
          </div>
          <span className="text-sm font-black text-white group-hover:text-blue-300 transition">VikiMedic</span>
          <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.2 rounded flex items-center gap-1">
            <span>v2 Desktop</span>
            {isRoseUnlocked && <Sparkles className="w-2.5 h-2.5 text-rose-400" />}
          </span>

          {/* Secret hold progress bar overlay */}
          {holdProgress > 0 && (
            <div className="absolute left-0 bottom-0 w-full h-0.5 bg-rose-500 rounded-full animate-pulse" />
          )}
        </div>

        {/* Smart Notification Bell (Top Right Header Placement) */}
        <SmartNotificationBell />

        <div className="h-4 w-px bg-slate-700 mx-0.5" />

        {/* Multi-Clinic Selector Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-800 text-slate-200 font-medium transition text-xs border border-slate-700/60">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="max-w-[180px] truncate">{activeClinic.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <div className="absolute right-0 top-full mt-1 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50 animate-in fade-in duration-100">
            <div className="text-[10px] text-slate-400 font-bold px-2 py-1 uppercase tracking-wider">
              انتخاب شعبه فعال (Multi-Clinic):
            </div>
            {clinics.map((clinic) => (
              <button
                key={clinic.id}
                onClick={() => switchClinic(clinic.id)}
                className={`w-full text-right px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                  clinic.id === activeClinic.id
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="truncate">
                  <div>{clinic.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{clinic.city} - {clinic.phone}</div>
                </div>
                {clinic.id === activeClinic.id && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center Title */}
      <div className="hidden md:flex items-center gap-2 text-slate-400 text-[11px] font-medium">
        <span>سامانه مدیریت یکپارچه درمانگاه و مطب پزشکی</span>
        <span>•</span>
        <span className="text-slate-200 font-bold">{activeClinic.licenseNumber}</span>
      </div>

      {/* Left Side: Role Simulator, Theme Toggle, Window Controls */}
      <div className="flex items-center gap-2">
        {/* Active User & Role Switcher */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-800 text-slate-200 transition text-xs border border-slate-700/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">{activeUser.fullName}</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
              {ROLE_TITLES_FA[activeUser.role]}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <div className="absolute left-0 top-full mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50 text-xs">
            <div className="text-[10px] text-slate-400 font-bold px-2 py-1">
              تغییر سریع نقش کاربر (شبیه‌سازی RBAC):
            </div>
            {staffList.map((staff) => (
              <button
                key={staff.id}
                onClick={() => switchUserRole(staff.role)}
                className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between my-0.5 transition ${
                  staff.role === activeUser.role
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{staff.fullName}</span>
                <span className="text-[10px] text-slate-400">{ROLE_TITLES_FA[staff.role]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-md transition flex items-center gap-1"
          title="تغییر تم (سفید / سبز / تاریک / رز)"
        >
          {theme === 'clinic-olive' ? (
            <Leaf className="w-3.5 h-3.5 text-[#A7AE8A]" />
          ) : theme === 'theme-dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : theme === 'theme-rose' ? (
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-300" />
          )}
        </button>

        {/* Standard Windows Window Controls */}
        <div className="flex items-center mr-1">
          <button
            className="w-8 h-7 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="کوچک‌سازی window"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
          <button
            className="w-8 h-7 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="بزرگ‌سازی window"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            className="w-8 h-7 flex items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white transition rounded-l"
            title="بستن برنامه"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

