/**
 * VikiMedic v2 - Screen Lock Modal Overlay
 * Clean Architecture Layer: Presentation
 */

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  Building2,
  Clock,
  LogOut,
  KeyRound,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../../application/AuthContext';

export const LockScreenModal: React.FC = () => {
  const { activeUser, activeSession, unlockScreen, logout } = useAuth();

  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Clock
  const [clockStr, setClockStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockStr(
        now.toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +
          ' - ساعت ' +
          now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password) {
      setErrorMessage('لطفاً رمز عبور را وارد کنید.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await unlockScreen(password);
      if (!result.success) {
        setErrorMessage(result.error || 'رمز عبور وارد شده صحیح نمی‌باشد.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'خطا در بازکردن قفل برنامه.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleTitleMap: Record<string, string> = {
    ADMIN: 'مدیر ارشد سیستم',
    DOCTOR: 'پزشک معالج',
    RECEPTIONIST: 'مسئول پذیرش و نوبت‌دهی',
    CLINIC_MANAGER: 'مدیر کلینیک',
    ACCOUNTANT: 'مدیر مالی و حسابداری',
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 select-none font-vazir animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden text-slate-100">
        
        {/* Decorative Top Glow */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

        {/* Lock Icon Emblem */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center mb-4 shadow-inner">
          <Lock className="w-8 h-8 text-amber-400" />
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-black text-slate-100 mb-1">صفحه کاری قفل شده است</h3>
          <p className="text-xs text-slate-400">
            نشست کاری شما به علت عدم فعالیت یا درخواست قفل گردید.
          </p>
        </div>

        {/* User Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg shrink-0">
            {activeUser?.fullName ? activeUser.fullName.charAt(0) : 'U'}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-100 truncate">
              {activeUser?.fullName || 'کاربر سیستم'}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-blue-400 font-medium">
                {roleTitleMap[activeUser?.role || 'RECEPTIONIST'] || activeUser?.role}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] text-slate-400 truncate">
                {activeSession?.clinicName || 'کلینیک اصلی'}
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              رمز عبور جهت بازکردن قفل:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <span>در حال بررسی...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>بازکردن قفل</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => logout('MANUAL')}
              className="px-3 py-2.5 bg-slate-800 hover:bg-red-950/60 hover:text-red-400 border border-slate-700 rounded-xl text-xs text-slate-300 transition flex items-center justify-center gap-1.5"
              title="خروج از حساب و بازگشت به صفحه ورود"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </form>

        {/* Live Clock Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{clockStr}</span>
        </div>

      </div>
    </div>
  );
};
