/**
 * VikiMedic v2 - Active Sessions & Session History Monitor Panel
 * Clean Architecture Layer: Presentation Component
 */

import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Laptop,
  Shield,
  Clock,
  User,
  Power,
  Lock,
  Unlock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  History,
  Trash2,
  Building2,
  Search,
} from 'lucide-react';
import { useClinic } from '../../../application/ClinicContext';
import { useAuth } from '../../../application/AuthContext';
import { AuthSession } from '../../../domain/types';

export const SessionMonitorPanel: React.FC = () => {
  const { staffList, userManagementLogs, setUserStatus, resetUserPassword } = useClinic();
  const { activeSession, authLogs, logout } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Generate simulated active sessions based on staff users + current activeSession
  const generateActiveSessions = (): AuthSession[] => {
    const list: AuthSession[] = [];
    
    // Add current session first if present
    if (activeSession) {
      list.push(activeSession);
    }

    // Add online staff as simulated sessions
    staffList.forEach((st) => {
      if (st.isOnline && st.id !== activeSession?.userId) {
        list.push({
          sessionId: 'sess-active-' + st.id,
          userId: st.id,
          username: st.username || st.fullName.toLowerCase().replace(/\s+/g, '.'),
          fullName: st.fullName,
          role: st.role,
          loginTime: st.lastActiveAt || '۱۴۰۳/۰۵/۰۳ - ۰۸:۳۰:۰۰',
          lastActivity: 'هم‌اکنون (فعال)',
          device: 'Windows Desktop Client / Chrome 126',
          platform: 'Desktop (Offline Native)',
          clinicId: st.clinicIds?.[0] || 'clinic-01',
          clinicName: 'شعبه مرکزی کلینیک',
          authToken: 'token-' + st.id,
          rememberMe: true,
        });
      }
    });

    return list;
  };

  const [sessions, setSessions] = useState<AuthSession[]>(generateActiveSessions());

  // Action Handlers
  const handleTerminateSession = (sessionId: string, userId: string, fullName: string) => {
    if (activeSession?.sessionId === sessionId) {
      if (confirm('شما در حال پایان دادن به نشست کاری جاری خود هستید. آیا مطمئنید؟')) {
        logout('MANUAL');
      }
      return;
    }

    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    alert(`نشست کاری کاربر ${fullName} با موفقیت خاتمه یافت.`);
  };

  const handleTerminateAllOtherSessions = () => {
    if (confirm('آیا از خاتمه تمامی نشست‌های فعال به‌جز نشست فعلی مطمئن هستید؟')) {
      setSessions(activeSession ? [activeSession] : []);
      alert('تمام نشست‌های کاری دیگر با موفقیت خاتمه یافتند.');
    }
  };

  const handleLockUserSession = (userId: string, fullName: string) => {
    setUserStatus(userId, 'LOCKED', 'قفل کردن نشست توسط مدیر سیستم');
    alert(`حساب و نشست کاربر ${fullName} با موفقیت قفل شد.`);
  };

  const handleUnlockUserSession = (userId: string, fullName: string) => {
    setUserStatus(userId, 'ACTIVE', 'رفع قفل حساب توسط مدیر سیستم');
    alert(`قفل حساب کاربر ${fullName} با موفقیت برطرف شد.`);
  };

  const handleForcePasswordReset = (userId: string, fullName: string) => {
    const tempPass = resetUserPassword(userId, undefined, true);
    alert(`رمز عبور کاربر ${fullName} بازنشانی شد. رمز عبور موقت: ${tempPass}`);
  };

  // Filtered lists
  const filteredActiveSessions = sessions.filter(
    (s) =>
      !searchTerm ||
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.device.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
            <Monitor className="w-4 h-4" />
            <span>مانیتورینگ و مدیریت نشست‌های کاری (Session Monitor)</span>
          </div>
          <h3 className="text-lg font-black text-slate-900">نشست‌های فعال و سوابق ورود کاربران</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            کنترل لحظه‌ای نشست‌های متصل به سیستم، امکان خاتمه‌دادن، قفل‌کردن یا اجبار به تغییر رمز عبور.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span>نشست‌های فعال ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>تاریخچه ورود و خروج</span>
          </button>

          {activeTab === 'active' && sessions.length > 1 && (
            <button
              onClick={handleTerminateAllOtherSessions}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Power className="w-4 h-4" />
              <span>خاتمه تمامی نشست‌ها</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="جستجو در نام کاربر، دستگاه یا نام‌کاربری..."
          className="w-full h-10 pr-9 pl-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-500"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
      </div>

      {/* TAB 1: ACTIVE SESSIONS */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActiveSessions.length === 0 ? (
            <div className="col-span-2 p-12 text-center text-slate-400 text-xs">
              هیچ نشست فعالی با الگوی جستجوی شما پیدا نشد.
            </div>
          ) : (
            filteredActiveSessions.map((sess) => {
              const isCurrent = activeSession?.sessionId === sess.sessionId;
              const staffUser = staffList.find((u) => u.id === sess.userId);
              const isLocked = staffUser?.accountStatus === 'LOCKED';

              return (
                <div
                  key={sess.sessionId}
                  className={`p-5 rounded-2xl border transition relative space-y-4 ${
                    isCurrent
                      ? 'bg-emerald-50/50 border-emerald-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute left-4 top-4 px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                      نشست فعلی شما
                    </span>
                  )}

                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center text-base shrink-0">
                      {sess.fullName[0]}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">{sess.fullName}</h4>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-mono font-bold rounded">
                          {sess.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">@{sess.username}</p>
                    </div>
                  </div>

                  {/* Device & Location Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-slate-400 block text-[10px]">دستگاه و سیستم‌عامل:</span>
                      <strong className="text-slate-800 font-medium truncate block">
                        {sess.device || sess.platform}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">شعبه و کلینیک:</span>
                      <strong className="text-slate-800 font-medium truncate block">
                        {sess.clinicName}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">زمان ورود:</span>
                      <strong className="text-slate-800 font-mono text-[11px] block">
                        {sess.loginTime}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px]">آخرین فعالیت:</span>
                      <strong className="text-emerald-700 font-bold text-[11px] block">
                        {sess.lastActivity}
                      </strong>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60 text-xs">
                    {isLocked ? (
                      <button
                        onClick={() => handleUnlockUserSession(sess.userId, sess.fullName)}
                        className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-lg hover:bg-emerald-200 transition flex items-center gap-1 text-[11px]"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>رفع قفل حساب</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLockUserSession(sess.userId, sess.fullName)}
                        className="px-3 py-1.5 bg-amber-100 text-amber-800 font-bold rounded-lg hover:bg-amber-200 transition flex items-center gap-1 text-[11px]"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>قفل نشست</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleForcePasswordReset(sess.userId, sess.fullName)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300 transition flex items-center gap-1 text-[11px]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>بازنشانی رمز</span>
                    </button>

                    <button
                      onClick={() => handleTerminateSession(sess.sessionId, sess.userId, sess.fullName)}
                      className="px-3 py-1.5 bg-rose-100 text-rose-800 font-bold rounded-lg hover:bg-rose-200 transition flex items-center gap-1 text-[11px]"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>اخراج / قطع نشست</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: SESSION HISTORY */}
      {activeTab === 'history' && (
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="p-3.5">زمان و تاریخ ورود</th>
                <th className="p-3.5">نام و شناسه کاربر</th>
                <th className="p-3.5">دستگاه / سیستم‌عامل / مروگر</th>
                <th className="p-3.5">نوع رویداد</th>
                <th className="p-3.5">جزییات نشست</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {authLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    تاریخچه نشستی ثبت نشده است.
                  </td>
                </tr>
              ) : (
                authLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{log.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">@{log.username}</div>
                    </td>

                    <td className="p-3.5 text-slate-700">
                      <div>{log.device || 'Windows Client'}</div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${
                        log.action === 'LOGIN_SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action === 'LOGIN_FAILED'
                          ? 'bg-rose-100 text-rose-800'
                          : log.action === 'SCREEN_LOCK'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-600">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
