/**
 * VikiMedic v2 - Reset Protection & Security PIN Management Panel (Administrator Only)
 * Clean Architecture Layer: Presentation Component
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  History,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  Save,
  Info,
  RefreshCw,
} from 'lucide-react';
import { ResetPinService, ResetPinAuditLog } from '../../../infrastructure/resetPinService';
import { useClinic } from '../../../application/ClinicContext';
import { useAuth } from '../../../application/AuthContext';

export const ResetProtectionPanel: React.FC = () => {
  const { activeUser } = useClinic();
  const { verifyCurrentUserPassword } = useAuth();

  const isAdmin = activeUser?.role === 'ADMIN' || activeUser?.role === 'ADMINISTRATOR';

  // PIN Management Local State
  const [isDefaultActive, setIsDefaultActive] = useState<boolean>(true);
  const [lockoutStatus, setLockoutStatus] = useState<{ isLocked: boolean; remainingMinutes: number; failedAttempts: number }>({
    isLocked: false,
    remainingMinutes: 0,
    failedAttempts: 0,
  });

  // Verification Tool State
  const [verifyPinInput, setVerifyPinInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null);

  // Change PIN State
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

  // Admin Force Reset PIN State
  const [adminPassword, setAdminPassword] = useState('');
  const [forceNewPin, setForceNewPin] = useState('');
  const [forceError, setForceError] = useState<string | null>(null);
  const [forceSuccess, setForceSuccess] = useState<string | null>(null);

  // Show/Hide Password Toggles
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<ResetPinAuditLog[]>([]);

  const refreshStatus = () => {
    setIsDefaultActive(ResetPinService.isDefaultPinActive());
    setLockoutStatus(ResetPinService.getLockoutStatus());
    setAuditLogs(ResetPinService.getAuditLogs());
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(() => {
      setLockoutStatus(ResetPinService.getLockoutStatus());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isAdmin) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-3 dir-rtl">
        <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
        <span>دسترسی محدود: مدیریت پین امنیتی پاکسازی داده‌ها (Reset Protection) اختصاصاً مخصوص مدیر ارشد سیستم می‌باشد.</span>
      </div>
    );
  }

  // Handle Verify PIN Test
  const handleVerifyTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyPinInput) return;

    const res = await ResetPinService.verifyPin(verifyPinInput, {
      id: activeUser.id,
      fullName: activeUser.fullName,
      role: activeUser.role,
    });

    if (res.success) {
      setVerifyResult({ success: true, message: 'پین امنیتی وارد شده صحیح و معتبر است.' });
    } else {
      setVerifyResult({ success: false, message: res.error || 'پین وارد شده اشتباه است.' });
    }
    setVerifyPinInput('');
    refreshStatus();
  };

  // Handle Change PIN
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(null);

    if (newPin !== confirmNewPin) {
      setChangeError('پین جدید و تکرار آن یکسان نمی‌باشند.');
      return;
    }

    if (newPin.trim().length < 4) {
      setChangeError('پین جدید باید حداقل ۴ رقم باشد.');
      return;
    }

    const res = await ResetPinService.changePin(currentPin, newPin, {
      id: activeUser.id,
      fullName: activeUser.fullName,
      role: activeUser.role,
    });

    if (res.success) {
      setChangeSuccess('پین امنیتی با موفقیت تغییر یافت. پین پیش‌فرض اولیه غیرفعال شد.');
      setCurrentPin('');
      setNewPin('');
      setConfirmNewPin('');
      refreshStatus();
    } else {
      setChangeError(res.error || 'خطا در تغییر پین.');
      refreshStatus();
    }
  };

  // Handle Admin Force Reset PIN
  const handleForceResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setForceError(null);
    setForceSuccess(null);

    if (!adminPassword) {
      setForceError('وارد کردن رمز عبور حساب مدیر سیستم الزامی است.');
      return;
    }

    const isPasswordValid = await verifyCurrentUserPassword(adminPassword);
    if (!isPasswordValid) {
      setForceError('رمز عبور مدیر ارشد سیستم اشتباه است.');
      return;
    }

    if (forceNewPin.trim().length < 4) {
      setForceError('پین جدید باید حداقل ۴ رقم باشد.');
      return;
    }

    const res = await ResetPinService.adminForceResetPin(forceNewPin, {
      id: activeUser.id,
      fullName: activeUser.fullName,
      role: activeUser.role,
    });

    if (res.success) {
      setForceSuccess('پین امنیتی جدید با موفقیت ثبت شد و تمام قفل‌های احتمالی آزاد گردید.');
      setAdminPassword('');
      setForceNewPin('');
      refreshStatus();
    } else {
      setForceError(res.error || 'خطا در بازنشانی پین.');
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-[var(--text-main)]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-rose-500/20 text-rose-300 px-3 py-0.5 rounded-full text-xs font-bold border border-rose-400/30 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              محافظت امنیتی پاکسازی
            </span>
            <span className="text-xs text-slate-400">System Management → Security → Reset Protection</span>
          </div>
          <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <span>مدیریت پین امنیتی پاکسازی (Secure Reset PIN Protection)</span>
          </h2>
          <p className="text-xs text-slate-300">
            کنترل دقیق پین امنیتی لایه دوم جهت تایید پاکسازی داده‌ها، رمزنگاری در هش امن و ثبت سوابق لاگ بازنشانی.
          </p>
        </div>

        {/* Lockout & Default Status Indicators */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {isDefaultActive ? (
            <div className="bg-amber-500/20 border border-amber-400/40 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>پین پیش‌فرض اولیه (8585) فعال است</span>
            </div>
          ) : (
            <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>پین شخصی سفارشی فعال است</span>
            </div>
          )}

          {lockoutStatus.isLocked && (
            <div className="bg-rose-600 border border-rose-400 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg">
              <Lock className="w-4 h-4 shrink-0" />
              <span>قفل پاکسازی ({lockoutStatus.remainingMinutes} دقیقه باقی‌مانده)</span>
            </div>
          )}
        </div>
      </div>

      {/* WARNING BANNER FOR DEFAULT PIN 8585 */}
      {isDefaultActive && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 rounded-2xl text-xs space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <span>هشدار امنیتی اولیه: پین پیش‌فرض نصب سیستم (8585) فعال است</span>
          </div>
          <p className="leading-relaxed text-slate-700 dark:text-slate-300">
            جهت حفظ امنیت داده‌های کلینیک و جلوگیری از پاکسازی ناخواسته، حتماً پیش از بهره‌برداری عملیاتی، پین امنیتی پیش‌فرض اولیه (<span className="font-mono font-bold">8585</span>) را تغییر دهید.
          </p>
        </div>
      )}

      {/* LOCKOUT ALERT BANNER */}
      {lockoutStatus.isLocked && (
        <div className="p-4 bg-rose-600 text-white rounded-2xl text-xs space-y-1 shadow-lg font-bold flex items-center gap-3">
          <Lock className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-black text-sm">عملکرد پاکسازی داده‌ها قفل شده است!</h3>
            <p className="text-[11px] text-rose-100 font-normal mt-0.5">
              به دلیل ۵ بار ورود پین اشتباه، عملکرد پاکسازی به مدت ۱۵ دقیقه قفل شده است. زمان باقی‌مانده: {lockoutStatus.remainingMinutes} دقیقه.
            </p>
          </div>
        </div>
      )}

      {/* MAIN GRID: PIN MANAGEMENT & AUDIT LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Change PIN & Verification Tool */}
        <div className="space-y-6">
          {/* Change PIN Form */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
              <KeyRound className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-bold text-sm text-[var(--text-main)]">تغییر پین امنیتی پاکسازی (Change Reset PIN)</h3>
                <p className="text-[11px] text-[var(--text-muted)]">احراز با پین فعلی و ثبت پین جدید</p>
              </div>
            </div>

            {changeError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{changeError}</span>
              </div>
            )}

            {changeSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{changeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePin} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[var(--text-main)] block">پین امنیتی فعلی:</label>
                <div className="relative">
                  <input
                    type={showCurrentPin ? 'text' : 'password'}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="مثال: 8585"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none dir-ltr font-mono text-center font-bold tracking-widest text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPin(!showCurrentPin)}
                    className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[var(--text-main)] block">پین امنیتی جدید:</label>
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="حداقل ۴ رقم"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none dir-ltr font-mono text-center font-bold tracking-widest text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[var(--text-main)] block">تکرار پین جدید:</label>
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    value={confirmNewPin}
                    onChange={(e) => setConfirmNewPin(e.target.value)}
                    placeholder="تکرار پین"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-blue-500 outline-none dir-ltr font-mono text-center font-bold tracking-widest text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow transition"
                >
                  <Save className="w-4 h-4" />
                  <span>ثبت و ذخیره پین جدید</span>
                </button>
              </div>
            </form>
          </div>

          {/* Verification Testing Tool */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
              <ShieldCheck className="w-5 h-5 text-purple-500" />
              <div>
                <h3 className="font-bold text-sm text-[var(--text-main)]">آزمایش و صحت‌سنجی پین (Verify PIN Test)</h3>
                <p className="text-[11px] text-[var(--text-muted)]">بررسی صحت پین امنیتی بدون اجرای پاکسازی واقعی</p>
              </div>
            </div>

            <form onSubmit={handleVerifyTest} className="space-y-3 text-xs">
              <div className="flex gap-2">
                <input
                  type="password"
                  value={verifyPinInput}
                  onChange={(e) => setVerifyPinInput(e.target.value)}
                  placeholder="پین مورد نظر را وارد کنید..."
                  className="flex-1 p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-purple-500 outline-none dir-ltr font-mono text-center font-bold tracking-widest text-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>بررسی صحت</span>
                </button>
              </div>

              {verifyResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    verifyResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {verifyResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{verifyResult.message}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Admin Force Reset & Audit Logs */}
        <div className="space-y-6">
          {/* Admin Force Reset PIN */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
              <UserCheck className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-bold text-sm text-[var(--text-main)]">بازنشانی اضطراری پین (Admin PIN Reset)</h3>
                <p className="text-[11px] text-[var(--text-muted)]">بازنشانی پین فراموش‌شده با تایید رمز عبور حساب مدیر</p>
              </div>
            </div>

            {forceError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{forceError}</span>
              </div>
            )}

            {forceSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forceSuccess}</span>
              </div>
            )}

            <form onSubmit={handleForceResetPin} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[var(--text-main)] block">رمز عبور مدیر ارشد سیستم (Administrator Password):</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-amber-500 outline-none dir-ltr font-mono text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--text-main)] block">پین جدید جایگزین:</label>
                <input
                  type="password"
                  value={forceNewPin}
                  onChange={(e) => setForceNewPin(e.target.value)}
                  placeholder="پین جدید حداقل ۴ رقم"
                  className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:border-amber-500 outline-none dir-ltr font-mono text-center font-bold tracking-widest text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>تایید و بازنشانی مستقیم پین</span>
                </button>
              </div>
            </form>
          </div>

          {/* AUDIT LOG TABLE */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-500" />
                <h3 className="font-bold text-sm text-[var(--text-main)]">سوابق لاگ امنیتی پین (Reset Security Audit Log)</h3>
              </div>
              <button
                onClick={refreshStatus}
                className="text-xs text-blue-600 hover:text-blue-500 font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>به‌روزرسانی</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-64 scrollbar-thin">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] bg-[var(--bg-app)]">
                    <th className="p-2.5 font-bold">کاربر</th>
                    <th className="p-2.5 font-bold">تاریخ و زمان</th>
                    <th className="p-2.5 font-bold">نتیجه</th>
                    <th className="p-2.5 font-bold">دستگاه/IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-[var(--text-muted)]">
                        هیچ سابقه لاگی ثبت نشده است.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[var(--bg-app)]">
                        <td className="p-2.5 font-bold text-[var(--text-main)]">{log.user}</td>
                        <td className="p-2.5 font-mono text-[11px] text-[var(--text-muted)]">
                          {log.date} - {log.time}
                        </td>
                        <td className="p-2.5">
                          {log.result === 'SUCCESS' && (
                            <span className="text-emerald-600 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              موفق
                            </span>
                          )}
                          {log.result === 'FAILED_INVALID_PIN' && (
                            <span className="text-amber-600 font-bold text-[10px] bg-amber-500/10 px-2 py-0.5 rounded-full">
                              پین نادرست
                            </span>
                          )}
                          {log.result === 'LOCKED_5_FAILED_ATTEMPTS' && (
                            <span className="text-rose-600 font-bold text-[10px] bg-rose-500/10 px-2 py-0.5 rounded-full">
                              قفل سیستم
                            </span>
                          )}
                          {log.result === 'PIN_CHANGED' && (
                            <span className="text-blue-600 font-bold text-[10px] bg-blue-500/10 px-2 py-0.5 rounded-full">
                              تغییر پین
                            </span>
                          )}
                          {log.result === 'ADMIN_PIN_RESET' && (
                            <span className="text-purple-600 font-bold text-[10px] bg-purple-500/10 px-2 py-0.5 rounded-full">
                              بازنشانی مدیر
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono text-[10px] text-[var(--text-muted)] truncate max-w-[120px]">
                          {log.ipDevice}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
