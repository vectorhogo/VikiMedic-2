/**
 * VikiMedic v2 - Modern Minimal Login Page
 * Clean Architecture Layer: Presentation
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  HardDrive,
  UserCheck,
  Stethoscope,
  Users,
  Briefcase,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../../../application/AuthContext';
import { LocalStorageManager } from '../../../infrastructure/storage';
import { Clinic, UserRole } from '../../../domain/types';

export const LoginPage: React.FC = () => {
  const { login, getRemainingLockoutTime } = useAuth();

  // State
  const [authMode, setAuthMode] = useState<'USERNAME' | 'EMAIL' | 'PHONE'>('USERNAME');
  const [identifier, setIdentifier] = useState<string>('admin');
  const [password, setPassword] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutMins, setLockoutMins] = useState<number | null>(null);

  // Live Persian Clock
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const loadedClinics = LocalStorageManager.getClinics();
    setClinics(loadedClinics);
    const activeCId = LocalStorageManager.getActiveClinicId() || loadedClinics[0]?.id || '';
    setSelectedClinicId(activeCId);

    const updateClock = () => {
      const now = new Date();
      const dateFa = now.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
      const timeFa = now.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTimeStr(`${dateFa} - ساعت ${timeFa}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update Lockout countdown if locked
  useEffect(() => {
    if (identifier) {
      const remaining = getRemainingLockoutTime(identifier);
      setLockoutMins(remaining);
    }
  }, [identifier]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!identifier.trim()) {
      setErrorMessage(
        authMode === 'EMAIL'
          ? 'لطفاً پست الکترونیک خود را وارد کنید.'
          : authMode === 'PHONE'
          ? 'لطفاً شماره همراه خود را وارد کنید.'
          : 'لطفاً نام کاربری را وارد کنید.'
      );
      return;
    }

    if (!password) {
      setErrorMessage('لطفاً رمز عبور را وارد کنید.');
      return;
    }

    // Sanitize input
    const cleanId = identifier.trim().replace(/['"`;<>\\]/g, '');
    if (cleanId !== identifier.trim()) {
      setErrorMessage('کاراکترهای غیرمجاز در ورود اطلاعات شناسه شناسایی شد.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(cleanId, password, rememberMe, selectedClinicId);
      if (!result.success) {
        setErrorMessage(result.error || 'ورود به سامانه با خطا مواجه شد.');
        if (result.lockedMinutes) {
          setLockoutMins(result.lockedMinutes);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'خطای غیرمنتظره در احراز هویت رخ داد.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Login Helper
  const handleQuickDemoFill = (role: UserRole) => {
    setErrorMessage(null);
    setSelectedClinicId(clinics[0]?.id || 'clinic-01');

    switch (role) {
      case 'ADMIN':
        setAuthMode('USERNAME');
        setIdentifier('admin');
        setPassword('admin123');
        break;
      case 'DOCTOR':
        setAuthMode('USERNAME');
        setIdentifier('doctor');
        setPassword('doctor123');
        break;
      case 'RECEPTIONIST':
        setAuthMode('USERNAME');
        setIdentifier('receptionist');
        setPassword('rec123');
        break;
      case 'CLINIC_MANAGER':
        setAuthMode('USERNAME');
        setIdentifier('manager');
        setPassword('mgr123');
        break;
      case 'ACCOUNTANT':
        setAuthMode('USERNAME');
        setIdentifier('accountant');
        setPassword('acc123');
        break;
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden select-none font-vazir">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Login Container */}
      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 z-10">
        
        {/* Left Side: Brand Identity & Info (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-l border-slate-800 relative">
          
          {/* Header & Logo */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5 shadow-lg shadow-blue-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-emerald-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  VikiMedic v2
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">سامانه هوشمند مدیریت درمانگاهی</p>
              </div>
            </div>

            {/* Clinic Info Banner */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>کلینیک فعال:</span>
              </div>
              <p className="text-sm font-bold text-slate-100">
                {clinics.find((c) => c.id === selectedClinicId)?.name || 'مرکز تخصصی ولیعصر'}
              </p>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>شعبه فعال • کد: {clinics.find((c) => c.id === selectedClinicId)?.code || 'VALI-01'}</span>
              </div>
            </div>

            {/* System Highlights */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>پشتیبانی کامل از عملکرد آفلاین دسکتاپ (Offline First)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                <span>احراز هویت رمزنگاری‌شده SHA-256 و نشست‌های ایمن</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ثبت دقیق سجلاط امنیت و قفل خودکار عدم فعالیت</span>
              </div>
            </div>
          </div>

          {/* Version & Date Clock Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentTimeStr || 'در حال دریافت زمان...'}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>نسخه نرم‌افزار: v2.4.0 (Enterprise)</span>
              <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                DESKTOP-READY
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form (7 Cols) */}
        <div className="lg:col-span-7 p-8 md:p-10 flex flex-col justify-center bg-slate-900/60">
          
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-100 mb-1">ورود به حساب کاربری</h2>
            <p className="text-xs text-slate-400">
              جهت دسترسی به پنل مدیریت درمانگاه، مشخصات احراز هویت خود را وارد نمایید.
            </p>
          </div>

          {/* Auth Mode Tabs (Username / Email / Mobile) */}
          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('USERNAME');
                setIdentifier('admin');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authMode === 'USERNAME'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>نام کاربری</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('EMAIL');
                setIdentifier('admin@vikimedic.ir');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authMode === 'EMAIL'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>پست الکترونیک</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('PHONE');
                setIdentifier('09120000000');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authMode === 'PHONE'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>شماره همراه</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3 animate-shake">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-300">خطای احراز هویت:</p>
                <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                {lockoutMins && lockoutMins > 0 && (
                  <div className="mt-2 font-mono text-[11px] bg-red-950/60 p-2 rounded border border-red-500/20 text-red-200">
                    زمان باقی‌مانده تا رفع مسدودی: حدود {lockoutMins} دقیقه
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Clinic Branch Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                انتخاب مرکز / شعبه درمانگاهی
              </label>
              <div className="relative">
                <select
                  value={selectedClinicId}
                  onChange={(e) => setSelectedClinicId(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer"
                >
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Identifier Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {authMode === 'EMAIL'
                  ? 'پست الکترونیک (Email)'
                  : authMode === 'PHONE'
                  ? 'شماره همراه (Mobile)'
                  : 'نام کاربری (Username)'}
              </label>
              <div className="relative">
                <input
                  type={authMode === 'EMAIL' ? 'email' : 'text'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    authMode === 'EMAIL'
                      ? 'e.g. admin@vikimedic.ir'
                      : authMode === 'PHONE'
                      ? 'e.g. 09120000000'
                      : 'e.g. admin'
                  }
                  required
                  className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
                <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                  {authMode === 'EMAIL' ? (
                    <Mail className="w-4 h-4" />
                  ) : authMode === 'PHONE' ? (
                    <Phone className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">رمز عبور (Password)</label>
                <span className="text-[11px] text-slate-500">حساس به حروف کوچک و بزرگ</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-200 transition"
                  title={showPassword ? 'پنهان کردن رمز' : 'نمایش رمز'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-slate-100 transition">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                />
                <span>مرا به خاطر بسپار (ایجاد نشست کاری پایدار)</span>
              </label>

              <span className="text-[11px] text-slate-500">توکن‌های رمزنگاری توکار</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition active:scale-[0.99] flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>در حال اعتبارسنجی و ورود...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>ورود به سامانه جامع VikiMedic</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill Helper Pills */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ورود سریع آزمایشی بر اساس نقش‌های کاربری:</span>
              </span>
              <span className="text-[10px] text-slate-500">جهت بررسی آسان تست‌ها</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoFill('ADMIN')}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-[11px] font-medium text-slate-200 transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>مدیر سیستم (Admin)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoFill('DOCTOR')}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-[11px] font-medium text-slate-200 transition flex items-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>پزشک معالج</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoFill('RECEPTIONIST')}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-[11px] font-medium text-slate-200 transition flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>سرپرست پذیرش</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoFill('CLINIC_MANAGER')}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-[11px] font-medium text-slate-200 transition flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>مدیر کلینیک</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoFill('ACCOUNTANT')}
                className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-[11px] font-medium text-slate-200 transition flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>حسابدار و مالی</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
