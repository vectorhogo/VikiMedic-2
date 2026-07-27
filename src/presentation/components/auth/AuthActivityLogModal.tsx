/**
 * VikiMedic v2 - Security & Authentication Activity Log Modal
 * Clean Architecture Layer: Presentation
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  LogOut,
  AlertTriangle,
  UserCheck,
  KeyRound,
  Search,
  Filter,
  Calendar,
  Clock,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../../application/AuthContext';
import { AuthActionType } from '../../../domain/types';

interface AuthActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthActivityLogModal: React.FC<AuthActivityLogModalProps> = ({ isOpen, onClose }) => {
  const { authLogs } = useAuth();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredLogs = authLogs.filter((log) => {
    const matchesSearch =
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const actionBadgeMap: Record<AuthActionType, { label: string; color: string; icon: React.ReactNode }> = {
    LOGIN_SUCCESS: {
      label: 'ورود موفق',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
    LOGIN_FAILED: {
      label: 'ورود ناموفق',
      color: 'bg-red-500/10 text-red-400 border-red-500/20',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    ACCOUNT_LOCKED: {
      label: 'مسدودی حساب',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: <Lock className="w-3.5 h-3.5" />,
    },
    ACCOUNT_UNLOCKED: {
      label: 'رفع مسدودی',
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    LOGOUT: {
      label: 'خروج از سامانه',
      color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      icon: <LogOut className="w-3.5 h-3.5" />,
    },
    SESSION_TIMEOUT: {
      label: 'انقضای عدم فعالیت',
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    SCREEN_LOCK: {
      label: 'قفل صفحه',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: <Lock className="w-3.5 h-3.5" />,
    },
    SCREEN_UNLOCK: {
      label: 'بازکردن قفل',
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: <KeyRound className="w-3.5 h-3.5" />,
    },
    PASSWORD_CHANGE: {
      label: 'تغییر رمز عبور',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      icon: <KeyRound className="w-3.5 h-3.5" />,
    },
    CREDENTIAL_CREATED: {
      label: 'ایجاد حساب کاربری',
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-vazir animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] text-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">سجل و وقایع امنیتی احراز هویت (Security Audit Trail)</h3>
              <p className="text-xs text-slate-400">ثبت رویدادهای ورود، خروج، تلاش‌های ناموفق و تغییرات نشست کاری</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="px-6 py-3 bg-slate-950/30 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در کاربران، نام یا جزئیات وقایع..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 pl-8 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">همه رویدادهای امنیتی</option>
              <option value="LOGIN_SUCCESS">ورودهای موفق</option>
              <option value="LOGIN_FAILED">ورودهای ناموفق</option>
              <option value="ACCOUNT_LOCKED">حساب‌های مسدودشده</option>
              <option value="LOGOUT">خروج‌ها</option>
              <option value="SCREEN_LOCK">قفل‌های صفحه</option>
              <option value="PASSWORD_CHANGE">تغییر رمز عبور</option>
            </select>
          </div>
        </div>

        {/* Logs Table Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Shield className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-xs">هیچ واقعه امنیتی با فیلترهای مشخص‌شده ثبت نشده است.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = actionBadgeMap[log.action] || {
                label: log.action,
                color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                icon: <Layers className="w-3.5 h-3.5" />,
              };

              return (
                <div
                  key={log.id}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 shrink-0 ${badge.color}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{log.fullName}</span>
                        <span className="text-slate-500 text-[11px]">({log.username})</span>
                        <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.2 rounded font-mono">
                          {log.userRole}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">{log.details}</p>
                    </div>
                  </div>

                  <div className="text-left text-[11px] text-slate-500 flex flex-col items-end gap-0.5">
                    <span className="font-mono text-slate-400">{log.timestamp}</span>
                    <span className="text-[10px] text-slate-600">{log.device}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>تعداد کل سوابق ثبت‌شده: {filteredLogs.length} مورد</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition text-xs font-semibold"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
};
